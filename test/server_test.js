"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const open = require('open');
const sinon = require('sinon');

let Server = {};

describe('server', () => {
  beforeEach(() => {
    Server = proxyquire('../lib/server', {
      fs: {
        readFileSync: function() {
          return `
            <html>
              <body>
              </body>
            </html>
          `;
        }
      }
    });
  })

  describe('creation', () => {
    it('should instantiate it correctly', () => {
      let _server = new Server();

      expect(_server.opts.port).to.equal(1307);
      expect(_server.opts.quiet).to.be.false;
      expect(_server.opts.pathToIndex).to.equal('');
      expect(_server.opts.noBrowser).to.equal(false);
      expect(_server.opts.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");
    });

    it('should switch just a few options', () => {
      let _opts = {
        quiet: true,
        noBrowser: true
      }

      let _server = new Server(_opts);

      expect(_server.opts.port).to.equal(1307);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathToIndex).to.equal('');
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");
    });

    it('should overwrite the options with stuff passed in', () => {
      let _opts = {
        port: 9999,
        quiet: true,
        pathToIndex: '123',
        version: '123',
        noBrowser: true,
        ignore: /^js/
      }

      let _server = new Server(_opts);

      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathToIndex).to.equal(_opts.pathToIndex);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
      expect(_server.opts.ignore.toString()).to.equal("/^js/");
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
    it('should call it right', () => {

    });
  });
});
