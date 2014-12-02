/*jshint -W079 */
'use strict';

var RoomModel = require('../models/room');
var UserModel = require('../models/user');
var Promise = require('es6-promise').Promise;

function createRoom(room, creator) {
  return new Promise(function(resolve, reject) {
    var roomName = room.projectname;
    var roomDescription = room.description;
    var createdRoom;

    RoomModel.newRoom(roomName, roomDescription, creator).then(function(room) {
      createdRoom = room;
      return UserModel.findUserById(creator);
    }).then(function(user) {
      return user.addRoom(createdRoom.id);
    }).then(function() {
      resolve(createdRoom);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function removeRoom(docName, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(docName).then(function(room) {
      if (room.creator.toString() === userId.toString()) {
        return room.delete();
      } else {
        return UserModel.findUserById(userId).then(function(user) {
          return user.deleteRoom(docName);
        });
      }
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function restoreRoom(docName, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoomFromAll(docName).then(function(room) {
      if (room.creator.toString() === userId.toString()) {
        return room.restore();
      } else {
        return UserModel.findUserById(userId).then(function(user) {
          return user.addRoom(room.id);
        });
      }
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getRoom(docName) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(docName).then(function(room) {
      resolve(room);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getUsersFromRoom(docName) {
  return new Promise(function(resolve, reject) {
    RoomModel.getUsers(docName).then(function(users) {
      resolve(users);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function addUserToRoom(docName, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(docName).then(function(room) {
      return room.addUser(userId);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function removeUserFromRoom(docName, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(docName).then(function(room) {
      return room.removeUser(userId);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function setLang(docName, lang) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(docName).then(function(room) {
      return room.setLang(lang);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function userUpdateCursorPosition(docName, userId, cursorPosition) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(docName).then(function(room) {
      return room.userSetCursor(userId, cursorPosition);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getUser(docName, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getUser(docName, userId).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
}

module.exports = {
  create: createRoom,
  remove: removeRoom,
  restore: restoreRoom,
  get: getRoom,
  getUsers: getUsersFromRoom,
  update: {
    addUser: addUserToRoom,
    removeUser: removeUserFromRoom,
    lang: setLang
  },
  user: {
    setCursor: userUpdateCursorPosition,
    get: getUser
  }
};
