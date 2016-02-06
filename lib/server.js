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

const ROOT = process.cwd();

const app = express();

function _isSocketOpened(ws) {
  return ws.readyState === ws.OPEN;
}

module.exports = class Server {
  constructor(opts) {
    this.opts = {};
    this.$ = null;
    this.mod = undefined;

    Object.assign(this.opts, options, opts);

    this.rootIndexHtml = ROOT + '/index.html';

    this._readIndex();
    this._appendWSInIndex();
  }

  _reload(ws) {
    return (event, path) => {
      if (!_isSocketOpened(ws)) {
        return;
      }

      if (/index\.html$/.test(event)) {
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
    this.$('body').append(`
      <script>
        var ws = new WebSocket('ws://'+location.host);
        ws.onmessage = function(ev) {
                          if (ev.data === 'reload') {
                             location.replace('');
                          }
                       }
     </script>`);
  }

  _sendIndex(req, res) {
    res.set('Content-Type', 'text/html');

    let s = new stream.Readable();

    console.log(this.mod || this.$.html());

    s.push(this.mod || this.$.html());
    s.push(null);

    s.pipe(res)
     .on('end', () => this.mod = undefined);
  }

  _startStatic() {
    app.use(express.static(ROOT + '/'));

    app.get('/', (req, res) => this._sendIndex(req, res));
    app.get('*', (req, res) => this._sendIndex(req, res));
  }

  start() {
    this._startStatic();

    const server = http.createServer(app)
    .listen(this.opts.port, () => {
      console.log('listening on ', this.opts.port);
    });

    const wss = new WebSocketServer({server: server});

    console.log('server up');

    wss.on('connection', (ws) => {
      console.log('connected');

      chokidar.watch('.', {ignored: /[\/\\]\./})
              .on('change', (event, path) => this._reload(ws)(event, path));
    });

    open('http://localhost:' + this.opts.port);
  }
}
