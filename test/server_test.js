"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const fs = require('fs');
const open = require('open');
const file = require('../lib/file');
const sinon = require('sinon');
const path = require('path');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const chokidar = require('chokidar');

let WS = require('../lib/ws');
let Server = require('../lib');

describe('server', () => {
  let _consoleStub;

  before(() => {
    _consoleStub = sinon.stub(console, 'info', () => {});
  });

  after(() => {
    _consoleStub.restore();
  });

  describe('creation', () => {
    it('should instantiate it correctly', () => {
      let _server = new Server();

      expect(_server._$).to.deep.equal({});
      expect(_server.alivrcCfg).to.be.defined;
      expect(_server.root).to.be.defined;
      expect(_server.indexHtmlPath).to.be.defined;
      expect(_server.alivrcPath).to.be.defined;
      expect(_server._httpServer).to.deep.equal({});
      expect(_server._proxyServer).to.deep.equal({});
      expect(_server._ws).to.deep.equal({});
      expect(_server.protocol).to.equal('http');

      expect(_server.opts.host).to.equal('127.0.0.1');
      expect(_server.opts.port).to.equal(1307);
      expect(_server.opts.secure).to.equal(false);
      expect(_server.opts.quiet).to.be.false;
      expect(_server.opts.pathIndex).to.equal('');
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.proxy).to.equal(false);
      expect(_server.opts.proxyTarget).to.equal('');
      expect(_server.opts.proxyWhen).to.equal('');
      expect(_server.opts.only).to.equal('.');
      expect(_server.opts.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");

      expect(_server._file).to.equal(file);
      expect(_server._open).to.equal(open);
    });

    it('should have root correctly it correctly', () => {
      let PATH = "C:\\abc\\1";

      let _pcwdStub = sinon.stub(process, 'cwd', () => PATH);

      let _server = new Server();

      expect(_server.root).to.equal(PATH);
      expect(_server.rootWatchable).to.equal(PATH);
      expect(_server.indexHtmlPath).to.equal(path.join(PATH, 'index.html'));
      expect(_server.alivrcPath).to.equal(path.join(PATH, '.alivrc'));

      _pcwdStub.restore();
    });

    it('should have root correctly it correctly - deeper pathIndex', () => {
      let PATH = "C:\\abc\\1";

      let _pcwdStub = sinon.stub(process, 'cwd', () => PATH);

      let _server = new Server({pathIndex: 'abc123'});

      expect(_server.root).to.equal(PATH);
      expect(_server.indexHtmlPath).to.equal(path.join(PATH, 'abc123/index.html'));
      expect(_server.alivrcPath).to.equal(path.join(PATH, '.alivrc'));

      _pcwdStub.restore();
    });

    it('should have rootWatchable correctly - deeper pathIndex', () => {
      let PATH = "C:\\abc\\1";

      let _pcwdStub = sinon.stub(process, 'cwd', () => PATH);

      let _server = new Server({pathIndex: 'abc123'});

      expect(_server.root).to.equal(PATH);
      expect(_server.rootWatchable).to.equal(path.join(_server.root, 'abc123'));
      expect(_server.indexHtmlPath).to.equal(path.join(PATH, 'abc123/index.html'));
      expect(_server.alivrcPath).to.equal(path.join(PATH, '.alivrc'));

      _pcwdStub.restore();
    });

    it('should switch just a few options', () => {
      let _opts = {
        quiet: true,
        pathIndex: '/abc',
        noBrowser: true
      }

      let _server = new Server(_opts);

      expect(_server.opts.port).to.equal(1307);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathIndex).to.equal('/abc');
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");
    });

    it('should overwrite the options with stuff passed in by the CLI - long description', () => {
      let _opts = {
        port: 9999,
        host: '0.0.0.0',
        quiet: true,
        pathIndex: '123',
        version: '123',
        noBrowser: true,
        ignore: /^js/,
        secure: true
      }

      let _server = new Server(_opts);

      expect(_server.opts.host).to.equal(_opts.host);
      expect(_server.opts.secure).to.equal(_opts.secure);
      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathIndex).to.equal(_opts.pathIndex);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ignore.toString());

      expect(_server.protocol).to.equal('https');
    });

    it('should overwrite the options with stuff passed in by the CLI - should have an http server', () => {
      let _opts = {
        port: 9999,
        host: '0.0.0.0',
        quiet: true,
        pathIndex: '123',
        version: '123',
        noBrowser: true,
        ignore: /^js/,
        secure: false
      }

      let _server = new Server(_opts);

      expect(_server.opts.host).to.equal(_opts.host);
      expect(_server.opts.secure).to.equal(_opts.secure);
      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathIndex).to.equal(_opts.pathIndex);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ignore.toString());

      expect(_server.protocol).to.equal('http');
    });

    it('should overwrite the default options with stuff from .alivrc', () => {
      let _optsAlivrc = {
        host: '0.0.0.1',
        port: 1234,
        quiet: true,
        secure: true,
        pathIndex: '123456',
        version: '123456',
        noBrowser: true,
        proxy: true,
        proxyTarget: '123',
        proxyWhen: '/api/123',
        ignore: "/^(js|css)/",
        only: '/src/*'
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server();

      expect(_server.opts.host).to.equal(_optsAlivrc.host);
      expect(_server.opts.port).to.equal(_optsAlivrc.port);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_optsAlivrc.pathIndex);
      expect(_server.opts.version).to.equal(_optsAlivrc.version);
      expect(_server.opts.noBrowser).to.equal(_optsAlivrc.noBrowser);
      expect(_server.opts.proxy).to.equal(_optsAlivrc.proxy);
      expect(_server.opts.secure).to.equal(_optsAlivrc.secure);
      expect(_server.opts.proxyTarget).to.equal(_optsAlivrc.proxyTarget);
      expect(_server.opts.proxyWhen).to.equal(_optsAlivrc.proxyWhen + '*');
      expect(_server.opts.only).to.equal(_optsAlivrc.only);
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

      expect(_server.protocol).to.equal('https');

      _statSyncStub.restore();
      _readFileSyncStub.restore();
    });

    it('should overwrite only a few options with stuff from .alivrc', () => {
      let _optsAlivrc = {
        quiet: true,
        pathIndex: '123456',
        version: '123456',
        ignore: "/^(js|css)/"
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server();

      expect(_server.opts.port).to.equal(1307);
      expect(_server.opts.secure).to.equal(false);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_optsAlivrc.pathIndex);
      expect(_server.opts.version).to.equal(_optsAlivrc.version);
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

      _statSyncStub.restore();
      _readFileSyncStub.restore();
    });

    it('should overwrite only a few options with stuff from .alivrc and overwrite it with cliOpts', () => {
      let _cliOpts = {
        host: '0.0.0.2',
        port: 1111,
        version: 1,
        proxy: true,
        proxyTarget: 'abc',
        proxyWhen: '/api/1234',
        o: "/xyz",
        s: true
      }

      let _optsAlivrc = {
        host: '0.0.0.1',
        quiet: true,
        pathIndex: '123456',
        version: '123456',
        ignore: "/^(js|css)/",
        only: "/abc/*"
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server(_cliOpts);

      expect(_server.opts.host).to.equal(_cliOpts.host);
      expect(_server.opts.port).to.equal(_cliOpts.port);
      expect(_server.opts.secure).to.equal(_cliOpts.s);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_optsAlivrc.pathIndex);
      expect(_server.opts.version).to.equal(_cliOpts.version);
      expect(_server.opts.proxy).to.equal(_cliOpts.proxy);
      expect(_server.opts.proxyTarget).to.equal(_cliOpts.proxyTarget);
      expect(_server.opts.proxyWhen).to.equal(_cliOpts.proxyWhen + '*');
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.only).to.equal(path.join(_cliOpts.o, '**/*'));
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

      _statSyncStub.restore();
      _readFileSyncStub.restore();
    });

    it('should overwrite only a few options with stuff from .alivrc and overwrite it with cliOpts - should keep the only flag the same', () => {
      let _cliOpts = {
        port: 1111,
        version: 1,
        proxy: true,
        proxyTarget: 'abc',
        proxyWhen: '/api/1234',
        only: "/xyz/**/*"
      }

      let _optsAlivrc = {
        quiet: true,
        pathIndex: '123456',
        version: '123456',
        ignore: "/^(js|css)/",
        only: "/abc/*"
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server(_cliOpts);

      expect(_server.opts.port).to.equal(_cliOpts.port);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_optsAlivrc.pathIndex);
      expect(_server.opts.version).to.equal(_cliOpts.version);
      expect(_server.opts.proxy).to.equal(_cliOpts.proxy);
      expect(_server.opts.proxyTarget).to.equal(_cliOpts.proxyTarget);
      expect(_server.opts.proxyWhen).to.equal(_cliOpts.proxyWhen + '*');
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.only).to.equal(_cliOpts.only);
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

      _statSyncStub.restore();
      _readFileSyncStub.restore();
    });

    it('should overwrite only a few options with stuff from .alivrc and overwrite it with cliOpts (short descriptions) - should keep the only flag the same', () => {
      let _cliOpts = {
        p: 1111,
        pi: "abc123",
        px: true,
        pxt: 'abc',
        pxw: '/api/1234',
        o: "/xyz/**/*"
      }

      let _optsAlivrc = {
        quiet: true,
        pathIndex: '123456',
        version: '123456',
        ignore: "/^(js|css)/",
        only: "/abc/*"
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server(_cliOpts);

      expect(_server.opts.port).to.equal(_cliOpts.p);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_cliOpts.pi);
      expect(_server.opts.proxy).to.equal(_cliOpts.proxy);
      expect(_server.opts.proxyTarget).to.equal(_cliOpts.proxyTarget);
      expect(_server.opts.proxyWhen).to.equal(_cliOpts.proxyWhen + '*');
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.only).to.equal(_cliOpts.only);
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

      _statSyncStub.restore();
      _readFileSyncStub.restore();
    });

    it('should accept only as an array - not as glob', () => {
      let _cliOpts = {
        port: 1111,
        version: 1,
        proxy: true,
        proxyTarget: 'abc',
        proxyWhen: '/api/1234',
        only: ["/xyz", "/abc/123"]
      }

      let _server = new Server(_cliOpts);

      expect(_server.opts.only[0]).to.equal(path.join(_cliOpts.only[0], '**/*'));
      expect(_server.opts.only[1]).to.equal(path.join(_cliOpts.only[1], '**/*'));
    });

    it('should accept only as an array - already as a glob', () => {
      let _cliOpts = {
        port: 1111,
        version: 1,
        proxy: true,
        proxyTarget: 'abc',
        proxyWhen: '/api/1234',
        only: ["/xyz/**/*", "/abc/123/**/*.js"]
      }

      let _server = new Server(_cliOpts);

      expect(_server.opts.only[0]).to.equal(_cliOpts.only[0]);
      expect(_server.opts.only[1]).to.equal(_cliOpts.only[1]);
    });

    it('should overwrite the options with stuff passed in by the CLI - some short description', () => {
      let _opts = {
        port: 9999,
        quiet: true,
        version: '123',
        nb: true,
        px: true,
        pxt: 'http://123.com',
        pxw: '/api',
        ign: /^js/,
        pi: "abc",
        o: "/a/**/*.js",
        s: true
      }

      let _server = new Server(_opts);

      expect(_server.opts.pathIndex).to.equal(_opts.pi);
      expect(_server.opts.secure).to.equal(_opts.s);
      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.noBrowser).to.equal(_opts.nb);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.proxy).to.equal(_opts.px);
      expect(_server.opts.proxyTarget).to.equal(_opts.pxt);
      expect(_server.opts.proxyWhen).to.equal(_opts.pxw + '*');
      expect(_server.opts.only).to.equal(_opts.o);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ign.toString());
    });

    it('should overwrite the options with stuff passed in by the CLI - all short description', () => {
      let _opts = {
        h: '123.0.1.2',
        p: 9999,
        q: true,
        pi: '123',
        version: '123',
        nb: true,
        px: false,
        pxt: 'https://abc.123',
        pxw: '/wut/api/k',
        ign: /^js/,
        o: "/xyz/**",
        s: true
      }

      let _server = new Server(_opts);

      expect(_server.opts.host).to.equal(_opts.h);
      expect(_server.opts.secure).to.equal(_opts.s);
      expect(_server.opts.pathIndex).to.equal(_opts.pi);
      expect(_server.opts.port).to.equal(_opts.p);
      expect(_server.opts.quiet).to.equal(_opts.q);
      expect(_server.opts.noBrowser).to.equal(_opts.nb);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.proxy).to.equal(_opts.px);
      expect(_server.opts.proxyTarget).to.equal(_opts.pxt);
      expect(_server.opts.proxyWhen).to.equal(_opts.pxw); // proxy is false
      expect(_server.opts.only).to.equal(_opts.o);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ign.toString());
    });

    it('should overwrite the options with stuff passed in by the CLI - all short description - should not add another * to proxyWhen', () => {
      let _opts = {
        p: 9999,
        q: true,
        pathIndex: '123',
        version: '123',
        nb: true,
        px: false,
        pxt: 'https://abc.123',
        pxw: '/wut/api/k*',
        ign: /^js/
      }

      let _server = new Server(_opts);

      expect(_server.opts.pathIndex).to.equal(_opts.pathIndex);
      expect(_server.opts.port).to.equal(_opts.p);
      expect(_server.opts.quiet).to.equal(_opts.q);
      expect(_server.opts.noBrowser).to.equal(_opts.nb);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.proxy).to.equal(_opts.px);
      expect(_server.opts.proxyTarget).to.equal(_opts.pxt);
      expect(_server.opts.proxyWhen).to.equal(_opts.pxw);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ign.toString());
    });
  });

  describe('options', function() {
    it('should open the browser', () => {
      let _server = new Server();

      let _openStub = sinon.stub(_server, '_open', () => {});

      _server.start();

      expect(_server._open).to.have.been.called;

      _openStub.restore();
    });
  });

  describe('_sendIndex', () => {
    it('should call send with the right stuff - should log the warning about base href not existing', () => {
      let _server = new Server();

      let _req = null;
      let _res = {
        type: () => {},
        send: sinon.spy()
      };

      let _readStub = sinon.stub(_server._file, 'read', () => "123");
      let _openStub = sinon.stub(_server, '_open', () => {})

      sinon.spy(console.log);

      _server._sendIndex(_req, _res);

      expect(_res.send).to.have.been.called;
      expect(console.log).to.have.been.called;

      _readStub.restore();
      _openStub.restore();
    });

    it('should call send with the right stuff - should NOT log the warning about base href not existing - base is there', () => {
      let _server = new Server();

      let _req = null;
      let _res = {
        type: () => {},
        send: sinon.spy()
      };

      let _readStub = sinon.stub(_server._file, 'read', () => "<base href="/" />");
      let _openStub = sinon.stub(_server, '_open', () => {});

      sinon.spy(console.log);

      _server._sendIndex(_req, _res);

      expect(_res.send).to.have.been.called;
      expect(console.log).not.to.have.been.called;

      _readStub.restore();
      _openStub.restore();
    });

    it('should call send with the right stuff - should NOT log the warning about base href not existing - quiet is set to true', () => {
      let _server = new Server();

      let _req = null;
      let _res = {
        type: () => {},
        send: sinon.spy()
      };

      let _readStub = sinon.stub(_server._file, 'read', () => "<base href="/" />");
      let _openStub = sinon.stub(_server, '_open', () => {});

      sinon.spy(console.log);

      _server.quiet = true;

      _server._sendIndex(_req, _res);

      expect(_res.send).to.have.been.called;
      expect(console.log).not.to.have.been.called;

      _readStub.restore();
      _openStub.restore();
    });
  });

  describe('servers', () => {
    let _server = new Server();
    let _openStub;

    before(() => {
      _openStub = sinon.stub(_server, '_open', () => {});
    })

    after(() => {
      _openStub.restore();
    })

    it('should create the http server correctly', () => {
      _server.start();

      expect(_server._httpServer).to.be.an.instanceof(http.Server);
    })

    it('should create the ws server correctly', () => {
      _server.start();

      expect(_server._ws).to.be.an.instanceof(WS);
    })

    it('should create the ws server correctly', () => {
      _server.opts.secure = true;

      _server.start();

      expect(_server._httpServer).to.be.an.instanceof(https.Server);
    })
  });

  describe('proxy listen', () => {
    let _server = new Server({proxy: true, proxyWhen: '/abc/*', proxyTarget: 'http://abc.com'});
    let _openStub;
    let _allStub;

    before(() => {
      _allStub = sinon.stub(_server._app, 'all', () => {});
      _openStub = sinon.stub(_server, '_open', () => {});
    });

    after(() => {
      _openStub.restore();
      _allStub.restore();
    });

    it('should call app correctly', () => {
      _server.start();

      expect(_allStub).to.have.been.called;
    });

    it('should create a proxy server', () => {
      let _opts = {
        px: true,
        pxt: 'https://abc.123'
      }

      let _server = new Server(_opts);

      expect(_server._proxyServer).not.to.deep.equal({});
      expect(_server._proxyServer).to.have.property('web');
      expect(_server._proxyServer).to.have.property('proxyRequest');

      // we should have a better way to see if proxyServer is an instance of what http-proxy created
    });

    it('should call the proxy callback', () => {
      let _opts = {
        px: true,
        pxt: 'https://abc.123'
      }

      let _server = new Server(_opts);

      let _appAllStub = sinon.stub(_server._app, 'all', (cb) => cb);
      let _openStub = sinon.stub(_server, '_open', () => {});

      _server.start();

      sinon.spy(_server.emit);

      expect(_server._app.all).to.have.been.called;
      expect(_server.emit).to.have.been.called;
      expect(_server._open).to.have.been.called;

      _appAllStub.restore();
      _openStub.restore();
    })
  });

  describe('_onConnection', () => {
    it('should call the callback correcly', () => {
      let _server = new Server();
      _server._ws = {
        server: {
          on(ev, cb) {
            cb()
          }
        }
      };

      sinon.spy(_server.emit);

      _server._onConnection(() => {});

      expect(_server.emit).to.have.been.called;
    });
  });

  describe('_clientConnected', () => {
    it('should call reload, log and close the watch on the files', () => {
      let _fileWatcher = {
          on(ev, cb) {
            cb('a.js')
          },
          close() {}
      };

      let _chokidarStub = sinon.stub(chokidar, 'watch', () => _fileWatcher);

      let _server = new Server();
      _server._ws = {
        reload(){}
      }

      sinon.spy(_server.reload);
      sinon.spy(_server._file.log);
      sinon.spy(_server.emit);
      sinon.spy(_fileWatcher.close);

      _server._clientConnected();

      expect(_server.reload).to.have.been.called;
      expect(_server._file.log).to.have.been.called;
      expect(_fileWatcher.close).to.have.been.called;
    });
  });

  describe('reload', () => {
    it('should call the reload in _ws', () => {
      let _s = new Server();

      let _openStub = sinon.stub(_s, '_open', () => {});
      _s.start();

      sinon.spy(_s._ws.reload);
      sinon.spy(_s.emit);

      _s.reload();

      expect(_s._ws.emit).to.have.been.called;
      expect(_s._ws.reload).to.have.been.called;

      _openStub.restore();
    });
  });

  describe('start', () => {
    it('should call open correctly', () => {
      let _server = new Server();

      let _openStub = sinon.stub(_server, '_open', () => {});

      _server.start();

      expect(_server._open).to.have.been.called;

      _openStub.restore();
    });

    it('should NOT call open, noBrowser is set to true', () => {
      let _server = new Server({noBrowser: true});

      let _openStub = sinon.stub(_server, '_open', () => {});

      _server.start();

      expect(_server._open).not.to.have.been.called;

      _openStub.restore();
    });
  });
});
