"use strict";

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

exports.log = function(ev, p, options) {
  let _opt = options || {};

  if (_opt.quiet) {
    return;
  }

  let _extension = path.extname(p);

  let _msg = '';

  switch (_extension) {
    case '.js': _msg = chalk.yellow(`${ev}: ${p}\n`);
              break;

    case '.css': _msg = chalk.green(`${ev}: ${p}\n`);
              break;

    case '.html': _msg = chalk.blue(`${ev} ${p}\n`);
              break;

    default: _msg = chalk.white(`${ev} ${p}\n`);
  }

  console.info(_msg);
}

exports.exists = function(path) {
    try {
      fs.statSync(path);
      return true;
    }
    catch (e) {
      return false;
    }
}

exports.read = function(p) {
    return fs.readFileSync(p).toString();
}
