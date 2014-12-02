'use strict';

var dbRoom = require('../db/room');
var debug = require('../config/config').debug;
console.log(debug);

function checkSession(socket) {
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

  socket.emit('connectedUserReadonly', {readonly: socket.readonly});
}

module.exports = function(io) {

  io.on('connection', function(socket) {
    checkSession(socket);

    socket.on('userConnectToRoom', function(roomId) {
      socket.roomId = roomId;
      socket.join(roomId);
      socket.emit('userConnectedToRoom', {id: socket.userId});

      dbRoom.getUsers(roomId).then(function(users) {
        io.to(roomId).emit('updateUserList', users);
      }).catch(function(error) {
        if (debug) {
          console.log('userConnectToRoom: ', error);
        }
      });
    });

    socket.on('userConnect', function() {
      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;
      var userId = socket.userId;

      dbRoom.update.addUser(roomId, userId).then(function() {
        return dbRoom.getUsers(roomId);
      }).then(function(users) {
        io.to(roomId).emit('updateUserList', users);
      }).catch(function(error) {
        if (debug) {
          console.log('userConnect: ', error);
        }
      });
    });

    socket.on('disconnect', function() {
      socket.leave(roomId);

      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;
      var userId = socket.userId;

      io.to(roomId).emit('editorMarkerRemove', {userId: userId});
      dbRoom.update.removeUser(roomId, userId).then(function() {
        return dbRoom.getUsers(roomId);
      }).then(function(users) {
        io.to(roomId).emit('updateUserList', users);
      }).catch(function(error) {
        if (debug) {
          console.log('disconnect: ', error);
        }
      });
    });

    socket.on('userUpdateCursorPosition', function(position) {
      checkSession(socket);
      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;
      var userId = socket.userId;

      dbRoom.user.setCursor(roomId, userId, position).then(function() {
        return dbRoom.user.get(roomId, userId);
      }).then(function(user) {
        io.to(roomId).emit('editorMarkerUpdate', user);
      }).catch(function(error) {
        if (debug) {
          console.log('userUpdateCursorPosition: ', error);
        }
      });
    });

    socket.on('userChatMessage', function(message) {
      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;
      var userId = socket.userId;

      dbRoom.user.get(roomId, userId).then(function(user) {
        io.to(roomId).emit('userChatMessage', {user: user, message: message});
      }).catch(function(error) {
        if (debug) {
          console.log('userChatMessage: ', error);
        }
      });
    });

    socket.on('roomChangeLang', function(lang) {
      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;

      dbRoom.update.lang(roomId, lang).then(function() {
        io.to(roomId).emit('roomChangedLang', {lang: lang});
      }).catch(function(error) {
        if (debug) {
          console.log('roomChangeLang: ', error);
        }
      });
    });
  });
};
