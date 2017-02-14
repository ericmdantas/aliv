"use strict";

const open = require('open');
const http = require('http');
const https = require('https');
const http2 = require('spdy');
const WS = require('./ws');
const express = require('express');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const chalk = require('chalk');
const path = require('path');
const httpProxy = require('http-proxy');
const fs = require('fs');
const {EventEmitter} = require('events');
const compression = require('compression');
const zlib = require('zlib');

const options = require('./options');
const file = require('./file');

module.exports = class Server extends EventEmitter {
  constructor(config) {
    super();

    this.opts = {};
    this.opts.root = config && config.root ? config.root : process.cwd();

    this._alivrcOptions = {};
    this._alivrcPath = path.join(this.opts.root, '.alivrc');

    this._availableOptions = this._copy(options);
    this._app = express();
    this._proxyServer = {};
    this._httpServer = {};
    this._$ = {};
    this._ws = {};
    this._file = file;
    this._open = open;

    this._parseAlivrcOptions();
    this._parseCliOptions(config);
    this._createsProxy();

    this._normalizeOpts();
  }

  start() {
    this._initStatic();
    this._createServer();
    this._createWebSocketServer();
    this._onConnection(() => this._clientConnected());
    this._openBrowser();
  }

  reload() {
    if (!this.opts.reloadDelay) {
        return this._reload();
    }

    setTimeout(() => {
      this._reload();
    }, this.opts.reloadDelay);
  }

  _reload() {
    this.emit('reload');
    this._ws.reload();
  }

  _copy(opts) {
    return Object.assign(JSON.parse(JSON.stringify(opts)), {
      // since ignore is a regex, we have to copy its content
      // otherwise, when copied, it'll become an Object
      ignore: opts.ignore
    });
  }

  _parseAlivrcOptions() {
    let _options = {};

    if (this._file.exists(this._alivrcPath)) {
      _options = JSON.parse(this._file.read(this._alivrcPath));
    }

    this._alivrcOptions = _options;
  }

  _parseCliOptions(config) {
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
      },
      {
        short: 'h2',
        long: 'http2'
      },
      {
        short: 'ro',
        long: 'root'
      },
      {
        short: 'w',
        long: 'watch'
      },
      {
        short: 'st',
        long: 'static'
      },
      {
        short: 'c',
        long: 'cors'
      },
      {
        short: 'rd',
        long: 'reloadDelay'
      }
    ];

    for (var prop in config) {
      for (let i = 0, len = _optionsDescribed.length; i < len; i++) {
        if (prop === _optionsDescribed[i].short) {
          config[_optionsDescribed[i].long] = config[prop];
          break;
        }
      }
    }

    Object.assign(this.opts, this._availableOptions, this._alivrcOptions, config);
  }

  _normalizeOpts() {
    this._rootWatchable = path.join(this.opts.root, this.opts.pathIndex);
    this._indexHtmlPath = path.join(this._rootWatchable, 'index.html');

    this.opts.static.unshift(this.opts.root, this._rootWatchable);

    if (Array.isArray(this.opts.only)) {
      this.opts.only = this.opts.only.map((o) => {
        return (/\*/.test(o) || (o === ".")) ? o : path.join(o, '**/*');
      });
    } else {
      this.opts.only = (/\*/.test(this.opts.only) || (this.opts.only === ".")) ?
                                  this.opts.only :
                                  path.join(this.opts.only, '**/*');
    }

    if (this.opts.http2) {
      this.opts.secure = true;
    }

    this._protocol = this.opts.secure ? https.globalAgent.protocol : http.globalAgent.protocol;
  }

  _createsProxy() {
    if (this.opts.proxy) {
      this.opts.proxyWhen += /\*$/.test(this.opts.proxyWhen) ? '' : '*';
      this._proxyServer = httpProxy.createProxyServer({
        target: this.opts.proxyTarget,
        secure: false
      });
    }
  }

  _readIndex() {
    this._$ = cheerio.load(this._file.read(this._indexHtmlPath));

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
    this._app.use(compression({
      level: zlib.Z_BEST_COMPRESSION,
      threshold: '1kb'
    }));

    this._initCors();

    this.opts.static.forEach((p) => {
      this._app.use(express.static(p, {
        index: false
      }));
    });

    this._initProxy();

    this._app.get(/.+/, (req, res) => this._sendIndex(req, res));
  }

  _initCors() {
    if (!!this.opts.cors) {
      this._app.use(this._cors());
    }
  }

  _cors() {
    let _corsOptions = Object.assign({
      methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      headers: 'Authorization,X-Requested-With,Content-Type',
      credentials: true,
    }, this.opts.cors || {});

    return function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', _corsOptions.methods);
      res.setHeader('Access-Control-Allow-Headers', _corsOptions.headers);
      res.setHeader('Access-Control-Allow-Credentials', _corsOptions.credentials);

      return (req.method === 'OPTIONS') ? res.status(200).end() : next();
    }
  }

  _initProxy() {
    if (this.opts.proxy) {
      this._app.all(this.opts.proxyWhen, (req, res) => {
        this.emit('proxy', {req: req});
        this._proxyServer.web(req, res);
      });

      this._proxyServer.on('proxyReq', (proxyReq, req) => {
        req._proxyReq = proxyReq;
      });

      this._proxyServer.on('error', (err, req, res) => {
        if (req.socket.destroyed && err.code === 'ECONNRESET') {
          req._proxyReq.abort();
        }
      });
    }
  }

  _createHttpServer() {
    const CERT_INFO = {
      ca: [
        fs.readFileSync(path.join(__dirname, 'crt/server.csr'))
      ],
      cert: fs.readFileSync(path.join(__dirname, 'crt/server.crt')),
      key: fs.readFileSync(path.join(__dirname, 'crt/server.key'))
    }

    if (this.opts.http2) {
      return http2.createServer(CERT_INFO, this._app)
                 .listen(this.opts.port, () => {
                   console.info('server alive, running on port: ', this.opts.port);
                 });
    }

    if (this.opts.secure) {
      return https.createServer(CERT_INFO, this._app)
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
    this._httpServer = this._createHttpServer();
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
    if (this.opts.watch) {
      let fsWatcher = chokidar.watch(this.opts.only, {
        ignored: this.opts.ignore,
        persistent: true
      });

      fsWatcher.on('change', (path, ev) => {
        this.emit('file-changed', {path: path});

        this.reload();
        this._file.log('changed', path, this.opts);
        fsWatcher.close();
      });
    }
  }

  _openBrowser() {
    if (!this.opts.noBrowser) {
      this.emit('browser-open');
      this._open(`${this._protocol}//${this.opts.host}:${this.opts.port}`);
    }
  }
}
