'use strict';

var dbRoom = require('../db/room');

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

    socket.on('connectToRoom', function(roomId) {
      socket.roomId = roomId;
      socket.join(roomId);
      socket.emit('connectedUserId', {id: socket.userId});
      dbRoom.getUsers(roomId).then(function(users) {
        io.to(roomId).emit('usersUpdate', users);
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
      dbRoom.update.removeUser(roomId, userId).then(function() {
        return dbRoom.getUsers(roomId);
      }).then(function(users) {
        io.to(roomId).emit('usersUpdate', users);
      });
    });

    socket.on('userCursorPosition', function(position) {
      checkSession(socket);
      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;
      var userId = socket.userId;

      dbRoom.user.setCursor(roomId, userId, position).then(function() {
        return dbRoom.user.get(roomId, userId);
      }).then(function(user) {
        io.to(roomId).emit('markerUpdate', user);
      }).catch(function(error) {
        console.log('userCursorPosition: ', error);
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
      });
    });

    socket.on('roomChangeLang', function(lang) {
      if (socket.readonly) {
        return;
      }

      var roomId = socket.roomId;

      dbRoom.update.lang(roomId, lang).then(function() {
        io.to(roomId).emit('changeLang', {lang: lang});
      }).catch(function(error) {
        console.log('roomChangeLang: ', error);
      });
    });
  });

};
