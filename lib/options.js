"use strict";

module.exports = {
  noBrowser: false,
  host: '127.0.0.1',
  secure: false,
  http2: false,
  cors: false,
  static: [],
  reloadDelay: 0,
  port: 1307,
  pathIndex: '',
  quiet: false,
  proxy: false,
  proxyTarget: '',
  proxyWhen: '',
  ignore: /(\.git|node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)|(.+(_test|-test|\.test|_spec|-spec|\.spec).+)/,
  only: '.',
  watch: true
}
