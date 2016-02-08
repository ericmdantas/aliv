"use strict";

const fs = require('fs');
const proxyquire = require('proxyquire');

describe('cli', () => {
  it('should call the server correctly', () => {
    let srv = function() {

    }

    srv.prototype.start = function() {

    }

    let cli = proxyquire('../bin', {
      minimist: function() {
        return function() {
          return {};
        }
      },
      '../lib': srv
    })
  });
});
