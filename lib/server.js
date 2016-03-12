"use strict";

const open = require('open');
const http = require('http');
const WS = require('./ws');
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const chalk = require('chalk');
const path = require('path');
const httpProxy = require('http-proxy');

const DEFAULT_OPTIONS = require('./options').options;
const file = require('./file');

const app = express();

module.exports = class Server {
  constructor(opts) {
    this.opts = {};
    this.alivrcOptions = {};
    this.root = process.cwd();
    this.alivrcPath = path.join(this.root, '.alivrc');

    this._proxyServer = {};
    this._httpServer = {};
    this._$ = {};
    this._ws = {};
    this._file = file;
    this._open = open;

    this._parseAlivrcOptions(opts);
    this._parseCliOptions(opts);
    this._createsProxy();

    this._normalizeOpts();
  }

  _parseAlivrcOptions() {
    let _alivrcOptions = {};

    if (this._file.exists(this.alivrcPath)) {
      _alivrcOptions = JSON.parse(this._file.read(this.alivrcPath));
    }

    this.alivrcOptions = _alivrcOptions;
  }

  _parseCliOptions(opts) {
    let _optionsDescribed = [
      {
        short: 'q',
        long: 'quiet'
      },
      {
        short: 'ign',
        long: 'ignore'
      },
      {
        short: 'nb',
        long: 'noBrowser'
      },
      {
        short: 'p',
        long: 'port'
      },
      {
        short: 'px',
        long: 'proxy'
      },
      {
        short: 'pxt',
        long: 'proxyTarget'
      },
      {
        short: 'pxw',
        long: 'proxyWhen'
      },
      {
        short: 'pi',
        long: 'pathIndex'
      },
      {
        short: 'o',
        long: 'only'
      }
    ];

    for (var prop in opts) {
      for (let i = 0, len = _optionsDescribed.length; i < len; i++) {
        if (prop === _optionsDescribed[i].short) {
          opts[_optionsDescribed[i].long] = opts[prop];
          break;
        }
      }
    }

    Object.assign(this.opts, DEFAULT_OPTIONS, this.alivrcOptions, opts);
  }

  _normalizeOpts() {
    this.rootWatchable = path.join(this.root, this.opts.pathIndex);
    this.indexHtmlPath = path.join(this.rootWatchable, 'index.html');

    if (Array.isArray(this.opts.only)) {
      this.opts.only = this.opts.only.map((o) => {
        return (/\*/.test(o) || (o === ".")) ? o : path.join(o, '**/*');
      });
    }
    else {
      this.opts.only = (/\*/.test(this.opts.only) || (this.opts.only === ".")) ? this.opts.only : path.join(this.opts.only, '**/*');
    }
  }

  _createsProxy() {
    if (this.opts.proxy) {
      this.opts.proxyWhen += /\*$/.test(this.opts.proxyWhen) ? '' : '*';
      this._proxyServer = httpProxy.createProxyServer({target: this.opts.proxyTarget});
    }
  }

  _readIndex() {
    this._$ = cheerio.load(this._file.read(this.indexHtmlPath));

    if (!~this._$.html().indexOf('<base href="/"') && !this.opts.quiet) {
      console.info(chalk.red('Consider using <base href="/" /> in the <head></head> of your index.html so deep routes work correcly.\n'));
    }
  }

  _appendWS() {
    this._$(WS.getConfig().idContainer).remove();
    this._$('body').append(WS.getConfig().html);
  }

  _sendIndex(req, res) {
    res.type('html');

    this._readIndex();
    this._appendWS();

    res.send(this._$.html());
  }

  _initStatic() {
    app.use(express.static(this.root, {index: false}));
    app.use(express.static(this.rootWatchable, {index: false}));

    if (this.opts.proxy) {
      app.all(this.opts.proxyWhen, (req, res) => {
        this._proxyServer.web(req, res);
      });
    }

    app.get(/.+/, (req, res) => this._sendIndex(req, res));
  }

  _createHttpServer() {
    this._httpServer = http.createServer(app)
                          .listen(this.opts.port, () => {
                            console.info('server alive, running on port: ', this.opts.port);
                          });
  }

  _createWebSocketServer() {
    this._ws = new WS(this._httpServer);
  }

  _onConnection(cb) {
    this._ws.server.on('connection', (client) => {
      cb(client);
    });
  }

  _openBrowser() {
    if (!this.opts.noBrowser) {
      this._open('http://127.0.0.1:' + this.opts.port);
    }
  }

  start() {
    this._initStatic();
    this._createHttpServer();
    this._createWebSocketServer();

    this._onConnection((socket) => {
      let fsWatcher = chokidar.watch(this.opts.only, {ignored: this.opts.ignore, persistent: true});

      fsWatcher.on('change', (path, ev) => {
        this._ws.sendReload(socket);
        this._file.log('changed', path, this.opts);
        fsWatcher.close();
      });
    });

    this._openBrowser();
  }
}
