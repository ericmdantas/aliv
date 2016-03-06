"use strict";

const expect = require('chai').expect;
const options = require('../lib/options').options;

describe('options', () => {
  it('should have the right values for the options', () => {
    expect(options.port).to.equal(1307);
    expect(options.pathIndex).to.equal('');
    expect(options.noBrowser).to.be.false;
    expect(options.quiet).to.be.false;
    expect(options.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");
  });
});
