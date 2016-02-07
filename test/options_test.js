"use strict";

const expect = require('chai').expect;
const options = require('../lib/options');

describe('options', () => {
  it('should have the right values for the options', () => {
    expect(options.port).to.equal(1307);
    expect(options.pathToIndex).to.equal('');
  });
});
