"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const fs = require('fs');
const open = require('open');
const sinon = require('sinon');

let Server = require('../lib');

describe('server', () => {
  describe('creation', () => {
    it('should instantiate it correctly', () => {
      let _server = new Server();

      expect(_server.$).to.deep.equal({});
      expect(_server.alivrcCfg).to.be.defined;
      expect(_server.root).to.be.defined;
      expect(_server.indexHtmlPath).to.be.defined;
      expect(_server.alivrcPath).to.be.defined;

      expect(_server.opts.port).to.equal(1307);
      expect(_server.opts.quiet).to.be.false;
      expect(_server.opts.pathIndex).to.equal('');
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");

      expect(_server.open).to.equal(open);
    });

    it('should have root correctly it correctly', () => {
      let PATH = "C:\\abc\\1";

      let _pcwdStub = sinon.stub(process, 'cwd', () => PATH);

      let _server = new Server();

      expect(_server.root).to.equal(PATH);
      expect(_server.indexHtmlPath).to.equal(PATH + '/index.html');
      expect(_server.alivrcPath).to.equal(PATH + '/.alivrc');

      _pcwdStub.restore();
    });

    it('should have root correctly it correctly - deeper pathIndex', () => {
      let PATH = "C:\\abc\\1";

      let _pcwdStub = sinon.stub(process, 'cwd', () => PATH);

      let _server = new Server({pathIndex: 'abc123'});

      expect(_server.root).to.equal(PATH);
      expect(_server.indexHtmlPath).to.equal(PATH + '/abc123/index.html');
      expect(_server.alivrcPath).to.equal(PATH + '/.alivrc');

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
        quiet: true,
        pathIndex: '123',
        version: '123',
        noBrowser: true,
        ignore: /^js/
      }

      let _server = new Server(_opts);

      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathIndex).to.equal(_opts.pathIndex);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ignore.toString());
    });

    it('should overwrite the default options with stuff from .alivrc', () => {
      let _optsAlivrc = {
        port: 1234,
        quiet: true,
        pathIndex: '123456',
        version: '123456',
        noBrowser: true,
        ignore: "/^(js|css)/"
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server();

      expect(_server.opts.port).to.equal(_optsAlivrc.port);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_optsAlivrc.pathIndex);
      expect(_server.opts.version).to.equal(_optsAlivrc.version);
      expect(_server.opts.noBrowser).to.equal(_optsAlivrc.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

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
        port: 1111,
        version: 1
      }

      let _optsAlivrc = {
        quiet: true,
        pathIndex: '123456',
        version: '123456',
        ignore: "/^(js|css)/"
      }

      let _statSyncStub = sinon.stub(fs, 'statSync', () => true);
      let _readFileSyncStub = sinon.stub(fs, 'readFileSync', () => JSON.stringify(_optsAlivrc));

      let _server = new Server(_cliOpts);

      expect(_server.opts.port).to.equal(_cliOpts.port);
      expect(_server.opts.quiet).to.equal(_optsAlivrc.quiet);
      expect(_server.opts.pathIndex).to.equal(_optsAlivrc.pathIndex);
      expect(_server.opts.version).to.equal(_cliOpts.version);
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.ignore.toString()).to.equal(_optsAlivrc.ignore.toString());

      _statSyncStub.restore();
      _readFileSyncStub.restore();
    });

    it('should overwrite the options with stuff passed in by the CLI - some short description', () => {
      let _opts = {
        port: 9999,
        quiet: true,
        pathIndex: '123',
        version: '123',
        nb: true,
        ign: /^js/
      }

      let _server = new Server(_opts);

      expect(_server.opts.pathIndex).to.equal(_opts.pathIndex);
      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.noBrowser).to.equal(_opts.nb);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ign.toString());
    });

    it('should overwrite the options with stuff passed in by the CLI - all short description', () => {
      let _opts = {
        p: 9999,
        q: true,
        pathIndex: '123',
        version: '123',
        nb: true,
        ign: /^js/
      }

      let _server = new Server(_opts);

      expect(_server.opts.pathIndex).to.equal(_opts.pathIndex);
      expect(_server.opts.port).to.equal(_opts.p);
      expect(_server.opts.quiet).to.equal(_opts.q);
      expect(_server.opts.noBrowser).to.equal(_opts.nb);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.ignore.toString()).to.equal(_opts.ign.toString());
    });
  });

  describe('options', function() {
    it('should open the browser', () => {
      let _server = new Server();
      _server.start();

      expect(_server.open).to.be.a.function;
      expect(_server.open).to.equal(open);
    });
  });

  describe('start', () => {
    it('should call open correctly', () => {
      let _server = new Server();

      let _openStub = sinon.stub(_server, 'open', () => {});

      _server.start();

      expect(_server.open).to.have.been.called;
    });

    it('should NOT call open, noBrowser is set to true', () => {
      let _server = new Server({noBrowser: true});

      let _openStub = sinon.stub(_server, 'open', () => {});

      _server.start();

      expect(_server.open).not.to.have.been.called;
    });
  });
});
