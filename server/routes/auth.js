'use strict';

var express = require('express');
var router = express.Router();

var passport = require('passport');
var auth = require('../controllers/auth');

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/projects');
}

router
  .get('/', ensureNotAuthenticated, function(req, res) {
    res.render('signin');
  })
  .post('/auth/local', passport.authenticate('local-auth', {
    successRedirect: '/projects',
    failureRedirect: '/'
  }))

  .get('/signup', ensureNotAuthenticated, function(req, res) {
    res.render('signup');
  })
  .post('/local-register', passport.authenticate('local-register', {
    successRedirect: '/projects',
    failureRedirect: '/signup'
  }))

  .get('/auth/github', ensureNotAuthenticated, passport.authenticate('github'))

  .get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/profile'
  }), function(req, res) {
    res.redirect('/projects');
  })

  .get('/logout', auth.logout);

module.exports = {
  use: '/',
  router: router
};
