'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('./libs/mongoose')();
var db = require('./db.js');
var sharejs = require('share');
var passport = require('passport');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');

var SERVER_PORT = 3000;

// app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
var sessionMiddleware = session({secret: 'meepo', saveUninitialized: true, resave: true});
app.use(sessionMiddleware);
io.use(function(socket, next) {
  sessionMiddleware(socket.request, {}, next);
});
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  var err = req.session.error;
  var msg = req.session.notice;
  var success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) {
    res.locals.error = err;
  }
  if (msg) {
    res.locals.notice = msg;
  }
  if (success) {
    res.locals.success = success;
  }

  next();
});
app.use(express.static(__dirname + '/../build'));
app.set('views', __dirname + '/../build');
app.set('view engine', 'jade');

require('./routes')(app, db);
require('./libs/passportLocal')(passport);

mongoose.connect();

io.on('connection', function(socket) {

  if (socket.request.session.passport) {
    if (socket.request.session.passport.user) {
      socket.userId = socket.request.session.passport.user._id;
      socket.readonly = false;
    } else {
      socket.readonly = true;
    }
  } else {
    socket.readonly = true;
  }

  socket.on('connectToRoom', function(roomId) {
    socket.roomId = roomId;
    socket.join(roomId);
    socket.emit('connectedUserId', {id: socket.userId});
    socket.emit('connectedUserReadonly', {readonly: socket.readonly});
    db.room.getUsers(roomId).then(function(users) {
      io.to(roomId).emit('usersUpdate', users);
    });
  });

  socket.on('userConnect', function() {
    if (socket.readonly) {
      return;
    }

    var roomId = socket.roomId;
    var userId = socket.userId;

    db.room.update.addUser(roomId, userId).then(function() {
      return db.room.getUsers(roomId);
    }).then(function(users) {
      io.to(roomId).emit('usersUpdate', users);
    }).catch(function(error) {
      console.log('userConnect: ', error);
    });
  });

  socket.on('disconnect', function() {
    socket.leave(roomId);

    if (socket.readonly) {
      return;
    }

    var roomId = socket.roomId;
    var userId = socket.userId;

    io.to(roomId).emit('markerRemove', {userId: userId});
    db.room.update.removeUser(roomId, userId).then(function() {
      return db.room.getUsers(roomId);
    }).then(function(users) {
      io.to(roomId).emit('usersUpdate', users);
    });
  });

  socket.on('userCursorPosition', function(position) {
    if (socket.readonly) {
      return;
    }

    var roomId = socket.roomId;
    var userId = socket.userId;

    db.room.user.setCursor(roomId, userId, position).then(function() {
      return db.room.user.get(roomId, userId);
    }).then(function(user) {
      io.to(roomId).emit('markerUpdate', user);
    }).catch(function(error) {
      console.log('userCursorPosition: ', error);
    });
  });
});

var server = http.listen(SERVER_PORT, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

var options = {
  db: {
    type: 'mongo',
    opsCollectionPerDoc: false
  },
  browserChannel: {cors: '*'},
  auth: function(client, action) {
    // This auth handler rejects any ops bound for docs starting with 'readonly'.
    if (action.name === 'submit op' && action.docName.match(/^readonly/)) {
      action.reject();
    } else {
      action.accept();
    }
  }
};

sharejs.server.attach(app, options);
