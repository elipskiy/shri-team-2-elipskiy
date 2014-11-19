/*jshint -W079 */
'use strict';

var RoomModel = require('./models/room');
var UserModel = require('./models/user');
var Promise = require('es6-promise').Promise;

function createRoom(room, creator) {
  return new Promise(function(resolve, reject) {
    var roomName = room.projectname;
    var roomDescrip = room.description;
    var roomReadonly = room.readonly;
    if (!roomName) {
      reject(new Error('Project Name not specified'));
    }
    if (roomReadonly === 'on') {
      roomReadonly = true;
    }

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

function userLocalRegister(userEmail, userPassword) {
  return new Promise(function(resolve, reject) {
    UserModel.checkFreeEmail(userEmail).then(function() {
      var user = new UserModel({email: userEmail, password: userPassword});
      user.save(function(err, user) {
        if (err) {
          if (err.errors) {
            if (err.errors.email) {
              reject(err.errors.email.message);
            }
          } else {
            reject(err);
          }
        } else {
          resolve(user);
        }
      });
    }).catch(function(err) {
      reject(err);
    });
  });
}

function userLocalAuth(userEmail, userPassword) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserByEmail(userEmail).then(function(user) {
      return user.checkPassword(userPassword);
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getUserById(userId) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserById(userId).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
}

module.exports = {
  room: {
    create: createRoom,
    remove: removeRoom,
    get: getRoom,
    getUsers: getUsersFromRoom,
    update: {
      addUser: addUserToRoom,
      removeUser: removeUserFromRoom,
    },
    user: {
      setCursor: userUpdateCursorPosition,
      get: getUser
    }
  },
  user: {
    localReg: userLocalRegister,
    localAuth: userLocalAuth,
    getById: getUserById
  }
};
