'use strict';

var mongoose = require('mongoose');
var RoomModel = require('../models/room');

function clean() {
  RoomModel.find({}, function(err, rooms) {
    rooms.some(function(room) {
      room.users = [];
      room.save();
    });
  });
}

module.exports = function(config) {
  mongoose.connect(config.db);

  var db = mongoose.connection;
  db.on('error', function(err) {
    console.log(new Error('Unable to connect to database: ', err));
  });
  db.once('open', function() {
    clean();
  });
};
