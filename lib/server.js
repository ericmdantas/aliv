'use strict'

const open = require('open')
const http = require('http')
const https = require('https')
const http2 = require('spdy')
const WS = require('./ws')
const express = require('express')
const chokidar = require('chokidar')
const cheerio = require('cheerio')
const chalk = require('chalk')
const path = require('path')
const httpProxy = require('http-proxy')
const fs = require('fs')
const { EventEmitter } = require('events')
const compression = require('compression')
const zlib = require('zlib')

const options = require('./options')
const file = require('./file')
const logger = require('./logger')
const events = require('./events')

module.exports = class Server extends EventEmitter {
  constructor(config) {
    super()

    this.opts = {}
    this.opts.root = config && config.root ? config.root : process.cwd()
    this.opts._proxyOptions = []

    this._alivrcOptions = {}
    this._alivrcPath = path.join(this.opts.root, '.alivrc')

    this._availableOptions = this._copy(options)
    this._app = express()
    this._proxyServers = []
    this._httpServer = {}
    this._$ = {}
    this._ws = {}
    this._file = file
    this._logger = logger
    this._open = open

    this._parseAlivrcOptions()
    this._parseCliOptions(config)

    this._normalizeOpts()
    this._createsProxy()
  }

  start() {
    this._initRoutes()
    this._createServer()
    this._createWebSocketServer()
    this._onConnection(() => this._clientConnected())
    this._openBrowser()
  }

  reload() {
    if (!this.opts.reloadDelay) {
      return this._reload()
    }

    setTimeout(() => {
      this._reload()
    }, this.opts.reloadDelay)
  }

  _reload() {
    this.emit(events.PAGE_RELOAD)
    this._ws.reload()
  }

  _copy(opts) {
    return Object.assign(JSON.parse(JSON.stringify(opts)), {
      // since ignore is a regex, we have to copy its content
      // otherwise, when copied, it'll become an Object
      ignore: opts.ignore
    })
  }

  _parseAlivrcOptions() {
    let _options = {}

    if (this._file.exists(this._alivrcPath)) {
      _options = JSON.parse(this._file.read(this._alivrcPath))
    }

    this._alivrcOptions = _options
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
        short: 'insPort',
        long: 'insecurePort'
      },
      {
        short: 'rhh',
        long: 'redirectHttpToHttps'
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
    ]

    for (let prop in config) {
      for (let i = 0, len = _optionsDescribed.length; i < len; i++) {
        if (prop === _optionsDescribed[i].short) {
          config[_optionsDescribed[i].long] = config[prop]
          break
        }
      }
    }

    Object.assign(this.opts, this._availableOptions, this._alivrcOptions, config)
  }

  _normalizeOpts() {
    this._rootWatchable = path.join(this.opts.root, this.opts.pathIndex)
    this._indexHtmlPath = path.join(this._rootWatchable, 'index.html')

    this.opts.static.unshift(this.opts.root, this._rootWatchable)

    if (Array.isArray(this.opts.only)) {
      this.opts.only = this.opts.only.map((o) => {
        return (/\*/.test(o) || (o === '.')) ? o : path.join(o, '**/*')
      })
    } else {
      this.opts.only = (/\*/.test(this.opts.only) || (this.opts.only === '.')) ?
        this.opts.only :
        path.join(this.opts.only, '**/*')
    }

    if (this.opts.http2) {
      this.opts.secure = true
    }

    if (Array.isArray(this.opts.proxyTarget)) {
      for (let index = 0; index < this.opts.proxyTarget.length; index++) {
        let proxyTarget = this.opts.proxyTarget[index]
        let proxyWhen = this.opts.proxyWhen
        if (Array.isArray(proxyWhen)) {
          proxyWhen = proxyWhen.length > index ? proxyWhen[index] : proxyWhen[0]
        }

        this.opts._proxyOptions.push(
          {
            proxyTarget: proxyTarget,
            proxyWhen: proxyWhen
          }
        )
      }
    } else {
      this.opts._proxyOptions.push(
        {
          proxyTarget: this.opts.proxyTarget,
          proxyWhen: this.opts.proxyWhen
        }
      )
    }

    this._protocol = this.opts.secure ? https.globalAgent.protocol : http.globalAgent.protocol
  }

  _createsProxy() {
    if (this.opts.proxy) {
      for (let index = 0; index < this.opts._proxyOptions.length; index++) {
        let proxyOption = this.opts._proxyOptions[index]
        proxyOption.proxyWhen += /\*$/.test(this.opts.proxyWhen) ? '' : '*'
        if (this._proxyServers.filter(p => p.options.target === proxyOption.proxyTarget).length === 0) {
          this._proxyServers.push(
            httpProxy.createProxyServer({
              target: proxyOption.proxyTarget,
              secure: false
            })
          )
        }
      }
    }
  }

  _readIndex() {
    this._$ = cheerio.load(this._file.read(this._indexHtmlPath))

    if (!~this._$.html().indexOf('<base href="/"') && !this.opts.quiet) {
      this._logger.info(chalk.yellow('Consider using <base href="/" /> in the <head></head> of your index.html so deep routes work correcly.'))
    }
  }

  _appendWS() {
    this._$(WS.getConfig().idContainer).remove()
    this._$('body').append(WS.getConfig().html)
  }

  _sendIndex(req, res) {
    res.type('html')

    this._readIndex()
    this._appendWS()

    res.send(this._$.html())
  }

  _initRoutes() {
    this._app.use(compression({
      level: zlib.Z_BEST_COMPRESSION,
      threshold: '1kb'
    }))

    this._initCors()

    this.opts.static.forEach((p) => {
      this._app.use(express.static(p, {
        index: false
      }))
    })

    this._initProxy()

    this._app.get(/.+/, (req, res) => this._sendIndex(req, res))
  }

  _initCors() {
    if (!!this.opts.cors) {
      this._app.use(this._cors())
    }
  }

  _cors() {
    let _corsOptions = Object.assign({
      methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      headers: 'Authorization,X-Requested-With,Content-Type',
      credentials: true,
    }, this.opts.cors || {})

    return function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
      res.setHeader('Access-Control-Allow-Methods', _corsOptions.methods)
      res.setHeader('Access-Control-Allow-Headers', _corsOptions.headers)
      res.setHeader('Access-Control-Allow-Credentials', _corsOptions.credentials)

      return (req.method === 'OPTIONS') ? res.status(200).end() : next()
    }
  }

  _initProxy() {
    if (this.opts.proxy) {
      for (let index = 0; index < this.opts._proxyOptions.length; index++) {
        let proxyOption = this.opts._proxyOptions[index]
        let proxyServer = this._proxyServers.filter(p => p.options.target === proxyOption.proxyTarget)[0]
        this._app.all(proxyOption.proxyWhen, (req, res) => {
          this.emit(events.REQUEST_PROXY, { req: req })
          proxyServer.web(req, res)
        })

        proxyServer.on('proxyReq', (proxyReq, req) => {
          req._proxyReq = proxyReq
        })

        proxyServer.on('error', (err, req, res) => {
          if (req.socket.destroyed && err.code === 'ECONNRESET') {
            req._proxyReq.abort()
          }
        })
      }
    }
  }

  _createHttpServer() {
    const CERT_INFO = {
      ca: [
        fs.readFileSync(this.opts.ssl.ca)
      ],
      cert: fs.readFileSync(this.opts.ssl.cert),
      key: fs.readFileSync(this.opts.ssl.key)
    }

    if (this.opts.http2) {
      return http2.createServer(CERT_INFO, this._app)
        .listen(this.opts.port, () => this._serverAlive())
    }

    if (this.opts.secure) {
      return https.createServer(CERT_INFO, this._app)
        .listen(this.opts.port, () => this._serverAlive())
    }

    return http.createServer(this._app)
      .listen(this.opts.port, () => this._serverAlive())
  }

  // Log & show the url to access server
  _serverAlive() {
    let type = this.opts.http2 ? 'http2' : (this.opts.secure ? 'https' : 'http')
    let protocol = (type === 'http') ? 'http' : 'https'
    let url = protocol + '://' + this.opts.host
    if ((protocol === 'http' && this.opts.port !== 80) || (protocol === 'https' && this.opts.port !== 443)) {
      url += ':' + this.opts.port
    }
    this._logger.info(type + ' server alive, running on : ' + url)
  }

  _createServer() {
    // Check if one port is below 1024
    // see https://www.w3.org/Daemon/User/Installation/PrivilegedPorts.html &&
    // https://www.google.fr/search?q=node+ports+below+1024
    if (this.opts.port <= 1024 || (this.opts.redirectHttpToHttps && this.opts.insecurePort <= 1024)) {
      let port = (this.opts.port <= 1024) ? this.opts.port : this.opts.insecurePort
      this._logger.warn('You are using the port ' + port + ' which is below or equal to 1024' + "\n" + 'start this script with elevated privileges to avoid EACCESS errors')
    }

    this._httpServer = this._createHttpServer()

    // Redirect http traffic to https
    if (this.opts.redirectHttpToHttps) {
      this._logger.info(chalk.green('will redirect http (' + this.opts.insecurePort + ') traffic to https (' + this.opts.port + ')'))
      // a simple http server with clean 301 redirection
      http.createServer((req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + ':' + this.opts.port + req.url })
        res.end()
      }).listen(this.opts.insecurePort)
    }
  }

  _createWebSocketServer() {
    this._ws = new WS(this._httpServer)
  }

  _onConnection(cb) {
    this._ws.server.on('connection', (client) => {
      this.emit(events.CLIENT_CONNECTED)
      cb()
    })
  }

  _clientConnected() {
    if (this.opts.watch) {
      let fsWatcher = chokidar.watch(this.opts.only, {
        ignored: this.opts.ignore,
        persistent: true
      })

      fsWatcher.on('change', (path, ev) => {
        this.emit(events.FILE_CHANGED, { path: path })

        this.reload()
        this._logger.logFileEvent('CHANGED', path, this.opts)
        fsWatcher.close()
      })
    }
  }

  _openBrowser() {
    if (!this.opts.noBrowser) {
      this.emit(events.PAGE_RELOAD)
      this._open(`${this._protocol}//${this.opts.host}:${this.opts.port}`)
    }
  }
}
