'use strict';

var express = require('express');
var router = express.Router();

var projects = require('../controllers/projects');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.error = 'Please sign in!';
  res.redirect('/');
}

router
  .get('/', ensureAuthenticated, projects.projects)

  .post('/create', ensureAuthenticated, projects.create)
  .get('/remove/:id', ensureAuthenticated, projects.remove);

module.exports = {
  use: '/projects',
  router: router
};
