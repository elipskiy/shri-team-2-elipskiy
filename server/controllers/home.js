'use strict';

var dbRoom = require('../db/room');

exports.show = function(req, res, next) {
  dbRoom.get(req.params.id).then(function(room) {
    var name = '';
    var gravatar = '';
    if (req.user) {
      name = req.user.displayName;
      gravatar = req.user.gravatarHash;
    }
    res.render('index', {
      user: name,
      gravatar: gravatar,
      lang: room.lang
    });
  }, function() {
    next();
  });
};
