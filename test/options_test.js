"use strict";

const expect = require('chai').expect;
const options = require('../lib/options');

describe('options', () => {
  it('should have the right values', () => {
    expect(options.host).to.equal('127.0.0.1');
    expect(options.port).to.equal(1307);
    expect(options.pathIndex).to.equal('');
    expect(options.noBrowser).to.be.false;
    expect(options.secure).to.be.false;
    expect(options.static).to.deep.equal([]);
    expect(options.quiet).to.be.false;
    expect(options.proxy).to.be.false;
    expect(options.proxyTarget).to.equal('');
    expect(options.proxyWhen).to.equal('');
    expect(options.ignore.toString()).to.equal("/^(.git|node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/");
    expect(options.only).to.equal('.');
    expect(options.watch).to.equal(true);
  });
});
