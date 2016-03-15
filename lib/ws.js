"use strict";

const WebSocketServer = require('ws').Server;

module.exports = class WS {
  static getConfig(secure) {
    return {
      html: `
        <div id="aliv-container" style="display: none;">
          <span>added by aliv</span>
          <script>
            ;(function() {
              console.log('aliv and kicking!');

              var protocol = ${secure ? "wss" : "ws"};

              var ws = new WebSocket(protocol + '://' + location.host);

              ws.onmessage = function(ev) {
                if (ev.data === 'reload') {
                  location.reload();
                }
              }
            }());
          </script>
        </div>
      `,
      idContainer: '#aliv-container'
    }
  }

  constructor(httpServer) {
    this.server = new WebSocketServer({server: httpServer});
  }

  sendReload(client) {
    if (client && client.readyState === client.OPEN) {
      client.send('reload');
    }
  }
}
