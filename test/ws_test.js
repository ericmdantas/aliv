"use strict";

const WebSocketServer = require('ws').Server;
const WS = require('../lib/ws');
const expect = require('chai').expect;
const http = require('http');
const sinon = require('sinon');

describe('ws', () => {
  describe('creation', () => {
    it('should be defined', () => {
      expect(WS).to.be.defined;
      expect(typeof WS).to.equal('function');
    });
  });

  describe('instance', () => {
    it('shoud have the right value for idContainer', () => {
        expect(WS.getConfig().idContainer).to.equal('#aliv-container');
    });

    it('should have the right value for html', () => {
      expect(WS.getConfig().html).to.contain(`
        <div id="aliv-container" style="display: none;">
          <span>added by aliv</span>
          <script>
            ;(function() {
              console.log('aliv and kicking')

              var ws = new WebSocket('ws://'+location.host);
              ws.onmessage = function(ev) {
                if (ev.data === 'reload') {
                  location.replace('');
                }
              }
            }());
          </script>
        </div>`
      )
    });
  });

  describe('instance', () => {
    it('should have socket set', () => {
      let _httpServer = http.createServer(() => {});
      let _ws = new WS(_httpServer);

      expect(_ws.socket).to.deep.equal({});
    });

    it('should have httpServer set', () => {
      let _httpServer = http.createServer(() => {});
      let _ws = new WS(_httpServer);

      expect(_ws.server).to.an.instanceof(WebSocketServer);
    });
  });

  describe('isSocketConnected', () => {
    let _httpServer;
    let _ws;

    beforeEach(() => {
      _httpServer = http.createServer(() => {});
      _ws = new WS(_httpServer);
    });

    it('should return false, readyState and OPEN are different', () => {
      _ws.socket = {readyState: 1, OPEN: 2};

      expect(_ws.isSocketConnected()).to.be.false;
    });

    it('should return true, readyState and OPEN are equal', () => {
      _ws.socket = {readyState: 1, OPEN: 1};

      expect(_ws.isSocketConnected()).to.be.true;
    });
  });

  describe('sendReload', () => {
    let _httpServer;
    let _ws;

    beforeEach(() => {
      _httpServer = http.createServer(() => {});
      _ws = new WS(_httpServer);
    });

    it('should not call sendReload, socket is closed', () => {
      _ws.socket = {readyState: 1, OPEN: 2, send: () =>{}};
      let _reloadSpy = sinon.spy(_ws.socket, 'send');

      _ws.sendReload();

      expect(_reloadSpy).not.to.have.been.called;
    });

    it('should call sendReload, socket is open', () => {
      _ws.socket = {readyState: 1, OPEN: 1, send: () =>{}};
      let _reloadSpy = sinon.spy(_ws.socket, 'send');

      _ws.sendReload();

      expect(_reloadSpy).to.have.been.called;
    });
  })
});
