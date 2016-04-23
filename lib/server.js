"use strict";

const open = require('open');
const http = require('http');
const https = require('https');
const WS = require('./ws');
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const chalk = require('chalk');
const path = require('path');
const httpProxy = require('http-proxy');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

const DEFAULT_OPTIONS = require('./options').options;
const file = require('./file');

module.exports = class Server extends EventEmitter {
  constructor(opts) {
    super();

    this.opts = {};
    this.alivrcOptions = {};
    this.root = process.cwd();
    this.alivrcPath = path.join(this.root, '.alivrc');

    this._app = express();
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
      },
      {
        short: 'h',
        long: 'host'
      },
      {
        short: 's',
        long: 'secure'
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

    this.protocol = this.opts.secure ? 'https' : 'http';
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
    this._app.use(express.static(this.root, {index: false}));
    this._app.use(express.static(this.rootWatchable, {index: false}));

    if (this.opts.proxy) {
      this._app.all(this.opts.proxyWhen, (req, res) => {
        this.emit('proxy', {req: req});
        this._proxyServer.web(req, res);
      })

      this._proxyServer.on('proxyReq', (proxyReq, req) => {
        req._proxyReq = proxyReq;
  	  })

  	  this._proxyServer.on('error', (err, req, res) => {
        if (req.socket.destroyed && err.code === 'ECONNRESET') {
          req._proxyReq.abort();
        }
      })
    }

    this._app.get(/.+/, (req, res) => this._sendIndex(req, res));
  }

  _createHttpOrHttpsServer() {
    if (this.opts.secure) {
      let options = {
        ca: [fs.readFileSync(path.join(__dirname, 'crt/server.csr'))],
        cert: fs.readFileSync(path.join(__dirname, 'crt/server.crt')),
        key: fs.readFileSync(path.join(__dirname, 'crt/server.key'))
      }

      return https.createServer(options, this._app)
                   .listen(this.opts.port, () => {
                     console.info('server alive, running on port: ', this.opts.port);
                   });
    }

    return http.createServer(this._app)
               .listen(this.opts.port, () => {
                 console.info('server alive, running on port: ', this.opts.port);
               });
  }

  _createServer() {
    this._httpServer = this._createHttpOrHttpsServer();
  }

  _createWebSocketServer() {
    this._ws = new WS(this._httpServer);
  }

  _onConnection(cb) {
    this._ws.server.on('connection', (client) => {
      this.emit('client-connected');

      cb();
    });
  }

  _clientConnected() {
    let fsWatcher = chokidar.watch(this.opts.only, {ignored: this.opts.ignore, persistent: true});

    fsWatcher.on('change', (path, ev) => {
      this.emit('file-changed', {path: path});

      this.reload();
      this._file.log('changed', path, this.opts);
      fsWatcher.close();
    });
  }

  _openBrowser() {
    if (!this.opts.noBrowser) {
      this.emit('browser-open');
      this._open(`${this.protocol}://${this.opts.host}:${this.opts.port}`);
    }
  }

  reload() {
    this.emit('reload');
    this._ws.reload();
  }

  start() {
    this._initStatic();
    this._createServer();
    this._createWebSocketServer();
    this._onConnection(() => this._clientConnected());
    this._openBrowser();
  }
}
