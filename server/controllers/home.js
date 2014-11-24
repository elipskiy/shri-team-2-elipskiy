'use strict';

var db = require('../db.js');

exports.show = function(req, res, next) {
  db.room.get(req.params.id).then(function() {
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
