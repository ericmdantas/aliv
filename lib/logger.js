"use strict"

const chalk = require('chalk')
const path = require('path')
const log = require('fancy-log')

exports.logFileEvent = function(ev, p, options) {
  let _opt = options || {}

  if (_opt.quiet) {
    return
  }

  let _msg = ''
  const _extension = path.extname(p)

  switch (_extension) {
    case '.js': _msg = chalk.yellow(`${ev} -> `) + chalk.white(`${p}`)
         break

    case '.css': _msg = chalk.green(`${ev} -> `) + chalk.white(`${p}`)
         break

    case '.html': _msg = chalk.cyan(`${ev} -> `) + chalk.white(`${p}`)
         break

    default: _msg = chalk.white(`${ev} -> ${p}`)
  }

  log.info(_msg)
}

exports.info = function(msg) {
  log.info(chalk.cyan(msg))
}

exports.warn = function(msg) {
  log.warn(chalk.yellow(msg))
}

exports.error = function(msg) {
  log.error(chalk.red(msg))
}