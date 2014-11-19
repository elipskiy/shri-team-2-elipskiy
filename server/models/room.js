'use strict';

var mongoose = require('mongoose');
var colorize = require('../libs/colorize');
var id = require('../libs/idGenerator');
var Promise = require('es6-promise').Promise;

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    require: true
  },
  docName: {
    type: String,
    unique: true,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  description: {
    type: String,
    default: ''
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  users: [{
    user: {
      // type: String,
      type: Schema.ObjectId,
      ref: 'User'
    },
    userCursor: {
      type: Schema.Types.Mixed,
      default: {row: 0, collumn: 0}
    },
    userColor: {
      type: String,
      default: 'rgb(55, 191, 92);'
    }
  }],
  colors: [{
    type: String
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RoomSchema.pre('save', function(next) {
  if (this.isNew) {
    this.colors = colorize();
    this.docName = id();
  }

  next();
});

RoomSchema.methods = {
  addUser: function(userId) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.users.push({
        user: userId,
        userColor: room.getColor()
      });

      room.save(function(err, room) {
        if (err) {
          reject(err);
        } else {
          resolve(room);
        }
      });
    });
  },

  removeUser: function(userId) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.users.some(function(user, pos) {
        if (user.user.toString() === userId.toString()) {
          room.restoreColor(user.userColor);
          room.users.splice(pos, 1);
        }
      });

      room.save(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  },

  userSetCursor: function(userId, position) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.users.some(function(user, pos) {
        if (user.user.toString() === userId.toString()) {
          user.userCursor = position;
        }
      });

      room.save(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  },

  getColor: function() {
    if (this.colors.length) {
      return this.colors.pop();
    } else {
      var r = Math.round((Math.random() * 255) / 2);
      var g = Math.round((Math.random() * 255) / 2);
      var b = Math.round((Math.random() * 255) / 2);
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    this.save();
  },

  restoreColor: function(color) {
    this.colors.push(color);

    this.save();
  },

  delete: function() {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.deleted = true;
      room.save(function(err, room) {
        if (err) {
          reject(err);
        } else {
          resolve(room);
        }
      });
    });
  },

  restore: function() {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.deleted = false;
      room.save(function(err, room) {
        if (err) {
          reject(err);
        } else {
          resolve(room);
        }
      });
    });
  }
};

RoomSchema.statics = {
  getRoom: function(docName) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.findOne({docName: docName})
        .exec(function(err, foundRoom) {
          if (err) {
            reject(err);
          } else if (foundRoom) {
            resolve(foundRoom);
          } else {
            reject(new Error('Room does not exist'));
          }
        });
    });
  },

  getRoomWithCreator: function(docName, creator) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.findOne({docName: docName, creator: creator})
        .exec(function(err, foundRoom) {
          if (err) {
            reject(err);
          } else if (foundRoom) {
            resolve(foundRoom);
          } else {
            reject(new Error('Room does not exist'));
          }
        });
    });
  },

  getUsers: function(docName) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.findOne({docName: docName})
        .populate('users.user', 'email')
        .exec(function(err, foundUsers) {
          if (err) {
            reject(err);
          } else {
            var resUsers = [];
            foundUsers.users.some(function(user) {
              resUsers.push(transformUser(user));
            });
            resolve(resUsers);
          }
        });
    });
  },

  getUser: function(docName, userId) {
    var room = this;

    return new Promise(function(resolve, reject) {
      // room.findOne({docName: docName, 'users.user': userId})
      room.findOne({docName: docName})
        .populate('users.user', 'email')
        .exec(function(err, foundUsers) {
          if (err) {
            reject(err);
          } else {
            var foundUser;
            foundUsers.users.some(function(user) {
              if (user.user._id.toString() === userId.toString()) {
                foundUser = transformUser(user);
              }
            });

            if (foundUser) {
              resolve(foundUser);
            } else {
              reject(new Error('getUser(): such user not found'));
            }
          }
        });
    });
  }
};

var transformUser = function(user) {
  return {
    userId: user.user._id.toString(),
    userName: user.user.email,
    userColor: user.userColor,
    userCursor: user.userCursor
  };
};

var RoomModel = mongoose.model('Room', RoomSchema);

module.exports = RoomModel;
