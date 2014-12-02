/*jshint -W079 */
'use strict';

var UserModel = require('../models/user');
var RoomModel = require('../models/room');
var Promise = require('es6-promise').Promise;
var save = require('../libs/promiseSaveMongo.js');

function userLocalRegister(userEmail, userPassword) {
  return new Promise(function(resolve, reject) {
    UserModel.checkFreeEmail(userEmail).then(function() {
      return UserModel.create({email: userEmail, password: userPassword});
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      if (err.errors) {
        if (err.errors.email) {
          reject(err.errors.email.message);
        }
      } else {
        reject(err);
      }
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

function userProviderReg(provider, profile, userId) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserById(userId).then(function(user) {
      return user.addProvider(provider, profile.id);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function userProviderAuth(provider, profileId) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserByProviderId(provider, profileId).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function userUpdatePassword(passwords, userId) {
  return new Promise(function(resolve, reject) {
    if (passwords.newPass !== passwords.confirmPass) {
      reject(new Error('Passwords do not match'));
    } else if (!passwords.newPass.length) {
      reject(new Error('Password invalid'));
    } else {
      var foundUser;
      UserModel.findUserById(userId).then(function(user) {
        foundUser = user;
        return user.checkPassword(passwords.oldPass);
      }).then(function() {
        foundUser.password = passwords.newPass;
        return save(foundUser);
      }).then(function(user) {
        resolve(user);
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}

function userUpdateData(data, userId) {
  return new Promise(function(resolve, reject) {
    UserModel.findUserById(userId).then(function(user) {
      user.name = data.displayName;
      user.email = data.email;
      return save(user);
    }).then(function(user) {
      resolve(user);
    }).catch(function(err) {
      if (err.errors) {
        if (err.errors.email) {
          reject(err.errors.email.message);
        }
      } else {
        reject(err);
      }
    });
  });
}

function userUpdateRoom(userId, docName) {
  return new Promise(function(resolve, reject) {
    var roomId;
    RoomModel.getRoom(docName).then(function(room) {
      roomId = room.id;
      return UserModel.findUserById(userId);
    }).then(function(user) {
      return user.addRoom(roomId);
    }).then(function() {
      resolve(true);
    }).catch(function(err) {
      reject(err);
    });
  });
}

module.exports = {
  localReg: userLocalRegister,
  localAuth: userLocalAuth,
  getById: getUserById,
  providerReg: userProviderReg,
  providerAuth: userProviderAuth,
  update: {
    pass: userUpdatePassword,
    data: userUpdateData,
    addRoom: userUpdateRoom
  }
};
