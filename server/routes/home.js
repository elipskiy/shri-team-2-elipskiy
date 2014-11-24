'use strict';

var express = require('express');
var router = express.Router();

var home = require('../controllers/home');

router
  .get('/:id', home.show);

module.exports = {
  use: '/',
  router: router
};
