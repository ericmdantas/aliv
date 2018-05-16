"use strict"

const WebSocketServer = require('ws').Server
const WS = require('../lib/ws')
const {expect} = require('chai')
const http = require('http')
const sinon = require('sinon')

describe('ws', () => {
  describe('creation', () => {
    it('should be defined', () => {
      expect(WS).to.be.defined
      expect(typeof WS).to.equal('function')
    })
  })

  describe('instance', () => {
    it('shoud have the right value for idContainer', () => {
        expect(WS.getConfig().idContainer).to.equal('#aliv-container')
    })

    it('should have the right value for html - not secure', () => {
      expect(WS.getConfig().html).to.contain(`
        <div id="aliv-container" style="display: none">
          <span>added by aliv</span>
          <script>
            (function() {
              console.log("aliv and kicking!")

              var protocol = /https:/.test(location.protocol) ? "wss" : "ws"

              var ws = new WebSocket(protocol + "://" + location.host)

              ws.onmessage = function(ev) {
                if (ev.data === "reload") {
                  location.reload()
                }
              }
            }())
          </script>
        </div>`
      )
    })

    it('should have the right value for html - secure', () => {
      expect(WS.getConfig(true).html).to.contain(`
        <div id="aliv-container" style="display: none">
          <span>added by aliv</span>
          <script>
            (function() {
              console.log("aliv and kicking!")

              var protocol = /https:/.test(location.protocol) ? "wss" : "ws"

              var ws = new WebSocket(protocol + "://" + location.host)

              ws.onmessage = function(ev) {
                if (ev.data === "reload") {
                  location.reload()
                }
              }
            }())
          </script>
        </div>`
      )
    })
  })

  describe('instance', () => {
    it('should have httpServer set', () => {
      let _httpServer = http.createServer(() => {})
      let _ws = new WS(_httpServer)

      expect(_ws.server).to.an.instanceof(WebSocketServer)
    })
  })

  describe('reload', () => {
    let _httpServer
    let _ws

    beforeEach(() => {
      _httpServer = http.createServer(() => {})
      _ws = new WS(_httpServer)
    })

    it('should not call reload, socket is closed', () => {
      let _client = {readyState: 1, OPEN: 2, send: sinon.spy()}
      _ws.server.clients.add(_client)

      _ws.reload()
      
      _ws.server.clients.forEach((c) => {
        expect(c.send).not.to.have.been.called
      })
    })

    it('should call reload, socket is open', () => {
      let _client = {readyState: 1, OPEN: 1, send: sinon.spy()}
      _ws.server.clients.add(_client)

      _ws.reload()

      _ws.server.clients.forEach((c) => {
        expect(c.send).to.have.been.called
      })
    })

    it('should call reload, all the sockets are open', () => {
      let _client1 = {readyState: 1, OPEN: 1, send: sinon.spy(), _id: 1}
      let _client2 = {readyState: 1, OPEN: 1, send: sinon.spy(), _id: 2}
      let _client3 = {readyState: 1, OPEN: 1, send: sinon.spy(), _id: 3}

      _ws.server.clients.add(_client1)
      _ws.server.clients.add(_client2)
      _ws.server.clients.add(_client3)

      _ws.reload()

      _ws.server.clients.forEach((c) => {
        expect(c.send).to.have.been.called
      })
    })
  })
})
