'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var db = require('../db.js');

var GITHUB_CLIENT_ID = '7398449a45a9d7044a5b';
var GITHUB_CLIENT_SECRET = '9bd081f337b880fbd44a0e19c5c23edf69deeaf4';

module.exports = function(app) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use('local-signin', new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'email',
      passwordField: 'password'
    },
    function(req, email, password, done) {
      db.user.localAuth(email, password).then(function(user) {
        if (user) {
          req.session.success = 'You are successfully logged in ' + user + '!';
          done(null, user);
        } else if (!user) {
          req.session.error = 'Could not log user in. Please try again.';
          done(null, user);
        }
      }, function(err) {
        req.session.error = err;
        done(err);
      });
    }
  ));

  passport.use('local-signup', new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'email',
      passwordField: 'password'
    },
    function(req, email, password, done) {
      db.user.localReg(email, password).then(function(user) {
        if (user) {
          req.session.success = 'You are successfully registered and logged in ' + user + '!';
          done(null, user);
        } else if (!user) {
          req.session.error = 'That email is already in use, please try a different one.';
          done(null, user);
        }
      }, function(err) {
        req.session.error = err;
        done(err);
      });
    }
  ));

  passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      db.user.providerAuthReg('github', profile._json).then(function(user) {
        done(null, user);
      }, function(err) {
        // req.session.error = err;
        done(err);
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
};
