'use strict';

var passport = require('passport');

module.exports = function(app, db) {

  app.get('/', function(req, res) {
    res.render('signin');
  });

  app.post('/local-auth', passport.authenticate('local-signin', {
      successRedirect: '/projects',
      failureRedirect: '/'
    })
  );

  app.get('/signup', function(req, res) {
    res.render('signup');
  });

  app.post('/local-reg', passport.authenticate('local-signup', {
      successRedirect: '/projects',
      failureRedirect: '/signup'
    })
  );

  app.get('/logout', function(req, res) {
    req.session.destroy(function() {
      res.redirect('/');
    });
  });

  app.get('/projects', ensureAuthenticated, function(req, res) {
    var name = req.user.email;
    var rooms = req.user.rooms;
    var gravatar = req.user.gravatarHash;

    db.user.getById(req.user._id).then(function(user) {
      rooms = user.rooms;

      res.render('projects', {user: name, projects: rooms, gravatar: gravatar});
    });
  });

  app.post('/new-project', ensureAuthenticated, function(req, res) {
    db.room.create(req.body, req.user._id).then(function(room) {
      res.redirect('/' + room.docName);
    }, function(err) {
      req.session.error = err;
      res.redirect('/projects');
    });
  });

  app.get('/remove/:id', ensureAuthenticated, function(req, res) {
    db.room.remove(req.params.id, req.user._id).then(function(room) {
      res.redirect('/projects');
    }, function() {
      res.redirect('/projects');
    });
  });

  app.get('/:id', function(req, res) {
    db.room.get(req.params.id).then(function(room) {
      var name = '';
      var gravatar = '';
      if (req.user) {
        name = req.user.email;
        gravatar = req.user.gravatarHash;
      }
      res.render('index', {user: name, gravatar: gravatar});
    }, function() {
      res.redirect('/projects');
    });
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.error = 'Please sign in!';
    res.redirect('/');
  }
};
