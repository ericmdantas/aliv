"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
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
    });

    it('should overwrite the options with stuff passed in', () => {
      let _opts = {
        port: 9999,
        quiet: true,
        pathToIndex: '123',
        version: '123',
        noBrowser: true
      }

      let _server = new Server(_opts);

      expect(_server.opts.port).to.equal(_opts.port);
      expect(_server.opts.quiet).to.equal(_opts.quiet);
      expect(_server.opts.pathToIndex).to.equal(_opts.pathToIndex);
      expect(_server.opts.version).to.equal(_opts.version);
      expect(_server.opts.noBrowser).to.equal(_opts.noBrowser);
    });

    it('should have the right value for the html', () => {
      let _server = new Server();

      expect(_server.$.html()).to.contain('aliv-container');
    });

    it('should have the right value for the html', () => {
      let _server = new Server();

      expect(_server.$.html()).to.contain('aliv-container');
    });
  });

  describe('options', function() {
    it('should open the browser', () => {
      let _server = sinon.createStubInstance(Server);
      _server.start();

      expect(_server.open).to.have.been.called;
    });
  });

  describe('start', () => {
    it('should call it right', () => {
        
    });
  });
});
