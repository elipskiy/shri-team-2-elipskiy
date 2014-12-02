'use strict';

var dbUser = require('../db/user');

exports.authenticate = {
  local: function(req, email, password, done) {
    dbUser.localAuth(email, password).then(function(user) {
      if (user) {
        done(null, user);
      } else if (!user) {
        req.session.error = 'Could not log user in. Please try again.';
        done(null, user);
      }
    }, function(err) {
      req.session.error = err.toString();
      done(null, null);
    });
  }
};

exports.provider = {
  github: function(req, accessToken, refreshToken, profile, done) {
    if (!req.isAuthenticated()) {
      dbUser.providerAuth('github', profile.id).then(function(user) {
        if (user) {
          done(null, user);
        }
      }, function(err) {
        req.session.error = err.toString();
        done(null, null);
      });
    } else {
      dbUser.providerReg('github', profile._json, req.user.id).then(function(user) {
        done(null, user);
      }, function(err) {
        req.session.error = {register: err.toString()};
        done(err);
      });
    }
  }
};

exports.register = function(req, email, password, done) {
  dbUser.localReg(email, password).then(function(user) {
    if (user) {
      done(null, user);
    } else if (!user) {
      req.session.error = 'That username is already in use, please try a different one.';
      done(null, user);
    }
  }, function(err) {
    req.session.error = err.toString();
    done(null, null);
  });
};

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
};
