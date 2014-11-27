'use strict';

var socket = require('socket.io');
var io;

module.exports = function(server, sessionMiddleware) {
  io = socket(server);

  io.use(function(socket, next) {
    sessionMiddleware(socket.request, {}, next);
  });

  require('../io/socket')(io);
};
