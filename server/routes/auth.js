'use strict';

var express = require('express');
var router = express.Router();

var passport = require('passport');
var auth = require('../controllers/auth');

router
  .get('/', function(req, res) {
    res.render('signin');
  })
  .post('/local-auth', passport.authenticate('local-auth', {
    successRedirect: '/projects',
    failureRedirect: '/'
  }))

  .get('/signup', function(req, res) {
    res.render('signup');
  })
  .post('/local-register', passport.authenticate('local-register', {
    successRedirect: '/projects',
    failureRedirect: '/signup'
  }))

  .get('/logout', auth.logout);

module.exports = {
  use: '/',
  router: router
};
