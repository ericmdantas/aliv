"use strict";

const chalk = require('chalk');

module.exports = function(ev, path) {
  let _extension = /\..+$/.exec(path).toString();

  let _js = /\.js$/.exec(path) ? /\.js$/.exec(path).toString() : '';
  let _css = /\.css$/.exec(path) ? /\.css$/.exec(path).toString() : '';
  let _html = /\.html$/.exec(path) ? /\.html$/.exec(path).toString() : '';

  let _msg = '';

  switch (_extension) {
    case _js: _msg = chalk.yellow(`${ev}: ${path}`);
              break;

    case _css: _msg = chalk.green(`${ev}: ${path}`);
              break;

    case _html: _msg = chalk.blue(`${ev} ${path}`);
              break;

    default: _msg = chalk.white(`${ev} ${path}`);
  }

  console.log(_msg);
}
