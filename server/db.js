/*jshint -W079 */
'use strict';

var Promise = require('es6-promise').Promise;
var RoomModel = require('./models/room');
var UserModel = require('./models/user');

function createRoom(room, creator) {
  return new Promise(function(resolve, reject) {

    var roomName = room.projectname;
    var roomDescrip = room.description;
    var roomReadOnly = room.readonly;
    if (!roomName) {
      reject(new Error('Project Name not specified'));
    }
    if (roomReadOnly === 'on') {
      roomReadOnly = true;
    }

    room = new RoomModel({name: roomName, description: roomDescrip, readOnly: roomReadOnly, creator: creator});
      room.save(function(err, room) {
        if (err) {
          reject(err);
        } else {
          UserModel.getUser(creator, function(err, user) {
            if (err) {
              console.log(err);
              reject(err);
            } else if (user) {
              user.addRoom(room.id);
            } else {
              reject(new Error('User does not exist'));
            }
          });
          resolve(room);
        }
      });
  });
}

function getRoom(roomId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId, function(err, room) {
      if (err) {
        reject(err);
      } else if (room) {
        resolve(room);
      } else {
        reject(new Error('Room not found'));
      }
    });
  });
}

function getUsersFromRoom(roomId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getUsers(roomId, function(err, foundUsers) {
      if (err) {
        reject(err);
      } else if (foundUsers) {
        resolve(foundUsers);
      } else {
        reject(new Error('Room does not exist'));
      }
    });
  });
}

function addUserToRoom(roomId, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId, function(err, room) {
      if (err) {
        reject(err);
      } else if (room) {
        room.addUser(userId, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Room does not exist'));
      }
    });
  });
}

function removeUserFromRoom(roomId, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId, function(err, room) {
      if (err) {
        reject(err);
      } else if (room) {
        room.removeUser(userId, function(found) {
          resolve(found);
        });
      } else {
        reject(new Error('Room does not exist'));
      }
    });
  });
}

function userUpdateCursorPosition(roomId, userId, cursorPosition) {
  return new Promise(function(resolve, reject) {
    RoomModel.getRoom(roomId, function(err, room) {
      if (err) {
        reject(err);
      } else if (room) {
        room.userSetCursor(userId, cursorPosition, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Room does not exist'));
      }
    });
  });
}

function getUser(roomId, userId) {
  return new Promise(function(resolve, reject) {
    RoomModel.getUser(roomId, userId, function(err, user) {
      if (err) {
        reject(err);
      } else if (user) {
        resolve(user);
      } else {
        reject();
      }
    });
  });
}

function userLocalRegister(userEmail, userPassword) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserByEmail(userEmail, function(err, user) {
      if (err) {
        reject(err);
      } else if (user) {
        resolve(false);
      } else {
        user = new UserModel({email: userEmail, password: userPassword});
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
      }
    });
  });
}

function userLocalAuth(userEmail, userPassword) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserByEmail(userEmail, function(err, user) {
      if (err) {
        reject(err);
      } else if (user) {
        if (user.checkPassword(userPassword)) {
          resolve(user);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}

function getUserById(userId) {
  return new Promise(function(resolve, reject) {
    UserModel.getUser(userId, function(err, user) {
      if (err) {
        reject(err);
      } else if (user) {
        resolve(user);
      } else {
        resolve(false);
      }
    });
  });
}

module.exports = {
  room: {
    create: createRoom,
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
