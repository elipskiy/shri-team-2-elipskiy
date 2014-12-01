'use strict';

var express = require('express');
var router = express.Router();

var api = require('../controllers/api');

router
  .post('/add/room', api.addRoom);

module.exports = {
  use: '/api',
  router: router
};
