'use strict';

var socket = require('./socket');

function onConnect() {
  socket.emit('connectToRoom', window.location.pathname.slice(1));
}

function connect() {
  socket.emit('userConnect');
}

socket.on('connect', onConnect);

module.exports = {
  connect: connect,
  socket: socket.io.engine
};
