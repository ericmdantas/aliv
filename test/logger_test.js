"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const logger = proxyquire('../lib/logger', {
  'path': {
    extname: function() {
      return '.js'
    }
  },
  'chalk': {
    blue: function(msg) {
      return 'blue:' + msg;
    },
    yellow: function(msg) {
      return 'yellow:' + msg
    },
    green: function(msg) {
      return 'green:' + msg
    }
  }
});

describe('logger', () => {
  describe('creation', () => {
    it('should be a function', () => {
      expect(logger).to.be.a.function;
    });
  });

  it('should call it correcly', () => {
      logger('something', 'somewhere/in/my/pc/somefile.js');
  });
});
