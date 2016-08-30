"use strict";

const expect = require('chai').expect;
const {DEFAULT_OPTIONS} = require('../lib/options');

describe('DEFAULT_OPTIONS', () => {
  it('should have the right values for the DEFAULT_OPTIONS', () => {
    expect(DEFAULT_OPTIONS.host).to.equal('127.0.0.1');
    expect(DEFAULT_OPTIONS.port).to.equal(1307);
    expect(DEFAULT_OPTIONS.pathIndex).to.equal('');
    expect(DEFAULT_OPTIONS.noBrowser).to.be.false;
    expect(DEFAULT_OPTIONS.secure).to.be.false;
    expect(DEFAULT_OPTIONS.quiet).to.be.false;
    expect(DEFAULT_OPTIONS.proxy).to.be.false;
    expect(DEFAULT_OPTIONS.proxyTarget).to.equal('');
    expect(DEFAULT_OPTIONS.proxyWhen).to.equal('');
    expect(DEFAULT_OPTIONS.ignore.toString()).to.equal("/^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");
    expect(DEFAULT_OPTIONS.only).to.equal('.');
    expect(DEFAULT_OPTIONS.watch).to.equal(true);
  });
});
