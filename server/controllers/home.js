'use strict';

var dbRoom = require('../db/room');

exports.show = function(req, res, next) {
  dbRoom.get(req.params.id).then(function(room) {
    var name = '';
    var gravatar = '';
    var roomIsAdded = false;
    if (req.user) {
      name = req.user.displayName;
      gravatar = req.user.gravatarHash;

      req.user.rooms.some(function(userRoom) {
        if (userRoom.room.id === room.id) {
          roomIsAdded = true;
        }
      });
    }

    res.render('index', {
      room: room,
      user: name,
      gravatar: gravatar,
      roomIsAdded: roomIsAdded
    });
  }, function() {
    next();
  });
};
