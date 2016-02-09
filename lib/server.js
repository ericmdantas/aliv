"use strict";

const fs = require('fs');
const open = require('open');
const http = require('http');
const WebSocketServer = require('ws').Server;
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const options = require('./options');
const stream = require('stream');
const logger = require('./file-status-log');
const chalk = require('chalk');

const ROOT = process.cwd();

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

function _isSocketOpened(ws) {
  return ws.readyState === ws.OPEN;
}

module.exports = class Server {
  constructor(opts) {
    this.opts = {};
    this.$ = null;
    this.open = open;
    this.rootIndexHtml = ROOT + '/index.html';

    Object.assign(this.opts, options, opts);
  }

  _reload(ws) {
    return (path, ev) => {
      if (!_isSocketOpened(ws)) {
        return;
      }

      ws.send('reload');
    }
  }

  _readIndex() {
    this.$ = cheerio.load(fs.readFileSync(this.rootIndexHtml).toString());

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
    app.use(express.static(ROOT, {
      index: false
    }));

    app.get(/.+/, (req, res) => this._sendIndex(req, res));
  }

  start() {
    this._initStatic();

    const server = http.createServer(app)
                       .listen(this.opts.port, () => {
                        console.log('listening on port: ', this.opts.port);
                      });

    const wss = new WebSocketServer({server: server});

    console.log('server up');

    wss.on('connection', (ws) => {
      let fsWatcher = chokidar.watch('.', {
                                            ignored: /[\/\\]\./,
                                            persistent: true
                                          });

      fsWatcher.on('change', (path, ev) => {
        logger('changed', path, this.opts);
        this._reload(ws)(path, ev);
        fsWatcher.close();
      });
    });

    if (!this.opts.noBrowser) {
      this.open('http://localhost:' + this.opts.port);
    }
  }
}
