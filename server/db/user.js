/*jshint -W079 */
'use strict';

var UserModel = require('../models/user');
var Promise = require('es6-promise').Promise;

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

function providerAuthReg(provider, profile) {
  console.log('providerAuthReg(): ', profile);
  return new Promise(function(resolve, reject) {
    UserModel.findUserByProviderEmail(provider, profile.email).then(function(user) {
      if (user) {
        resolve(user);
      } else {
        UserModel.checkFreeEmail(profile.email).then(function() {
          var user = new UserModel({
            provider: provider,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar_url,
            gravatarHash: profile.gravatar_id
          });
          user.save(function(err, user) {
            if (err) {
              reject(err);
            } else {
              resolve(user);
            }
          });
        }, function(err) {
          reject(err);
        });
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

module.exports = {
  localReg: userLocalRegister,
  localAuth: userLocalAuth,
  getById: getUserById,
  providerAuthReg: providerAuthReg
};