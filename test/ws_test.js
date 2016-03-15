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
              console.log('aliv and kicking!')

              var ws = new WebSocket('ws://'+location.host);

              ws.onmessage = function(ev) {
                if (ev.data === 'reload') {
                  location.reload();
                }
              }
            }());
          </script>
        </div>`
      )
    });
  });

  describe('instance', () => {
    it('should have httpServer set', () => {
      let _httpServer = http.createServer(() => {});
      let _ws = new WS(_httpServer);

      expect(_ws.server).to.an.instanceof(WebSocketServer);
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
      let _client = {readyState: 1, OPEN: 2, send: sinon.spy()};

      _ws.sendReload(_client);

      expect(_client.send).not.to.have.been.called;
    });

    it('should call sendReload, socket is open', () => {
      let _client = {readyState: 1, OPEN: 1, send: sinon.spy()};

      _ws.sendReload(_client);

      expect(_client.send).to.have.been.called;
    });
  })
});
