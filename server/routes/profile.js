'use strict';

var express = require('express');
var router = express.Router();

var profile = require('../controllers/profile');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.error = 'Please sign in!';
  res.redirect('/');
}

router
  .get('/', ensureAuthenticated, profile.profile)

  .post('/edit/pass', ensureAuthenticated, profile.edit.pass)
  .post('/edit/user', ensureAuthenticated, profile.edit.user);

module.exports = {
  use: '/profile',
  router: router
};
