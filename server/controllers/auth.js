'use strict';

var dbUser = require('../db/user');

exports.authenticate = {
  local: function(req, email, password, done) {
    dbUser.localAuth(email, password).then(function(user) {
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
};

exports.register = function(req, email, password, done) {
  dbUser.localAuth(email, password).then(function(user) {
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
};

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
};
