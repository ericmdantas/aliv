"use strict";

const {expect} = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const fs = require('fs');

describe('file', () => {
  let file;
  let consoleStub;

  before(() => {
    consoleStub = sinon.stub(console, 'info', () => {});
  });

  after(() => {
    consoleStub.restore();
  });

  describe('creation', () => {
    it('should be a function', () => {
      expect(file).to.be.an.object;
    });
  });

  describe('read', () => {
    beforeEach(() => {
      file = proxyquire('../lib/file', {
        fs: {
          readFileSync() {
            return new Buffer('yo');
          }
        }
      });
    })

    it('should return an string', () => {
      expect(file.read('s')).to.be.a('string');
    });
  });

  describe('exists', () => {
    it('should return false', () => {
      file = proxyquire('../lib/file', {
        fs: {
          statSync(){
            throw new Error();
          }
        }
      });

      expect(file.exists()).to.be.false;
    });

    it('should return true', () => {
      file = proxyquire('../lib/file', {
        fs: {
          statSync(){}
        }
      });

      expect(file.exists()).to.be.true;
    });
  });
});
