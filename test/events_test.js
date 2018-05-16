"use strict"

const {expect} = require('chai')
const events = require("../lib/events")

describe("events", () => {
    it("should have the right values for the properties", () => {
        expect(events.BROWSER_OPEN).to.equal("browser-open")
        expect(events.CLIENT_CONNECTED).to.equal("client-connected")
        expect(events.PAGE_RELOAD).to.equal("page-reload")
        expect(events.FILE_CHANGED).to.equal("file-changed")
        expect(events.REQUEST_PROXY).to.equal("request-proxy")
    })
})