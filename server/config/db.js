'use strict';

var mongoose = require('mongoose');
var RoomModel = require('../models/room');

function clean() {
  RoomModel.find({}, function(err, rooms) {
    rooms.some(function(room) {
      room.users = []; // todo возвращать цвета
      room.save();
    });
  });
}

module.exports = function(config) {
  mongoose.connect(config.db);

  mongoose.connection.on('error', function(err) {
    console.log(new Error('connection error:', err.message));
  });

  clean();
};
