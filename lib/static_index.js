"use strict";

const fs = require('fs');
const stream = require('stream');

exports.sendIndex = function(html) {
  return (req, res) => {
    res.set('Content-Type', 'text/html');

    let s = new stream.Readable();
    s._read = () => {};
    s.push(html);
    s.push(null);

    s.pipe(res);
  }
}
