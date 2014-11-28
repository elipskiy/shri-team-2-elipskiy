'use strict';

var dbUser = require('../db/user');

exports.edit = {
  pass: function(req, res) {
   dbUser.update.pass(req.body, req.user._id).then(function() {
      res.redirect('/profile');
    }, function(err) {
      req.session.error = {pass: err.toString()};
      res.redirect('/profile');
    });
  },
  user: function(req, res) {
    dbUser.update.data(req.body, req.user._id).then(function() {
      res.redirect('/profile');
    }, function(err) {
      req.session.error = {user: err.toString()};
      res.redirect('/profile');
    });
  }
};

exports.profile = function(req, res) {
  dbUser.getById(req.user._id).then(function(user) {
    res.render('profile', {
      user: user.displayName,
      email: user.email,
      projects: user.rooms,
      gravatar: req.user.gravatarHash
    });
  });
};
