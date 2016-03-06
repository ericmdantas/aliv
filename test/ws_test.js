"use strict";

const WebSocketServer = require('ws').Server;
const WS = require('../lib/ws');
const expect = require('chai').expect;
const http = require('http');

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
    it('should have httpServer set', () => {
      let _httpServer = http.createServer(() => {});
      let _ws = new WS(_httpServer);

      expect(_ws.wsServer).to.an.instanceof(WebSocketServer);
    });
  });
});
