'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');
var PORT = process.env.PORT || 3000;

var config = {
  root: rootPath,
  port: PORT,
  db: 'mongodb://localhost/meepo'
};

module.exports = config;
