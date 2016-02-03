#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const open = require('open');
const http = require('http');
const WebSocketServer = require('ws').Server;
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');

const ROOT = process.cwd();
const PORT = argv.port || 3000;

const app = express();

app.use(express.static(ROOT + '/'));

app.get('/', (req, res) => res.send(_html));
app.get('*', (req, res) => res.send(_html));

const server = http.createServer(app)
                   .listen(PORT, () => {
                     console.log('listening on ', PORT);
                   });

const wss = new WebSocketServer({server: server});

var _index = fs.readFileSync(ROOT + '/index.html').toString();

var $ = cheerio.load(_index);

$('body').append("<script>var ws = new WebSocket('ws://'+location.host); ws.onmessage = function(ev) {if (ev.data === 'reload') {location.reload();}}</script>");

var _html = $.html();

fs.writeFileSync(ROOT + '/index.html', _html);

wss.on('connection', (ws) => {
  console.log('connected');

  chokidar.watch('.', {ignored: /[\/\\]\./})
          .on('change', (event, path) => {
            console.log('connected');

            ws.send('reload');
          });
});

open('http://localhost:' + PORT);
