"use strict";

const fs = require('fs');
const open = require('open');
const http = require('http');
const WebSocketServer = require('ws').Server;
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const sendIndex = require('../lib').sendIndex;
const options = require('./options');

const ROOT = process.cwd();

const app = express();

function _isSocketOpened(ws) {
  return ws.readyState === ws.OPEN;
}

function _reload(ws) {
  return (event, path) => {
    if (!_isSocketOpened(ws)) {
      return;
    }

    console.log('change happened, event: ', event);
    console.log('change happened, path: ', path);

    ws.send('reload');
  }
}

module.exports = function(opts) {
  const port = opts.port || options.port;

  var _index = fs.readFileSync(ROOT + '/index.html').toString();
  const $ = cheerio.load(_index);
  $('body').append("<script>var ws = new WebSocket('ws://'+location.host); ws.onmessage = function(ev) {if (ev.data === 'reload') {location.replace('');}}</script>");

  app.use(express.static(ROOT + '/'));

  app.get('/', sendIndex($.html()));
  app.get('*', sendIndex($.html()));

  const server = http.createServer(app)
  .listen(port, () => {
    console.log('listening on ', port);
  });

  const wss = new WebSocketServer({server: server});

  console.log('server up')

  wss.on('connection', (ws) => {
    console.log('connected');

    chokidar.watch('.', {ignored: /[\/\\]\./})
            .on('change', _reload(ws));
  });

  open('http://localhost:' + port);
}
