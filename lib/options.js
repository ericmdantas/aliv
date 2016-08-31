"use strict";

module.exports = {
  noBrowser: false,
  host: '127.0.0.1',
  secure: false,
  static: [],
  port: 1307,
  pathIndex: '',
  quiet: false,
  proxy: false,
  proxyTarget: '',
  proxyWhen: '',
  ignore: /^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)/,
  only: '.',
  watch: true
}
