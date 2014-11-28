/*jshint -W079 */
'use strict';

var RoomModel = require('../models/room');
var UserModel = require('../models/user');
var Promise = require('es6-promise').Promise;

function createRoom(room, creator) {
  return new Promise(function(resolve, reject) {
    var roomName = room.projectname;
    var roomDescrip = room.description;
    var roomReadonly = room.readonly;

    var newRoom = new RoomModel({name: roomName, description: roomDescrip, readOnly: roomReadonly, creator: creator});
    newRoom.save(function(err, room) {
      if (err) {
        reject(err);
      } else {
        UserModel.findUserById(creator).then(function(user) {
          return user.addRoom(room._id);
        }).then(function() {
          resolve(room);
        }).catch(function(err) {
          reject(err);
        });
      }
    });
  });
}

function removeRoom(roomId, creator) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoomWithCreator(roomId, creator).then(function(room) {
      return room.delete();
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function restoreRoom(roomId, creator) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoomWithCreator(roomId, creator).then(function(room) {
      return room.restore();
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getRoom(roomId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId).then(function(room) {
      resolve(room);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getUsersFromRoom(roomId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getUsers(roomId).then(function(users) {
      resolve(users);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function addUserToRoom(roomId, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId).then(function(room) {
      return room.addUser(userId);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function removeUserFromRoom(roomId, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId).then(function(room) {
      return room.removeUser(userId);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function setLang(roomId, lang) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId).then(function(room) {
      return room.setLang(lang);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function userUpdateCursorPosition(roomId, userId, cursorPosition) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId).then(function(room) {
      return room.userSetCursor(userId, cursorPosition);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getUser(roomId, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getUser(roomId, userId).then(function(user) {
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
