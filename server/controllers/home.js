'use strict';

var dbRoom = require('../db/room');

exports.show = function(req, res, next) {
  dbRoom.get(req.params.id).then(function() {
    var name = '';
    var gravatar = '';
    if (req.user) {
      name = req.user.email;
      gravatar = req.user.gravatarHash;
    }
    res.render('index', {
      user: name,
      gravatar: gravatar
    });
  }, function() {
    next();
  });
};
