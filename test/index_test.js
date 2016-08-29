"use strict";

const {expect} = require('chai');
const libIndex = require('../lib');
const server = require('../lib/server');

describe('index', () => {
  it('should be the same', () => {
    expect(libIndex).to.equal(server);
  });
});
