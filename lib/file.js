"use strict"

const fs = require('fs')

exports.exists = function(path) {
    try {
      fs.statSync(path)
      return true
    }
    catch (e) {
      return false
    }
}

exports.read = function(p) {
    return fs.readFileSync(p).toString()
}
