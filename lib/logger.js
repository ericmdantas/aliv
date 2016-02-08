"use strict";

const chalk = require('chalk');
const options = require('./options');
const path = require('path');

module.exports = function(ev, p, options) {
  let _opt = options || {};

  if (_opt.quiet) {
    return;
  }

  let _extension = path.extname(p);

  let _msg = '';

  switch (_extension) {
    case '.js': _msg = chalk.yellow(`${ev}: ${p}`);
              break;

    case '.css': _msg = chalk.green(`${ev}: ${p}`);
              break;

    case '.html': _msg = chalk.blue(`${ev} ${p}`);
              break;

    default: _msg = chalk.white(`${ev} ${p}`);
  }

  console.log(_msg);
}
