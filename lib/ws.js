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
              console.log("aliv and kicking!")

              var protocol = /https:/.test(location.protocol) ? "wss" : "ws";

              var ws = new WebSocket(protocol + "://" + location.host);

              ws.onmessage = function(ev) {
                if (ev.data === "reload") {
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
    this.clientMap = new Map();
    this.server = new WebSocketServer({server: httpServer});
  }

  reload() {
    this.clientMap.forEach((client) => {
      client.send('reload');
    });
  }
}
