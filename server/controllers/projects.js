'use strict';

var db = require('../db.js');

exports.projects = function(req, res) {
  db.user.getById(req.user._id).then(function(user) {
    res.render('projects', {
      user: req.user.email,
      projects: user.rooms,
      gravatar: req.user.gravatarHash
    });
  });
};

exports.create = function(req, res) {
  db.room.create(req.body, req.user._id).then(function(room) {
    res.redirect('/' + room.docName);
  }, function(err) {
    req.session.error = err;
    res.redirect('/projects');
  });
};

exports.remove = function(req, res) {
  db.room.remove(req.params.id, req.user._id).then(function() {
    req.session.success = 'Room is deleted';
    res.redirect('/projects');
  }, function(err) {
    req.session.error = err;
    res.redirect('/projects');
  });
};
