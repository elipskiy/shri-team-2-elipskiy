/*jshint -W079 */
'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');
var Promise = require('es6-promise').Promise;
var saveModel = require('../libs/promiseSaveMongo.js');
var cleanDeletedRooms = require('../libs/cleanDeletedRooms.js');

var Schema = mongoose.Schema;
var schemaOptions = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String
  },
  gravatarHash: {
    type: String
  },
  name: {
    type: String
  },
  hashedPassword: {
    type: String,
    required: true
  },
  providers: [{
    provider: {
      type: String
    },
    profileId: {
      type: String
    }
  }],
  salt: {
    type: String,
    required: true
  },
  rooms: [{
    room: {
      type: Schema.ObjectId,
      ref: 'Room'
    }
  }],
  created: {
    type: Date,
    default: Date.now
  }
}, schemaOptions);

UserSchema.pre('save', function(next) {
  if (this.email) {
    this.gravatarHash = crypto.createHash('md5').update(this.email.toLowerCase().trim()).digest('hex');
  }

  next();
});

UserSchema.methods = {
  encryptPassword: function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  },

  checkPassword: function(password) {
    var user = this;

    return new Promise(function(resolve, reject) {
      if (user.encryptPassword(password) === user.hashedPassword) {
        resolve(user);
      } else {
        reject(new Error('Incorrect password'));
      }
    });
  },

  addRoom: function(roomId) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.getRoomById(roomId).then(function() {
        return reject(new Error('addRoom(roomId): This room is already added'));
      }, function(err) {
        return resolve(err);
      }).then(function() {
        user.rooms.push({
          room: roomId
        });

        return saveModel(user);
      }).then(function(user) {
        resolve(user);
      }).catch(function(err) {
        reject(err);
      });
    });
  },

  deleteRoom: function(docName) {
    var user = this;

    return new Promise(function(resolve, reject) {
      var foundRoom = user.findRoom(docName);

      if (!foundRoom) {
        reject(new Error('deleteRoom(docName): Room does not exist'));
      } else {
        user.rooms.splice(foundRoom.pos, 1);

        saveModel(user).then(function(user) {
          resolve(user);
        }, function(err) {
          reject(err);
        });
      }
    });
  },

  getRoomById: function(roomId) {
    var user = this;

    return new Promise(function(resolve, reject) {
      var foundRoom;

      user.rooms.some(function(room) {
        if (room.room.id === roomId) {
          foundRoom = room.room;
        }
      });

      if (foundRoom) {
        resolve(foundRoom);
      } else {
        reject(new Error('getRoomById(roomId): Room does not exist'));
      }
    });
  },

  addProvider: function(provider, profileId) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.providers.push({
        provider: provider,
        profileId: profileId
      });

      saveModel(user).then(function(user) {
        resolve(user);
      }, function(err) {
        reject(err);
      });
    });
  },

  findRoom: function(roomId) {
    var found;
    this.rooms.some(function(room, pos) {
      if (room.room.docName.toString() === roomId.toString()) {
        found = {
          room: room,
          pos: pos
        };
      }
    });

    if (found) {
      return found;
    } else {
      return false;
    }
  }
};

UserSchema.statics = {
  findUserById: function(userId) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.findById(userId)
        .populate({
          path: 'rooms.room',
          match: {deleted: false},
          select: 'name description docName lang readOnly createdAt',
          options: {sort: '-createdAt', lean: true}
        })
        .exec(function(err, user) {
          if (err) {
            reject(err);
          } else if (user) {
            user.rooms = cleanDeletedRooms(user.rooms);
            resolve(user);
          } else {
            reject(new Error('findUserById(userId): User does not exist'));
          }
        });
    });
  },

  findUserByName: function(userName) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.findOne({username: userName})
        .populate({
          path: 'rooms.room',
          match: {deleted: false},
          select: 'name description docName lang readOnly createdAt',
          options: {sort: '-createdAt', lean: true}
        })
        .exec(function(err, user) {
          if (err) {
            reject(err);
          } else if (user) {
            user.rooms = cleanDeletedRooms(user.rooms);
            resolve(user);
          } else {
            reject(new Error('findUserByName(userName): User does not exist'));
          }
        });
    });
  },

  findUserByEmail: function(userEmail) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.findOne({email: userEmail})
        .populate({
          path: 'rooms.room',
          match: {deleted: false},
          select: 'name description docName lang readOnly createdAt',
          options: {sort: '-createdAt', lean: true}
        })
        .exec(function(err, user) {
          if (err) {
            reject(err);
          } else if (user) {
            user.rooms = cleanDeletedRooms(user.rooms);
            resolve(user);
          } else {
            reject(new Error('findUserByEmail(userEmail): User does not exist'));
          }
        });
    });
  },

  checkFreeEmail: function(userEmail) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.findOne({email: userEmail})
        .exec(function(err, foundUser) {
          if (err) {
            reject(err);
          } else if (foundUser) {
            reject(new Error('Email already in use'));
          } else {
            resolve(true);
          }
        });
    });
  },

  findUserByProviderId: function(provider, profileId) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.findOne({'providers.provider': provider, 'providers.profileId': profileId})
        .populate({
          path: 'rooms.room',
          match: {deleted: false},
          select: 'name description docName lang readOnly createdAt',
          options: {sort: '-createdAt', lean: true}
        })
        .exec(function(err, user) {
          if (err) {
            reject(err);
          } else if (user) {
            user.rooms = cleanDeletedRooms(user.rooms);
            resolve(user);
          } else {
            reject(new Error('User not found'));
          }
        });
    });
  }
};

UserSchema.virtual('id')
  .set(function(id) {
    this._id = id;
  })
  .get(function() {
    return this._id;
  });

UserSchema.virtual('displayName')
  .set(function(name) {
    this.name = name;
  })
  .get(function() {
    if (this.name) {
      return this.name;
    } else {
      return this.email;
    }
  });

UserSchema.virtual('password')
  .set(function(password) {
    this.salt = crypto.randomBytes(32).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  });

UserSchema.path('email').validate(function(email) {
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email);
}, 'The specified email is invalid.');

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
