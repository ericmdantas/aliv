#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const Server = require('../lib/server');

new Server(argv).start();
