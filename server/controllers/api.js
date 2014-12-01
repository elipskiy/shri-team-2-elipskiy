'use strict';

var dbUser = require('../db/user');

exports.addRoom = function(req, res) {
  dbUser.update.addRoom(req.user.id, req.body.docName).then(function() {
    res.json('{"success" : "Add Successfully", "status" : 200}');
  }).catch(function(err) {
    req.session.error = {roomAdd: err.toString()};
  });
};
