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

    Object.assign(this.opts, options, opts);

    this._readIndex();
    this._appendWS();
  }

  _reload(ws) {
    return (event, path) => {
      if (!_isSocketOpened(ws)) {
        return;
      }

      if (/index\.html$/.test(event)) {
        this.$.html(fs.readFileSync(ROOT + '/index.html').toString());
      }

      ws.send('reload');
    }
  }

  _readIndex() {
    var _index = fs.readFileSync(ROOT + '/index.html').toString();
    this.$ = cheerio.load(_index);
  }

  _appendWS() {
    this.$('body').append(`<script>var ws = new WebSocket('ws://'+location.host); ws.onmessage = function(ev) {if (ev.data === 'reload') {location.replace('');}}</script>`);
  }

  _sendIndex(req, res) {
    res.set('Content-Type', 'text/html');

    let s = new stream.Readable();

    s._read = () => {};
    s.push(this.$.html());
    s.push(null);

    s.pipe(res);
  }

  start() {
    app.use(express.static(ROOT + '/'));

    app.get('/', this._sendIndex.bind(this));
    app.get('*', this._sendIndex.bind(this));

    const server = http.createServer(app)
    .listen(this.opts.port, () => {
      console.log('listening on ', this.opts.port);
    });

    const wss = new WebSocketServer({server: server});

    console.log('server up')

    wss.on('connection', (ws) => {
      console.log('connected');

      chokidar.watch('.', {ignored: /[\/\\]\./})
              .on('change', this._reload(ws).bind(this));
    });

    open('http://localhost:' + this.opts.port);
  }
}
