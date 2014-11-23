/*jshint -W079 */
'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');
var Promise = require('es6-promise').Promise;

var Schema = mongoose.Schema;

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
    // required: true
  },
  provider: {
    type: String
  },
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
});

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
        reject('Incorrect password');
      }
    });
  },

  addRoom: function(roomId) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.rooms.push({
        room: roomId
      });

      user.save(function(err, user) {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  },

  getRoomById: function(docName) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.rooms.some(function(room) {
        if (room.room.docName === docName) {
          resolve(room.room);
        }
      });

      reject(new Error('getRoomById(docName): Room does not exist'));
    });
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
          select: 'name description docName readOnly createdAt',
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
          select: 'name description docName readOnly createdAt',
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
          select: 'name description docName readOnly createdAt',
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

  findUserByProviderEmail: function(provider, userEmail) {
    var user = this;

    return new Promise(function(resolve, reject) {
      user.findOne({provider: provider, email: userEmail})
        .populate({
          path: 'rooms.room',
          match: {deleted: false},
          select: 'name description docName readOnly createdAt',
          options: {sort: '-createdAt', lean: true}
        })
        .exec(function(err, user) {
          if (err) {
            reject(err);
          } else if (user) {
            user.rooms = cleanDeletedRooms(user.rooms);
            resolve(user);
          } else {
            resolve();
            // reject(new Error('findUserByProviderEmail(provider, userEmail): User does not exist'));
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

UserSchema.virtual('password')
  .set(function(password) {
    this.salt = crypto.randomBytes(32).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  });

UserSchema.path('email').validate(function(email) {
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email);
}, 'The specified email is invalid.');

var cleanDeletedRooms = function(rooms) {
  return rooms.filter(function(room) {
    if (room.room && room.room._id) {
      return true;
    } else {
      return false;
    }
  });
};

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
