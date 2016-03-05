"use strict";

const fs = require('fs');
const open = require('open');
const http = require('http');
const WebSocketServer = require('ws').Server;
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const chalk = require('chalk');
const path = require('path');

const DEFAULT_OPTIONS = require('./options');
const logger = require('./file-status-log');

const WS_APPEND_INDEX_HTML = {
  html: `
      <div id="aliv-container" style="display: none;">
        <span>added by aliv</span>
        <script>
          var ws = new WebSocket('ws://'+location.host);
          ws.onmessage = function(ev) {
            if (ev.data === 'reload') {
              location.replace('');
            }
          }
        </script>
      </div>
    `,
  idContainer: '#aliv-container'
}

const app = express();

module.exports = class Server {
  constructor(opts) {
    this.opts = {};
    this.fs = {};
    this.$ = {};
    this.alivrcOptions = {};

    this.open = open;
    this.root = process.cwd();
    this.alivrcPath = path.join(this.root, '.alivrc');

    this._parseAlivrcOptions(opts);
    this._parseCliOptions(opts);

    this.rootWatchable = path.join(this.root, this.opts.pathIndex);
    this.indexHtmlPath = path.join(this.rootWatchable, 'index.html');
  }

  _readFileSync(p) {
    return fs.readFileSync(p).toString();
  }

  _fileExists(p) {
    try {
      fs.statSync(p);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  _parseAlivrcOptions() {
    let _alivrcOptions = {};

    if (this._fileExists(this.alivrcPath)) {
        _alivrcOptions = JSON.parse(this._readFileSync(this.alivrcPath));
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

  _reload(ws) {
    return (path, ev) => {
      if (!this._isSocketOpened(ws)) {
        return;
      }

      ws.send('reload');
    }
  }

  _isSocketOpened(ws) {
    return ws.readyState === ws.OPEN;
  }

  _readIndex() {
    this.$ = cheerio.load(this._readFileSync(this.indexHtmlPath));

    if (!~this.$.html().indexOf('<base href="/"') && !this.opts.quiet) {
      console.log(chalk.red('Consider using <base href="/" /> in the <head></head> of your index.html so deep routes work correcly.\n'));
    }
  }

  _appendWS() {
    this.$(WS_APPEND_INDEX_HTML.idContainer).remove();
    this.$('body').append(WS_APPEND_INDEX_HTML.html);
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

  _createWebSocketServer() {
      const server = http.createServer(app)
                         .listen(this.opts.port, () => {
                           console.log('server up, port: ', this.opts.port);
                         });

      return new WebSocketServer({server: server});
  }

  _onWsConnected(ws) {
    let fsWatcher = chokidar.watch('.', {ignored: this.opts.ignore, persistent: true});

    fsWatcher.on('change', (path, ev) => {
      logger('changed', path, this.opts);
      this._reload(ws)(path, ev);

      fsWatcher.close();
    });
  }

  _openBrowser() {
    if (!this.opts.noBrowser) {
      this.open('http://localhost:' + this.opts.port);
    }
  }

  start() {
    this._initStatic();
    this._createWebSocketServer().on('connection', this._onWsConnected);
    this._openBrowser();
  }
}
