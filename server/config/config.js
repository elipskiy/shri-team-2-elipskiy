'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');
var PORT = process.env.PORT || 3000;

var config = {
  root: rootPath,
  port: PORT,
  db: 'mongodb://localhost/meepo',
  passport: {
    local: {
      passReqToCallback: true,
      usernameField: 'email',
      passwordField: 'password'
    },
    github: {
      clientID: '7398449a45a9d7044a5b',
      clientSecret: '9bd081f337b880fbd44a0e19c5c23edf69deeaf4',
      callbackURL: '/auth/github/callback'
    }
  }
};

module.exports = config;
