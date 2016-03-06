"use strict";

const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('cli', () => {
  it('should call the server correctly', () => {
    let srv = function(){};
    srv.prototype.start = () => {};

    let cli = proxyquire('../bin', {
      minimist: () => {
        return () => {
          return {};
        }
      },
      '../lib': srv
    })
  });
});
