"use strict";

const WebSocketServer = require('ws').Server;

module.exports = class WS {
  static getConfig() {
    return {
      html: `
        <div id="aliv-container" style="display: none;">
          <span>added by aliv</span>
          <script>
            ;(function() {
              console.log('aliv and kicking')

              var ws = new WebSocket('ws://'+location.host);
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
