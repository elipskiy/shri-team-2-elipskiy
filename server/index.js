'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('./libs/mongoose')();
var sharejs = require('share');
var passport = require('passport');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');

var SERVER_PORT = process.env.PORT || 3000;
var sessionMiddleware = session({
  secret: 'meepo',
  saveUninitialized: true,
  resave: true
});

// app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
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

require('./routes')(app);
require('./libs/passportLocal')(passport);
require('./socket')(io);

mongoose.connect();

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
    if (action.name === 'submit op' && action.docName.match(/^readonly/)) {
      action.reject();
    } else {
      action.accept();
    }
  }
};

sharejs.server.attach(app, options);
