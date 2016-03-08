"use strict";

const open = require('open');
const http = require('http');
const WS = require('./ws');
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const chalk = require('chalk');
const path = require('path');

const DEFAULT_OPTIONS = require('./options').options;
const file = require('./file');

const app = express();

module.exports = class Server {
  constructor(opts) {
    this.opts = {};
    this.fs = {};
    this.$ = {};
    this.alivrcOptions = {};
    this.httpServer = {};
    this.ws = {};
    this.file = file;

    this.open = open;
    this.root = process.cwd();
    this.alivrcPath = path.join(this.root, '.alivrc');

    this._parseAlivrcOptions(opts);
    this._parseCliOptions(opts);

    this.rootWatchable = path.join(this.root, this.opts.pathIndex);
    this.indexHtmlPath = path.join(this.rootWatchable, 'index.html');
  }

  _parseAlivrcOptions() {
    let _alivrcOptions = {};

    if (file.exists(this.alivrcPath)) {
      _alivrcOptions = JSON.parse(file.read(this.alivrcPath));
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

  _readIndex() {
    this.$ = cheerio.load(file.read(this.indexHtmlPath));

    if (!~this.$.html().indexOf('<base href="/"') && !this.opts.quiet) {
      console.info(chalk.red('Consider using <base href="/" /> in the <head></head> of your index.html so deep routes work correcly.\n'));
    }
  }

  _appendWS() {
    this.$(WS.getConfig().idContainer).remove();
    this.$('body').append(WS.getConfig().html);
  }

  _sendIndex(req, res) {
    res.type('html');

    this._readIndex();
    this._appendWS();

    res.send(this.$.html());
  }

  _initStatic() {
    app.use(express.static(this.root, {index: false}));
    app.use(express.static(this.rootWatchable, {index: false}));

    app.get(/.+/, (req, res) => this._sendIndex(req, res));
  }

  _createHttpServer() {
    this.httpServer = http.createServer(app)
                          .listen(this.opts.port, () => {
                            console.info('server up, port: ', this.opts.port);
                          });
  }

  _createWebSocketServer() {
    this.ws = new WS(this.httpServer);
  }

  _onConnection(cb) {
    this.ws.server.on('connection', (client) => {
      cb(client);
    });
  }

  _openBrowser() {
    if (!this.opts.noBrowser) {
      this.open('http://localhost:' + this.opts.port);
    }
  }

  start() {
    this._initStatic();
    this._createHttpServer();
    this._createWebSocketServer();

    this._onConnection((socket) => {
      let fsWatcher = chokidar.watch('.', {ignored: this.opts.ignore, persistent: true});

      fsWatcher.on('change', (path, ev) => {
        this.ws.sendReload(socket);
        file.log('changed', path, this.opts);
        fsWatcher.close();
      });
    });

    this._openBrowser();
  }
}
