'use strict';

var express = require('express');
var app = express();
var session = require('express-session');
var MongoStore   = require('connect-mongo')(session);

var config = require('./config/config');
var sessionStore = new MongoStore({
  db: 'meepo',
  auto_reconnect: true
});
var sessionMiddleware = session({
  secret: 'meepo',
  saveUninitialized: true,
  resave: true,
  store: sessionStore
});

require('./config/db')(config);
require('./config/express')(app, sessionMiddleware, config);
require('./config/sharejs')(app);
require('./config/passport')(app, config);

require('./routes/')(app);
app.use(function(req, res) {
  res.redirect('/projects'); // 404
});

var server = app.listen(config.port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

require('./config/io')(server, sessionMiddleware);
