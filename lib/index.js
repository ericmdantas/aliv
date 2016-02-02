"use strict";

const argv = require('yargs').argv;

module.exports = function index() {
  console.log(argv.x);
  console.log(argv.yo);
}
