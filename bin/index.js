#!/usr/bin/env node

const package = require('../package.json')
const args = require('minimist')(process.argv.slice(2))
const Server = require('../lib')

if (args.v || args.version) {
    console.log(`v${package.version}`)
    return
} 

new Server(args).start()
