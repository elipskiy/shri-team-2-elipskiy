'use strict';

var express = require('express');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

module.exports = function(app, sessionMiddleware, config) {

  // app.use(logger('combined'));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(sessionMiddleware);
  app.use(function(req, res, next) {
    var err = req.session.error;
    var msg = req.session.notice;
    var success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) {
      res.locals.error = err;
    }
    if (msg) {
      res.locals.notice = msg;
    }
    if (success) {
      res.locals.success = success;
    }

    next();
  });
  app.use(express.static(config.root + 'build'));
  app.set('views', config.root + 'build');
  app.set('view engine', 'jade');

};
