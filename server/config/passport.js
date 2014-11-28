'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var GitHubStrategy = require('passport-github').Strategy;
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

  // passport.use(new GitHubStrategy({
  //     clientID: GITHUB_CLIENT_ID,
  //     clientSecret: GITHUB_CLIENT_SECRET,
  //     callbackURL: '/auth/github/callback'
  //   },
  //   function(accessToken, refreshToken, profile, done) {
  //     db.user.providerAuthReg('github', profile._json).then(function(user) {
  //       done(null, user);
  //     }, function(err) {
  //       // req.session.error = err;
  //       done(err);
  //     });
  //   }
  // ));

  app.use(passport.initialize());
  app.use(passport.session());
};
