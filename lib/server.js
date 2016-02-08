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
const logger = require('./logger');

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
    this.mod = undefined;
    this.open = open;
    this.rootIndexHtml = ROOT + '/index.html';

    Object.assign(this.opts, options, opts);

    this._readIndex();
    this._appendWSInIndex();
  }

  _reload(ws) {
    return (path, ev) => {
      if (!_isSocketOpened(ws)) {
        return;
      }

      if (/index\.html$/.test(path)) {
        this.mod = fs.readFileSync(this.rootIndexHtml).toString();
      }

      ws.send('reload');
    }
  }

  _readIndex() {
    var _index = fs.readFileSync(this.rootIndexHtml).toString();
    this.$ = cheerio.load(_index);
  }

  _appendWSInIndex() {
    this.$(WS_APPEND_INDEX_HTML.idContainer).remove();
    this.$('body').append(WS_APPEND_INDEX_HTML.html);
  }

  _sendIndex(req, res) {
    res.set('Content-Type', 'text/html');

    let s = new stream.Readable();

    let _index = this.mod || this.$.html();

    this.$ = cheerio.load(_index);
    this._appendWSInIndex();

    s.push(this.$.html());
    s.push(null);

    s.pipe(res)
     .on('end', () => this.mod = undefined);
  }

  _initStatic() {
    app.use(express.static(ROOT));

    app.get('/', (req, res) => this._sendIndex(req, res));
    app.get('*', (req, res) => this._sendIndex(req, res));
  }

  start() {
    this._initStatic();

    const server = http.createServer(app)
                       .listen(this.opts.port, () => {
                        console.log('listening on ', this.opts.port);
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

    this.open('http://localhost:' + this.opts.port);
  }
}
