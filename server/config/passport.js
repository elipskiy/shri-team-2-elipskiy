'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var auth = require('../controllers/auth');
var dbUser = require('../db/user');

module.exports = function(app, config) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    dbUser.getById(obj.id).then(function(user) {
      done(null, user);
    });
  });

  passport.use('local-auth', new LocalStrategy(
    config.passport.local,
    auth.authenticate.local
  ));

  passport.use('local-register', new LocalStrategy(
    config.passport.local,
    auth.register
  ));

  passport.use('github', new GitHubStrategy(
    config.passport.github,
    auth.provider.github
  ));

  app.use(passport.initialize());
  app.use(passport.session());
};
