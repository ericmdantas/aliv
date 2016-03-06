"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const logger = proxyquire('../lib/file-status-log', {
  'path': {
    extname: () => '.js'
  },
  'chalk': {
    blue: (msg) => 'blue:' + msg,
    yellow: (msg) => 'yellow:' + msg,
    green: (msg) => 'green:' + msg
  }
});

describe('file-status-log', () => {
  describe('creation', () => {
    it('should be a function', () => {
      expect(logger).to.be.a.function;
    });
  });

  it('should call it correcly', () => {
      logger('changed', 'somewhere/in/my/pc/somefile.js');
      logger('added', 'somewhere/in/my/pc/somefile.css');
      logger('removed', 'somewhere/in/my/pc/somefile.html');
  });
});
