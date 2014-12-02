'use strict';

var socket = require('./socket');

function onConnect() {
  socket.emit('connectToRoom', window.location.pathname.slice(1));
  socket.emit('userConnect');
}

socket.on('connect', onConnect);

module.exports = {
  socket: socket.io.engine
};
