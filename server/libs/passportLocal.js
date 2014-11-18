'use strict';

var LocalStrategy = require('passport-local').Strategy;
var db = require('../db.js');

module.exports = function(passport) {

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
        done(null, null);
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
        done(null, null);
      });
    }
  ));
};
