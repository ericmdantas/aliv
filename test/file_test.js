"use strict";

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const fs = require('fs');

describe('file', () => {
  let file;

  describe('creation', () => {
    it('should be a function', () => {
      expect(file).to.be.an.object;
    });
  });

  describe('log', () => {
    beforeEach(() => {
      file = proxyquire('../lib/file', {
        'chalk': {
          blue: (msg) => 'blue:' + msg,
          yellow: (msg) => 'yellow:' + msg,
          green: (msg) => 'green:' + msg
        },
        fs: {
          statSync(){}
        }
      });
    })

    it('should not call it, quiet is set to tru', () => {
      file.log('changed', 'something.html', {quiet: true});
    });

    it('should call it correcly', () => {
      file.log('changed', 'somewhere/in/my/pc/somefile.js');
      file.log('added', 'somewhere/in/my/pc/somefile.css');
      file.log('removed', 'somewhere/in/my/pc/somefile.html');
      file.log('something', 'somewhere/in/my/pc/other.ts');
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
