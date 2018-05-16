"use strict"

const {expect} = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const fs = require('fs')

describe('logger', () => {
  let logger
  let consoleStub

  before(() => {
    consoleStub = sinon.stub(console, 'info', () => {})
  })

  after(() => {
    consoleStub.restore()
  })

  describe('creation', () => {
    it('should be a function', () => {
      expect(logger).to.be.an.object
    })
  })

  describe('info', () => {
    beforeEach(() => {
      logger = proxyquire('../lib/logger', {
        'chalk': {
          blue: (msg) => 'blue:' + msg,
          red: (msg) => 'red:' + msg,
          yellow: (msg) => 'yellow:' + msg,
          green: (msg) => 'green:' + msg,
          white: (msg) => 'white:' + msg,
          magenta: (msg) => 'magenta:' + msg,
          cyan: (msg) => 'cyan:' + msg
        }
      })
    })

    it('info(str)', () => {
      logger.info('something happened')
    })
  })

  describe('warn', () => {
    beforeEach(() => {
      logger = proxyquire('../lib/logger', {
        'chalk': {
          blue: (msg) => 'blue:' + msg,
          red: (msg) => 'red:' + msg,
          yellow: (msg) => 'yellow:' + msg,
          green: (msg) => 'green:' + msg,
          white: (msg) => 'white:' + msg,
          magenta: (msg) => 'magenta:' + msg,
          cyan: (msg) => 'cyan:' + msg
        }
      })
    })

    it('warn()', () => {
      logger.warn('something happened')
    })
  })

  describe('error', () => {
    beforeEach(() => {
      logger = proxyquire('../lib/logger', {
        'chalk': {
          blue: (msg) => 'blue:' + msg,
          red: (msg) => 'red:' + msg,
          yellow: (msg) => 'yellow:' + msg,
          green: (msg) => 'green:' + msg,
          white: (msg) => 'white:' + msg,
          magenta: (msg) => 'magenta:' + msg,
          cyan: (msg) => 'cyan:' + msg
        }
      })
    })

    it('error()', () => {
      logger.error('something happened')
    })
  })

  describe('logFileEvent', () => {
    beforeEach(() => {
      logger = proxyquire('../lib/logger', {
        'chalk': {
          blue: (msg) => 'blue:' + msg,
          red: (msg) => 'red:' + msg,
          yellow: (msg) => 'yellow:' + msg,
          green: (msg) => 'green:' + msg,
          white: (msg) => 'white:' + msg,
          magenta: (msg) => 'magenta:' + msg,
          cyan: (msg) => 'cyan:' + msg
        },
        fs: {
          statSync(){}
        }
      })
    })

    it('should not call it, quiet is set to tru', () => {
      logger.logFileEvent('changed', 'something.html', {quiet: true})
    })

    it('should call it correcly', () => {
      logger.logFileEvent('changed', 'somewhere/in/my/pc/somefile.js')
      logger.logFileEvent('added', 'somewhere/in/my/pc/somefile.css')
      logger.logFileEvent('removed', 'somewhere/in/my/pc/somefile.html')
      logger.logFileEvent('something', 'somewhere/in/my/pc/other.ts')
    })
  })
})
