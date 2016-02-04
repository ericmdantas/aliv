#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const server = require('../lib/server');

server(argv);
