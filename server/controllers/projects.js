'use strict';

var dbRoom = require('../db/room');
var dbUser = require('../db/user');

exports.projects = function(req, res) {
  dbUser.getById(req.user._id).then(function(user) {
    res.render('projects', {
      user: user.displayName,
      projects: user.rooms,
      gravatar: req.user.gravatarHash
    });
  });
};

exports.create = function(req, res) {
  dbRoom.create(req.body, req.user._id).then(function(room) {
    res.redirect('/' + room.docName);
  }, function(err) {
    req.session.error = {create: err.toString()};
    res.redirect('/projects');
  });
};

exports.remove = function(req, res) {
  dbRoom.remove(req.params.id, req.user._id).then(function() {
    req.session.success = {
      removed: true,
      docName: req.params.id
    };
    res.redirect('/projects');
  }, function(err) {
    req.session.error = {remove: err.toString()};
    res.redirect('/projects');
  });
};

exports.restore = function(req, res) {
  dbRoom.restore(req.params.id, req.user._id).then(function() {
    res.redirect('/projects');
  }, function(err) {
    req.session.error = {restore: err.toString()};
    res.redirect('/projects');
  });
};
