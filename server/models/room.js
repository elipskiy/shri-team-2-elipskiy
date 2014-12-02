/*jshint -W079 */
'use strict';

var mongoose = require('mongoose');
var colorize = require('../libs/colorize');
var id = require('../libs/idGenerator');
var Promise = require('es6-promise').Promise;
var saveModel = require('../libs/promiseSaveMongo.js');
var transformUser = require('../libs/transformUser.js');

var Schema = mongoose.Schema;
var schemaOptions = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};

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
  lang: {
    type: String,
    default: 'javascript'
  },
  users: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    userCursor: {
      type: Schema.Types.Mixed,
      default: {row: 0, column: 0}
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
}, schemaOptions);

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
      if (!room.findUser(userId)) {
        room.users.push({
          user: userId,
          userColor: room.getColor()
        });

        saveModel(room).then(function(room) {
          resolve(room);
        }, function(err) {
          reject(err);
        });
      } else {
        resolve(room);
      }
    });
  },

  removeUser: function(userId) {
    var room = this;

    return new Promise(function(resolve, reject) {
      var foundUser = room.findUser(userId);

      if (!foundUser) {
        reject(new Error('removeUser(userId): User not exist in room'));
      } else {
        room.restoreColor(foundUser.user.userColor);
        room.users.splice(foundUser.pos, 1);

        saveModel(room).then(function(room) {
          resolve(room);
        }, function(err) {
          reject(err);
        });
      }
    });
  },

  userSetCursor: function(userId, position) {
    var room = this;

    return new Promise(function(resolve, reject) {
      if (!position || !position.column || !position.row) {
        if (typeof(position.column) !== 'number' || typeof(position.row) !== 'number') {
          reject(new Error('userSetCursor(userId, position): Position is not valid'));
        }
      }
      var foundUser = room.findUser(userId);

      if (!foundUser) {
        reject(new Error('userSetCursor(userId, position): User not exist in room'));
      } else {
        foundUser.user.userCursor = position;

        saveModel(room).then(function(room) {
          resolve(room);
        }, function(err) {
          reject(err);
        });
      }
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

      saveModel(room).then(function(room) {
        resolve(room);
      }, function(err) {
        reject(err);
      });
    });
  },

  restore: function() {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.deleted = false;

      saveModel(room).then(function(room) {
        resolve(room);
      }, function(err) {
        reject(err);
      });
    });
  },

  setLang: function(lang) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.lang = lang;

      saveModel(room).then(function(room) {
        resolve(room);
      }, function(err) {
        reject(err);
      });
    });
  },

  findUser: function(userId) {
    var found;
    this.users.some(function(user, pos) {
      if (user.user.toString() === userId.toString()) {
        found = {
          user: user,
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

RoomSchema.statics = {
  newRoom: function(name, description, creator) {
    return new Promise(function(resolve, reject) {
      RoomModel.create({name: name, description: description, creator: creator}, function(err, room) {
        if (err) {
          reject(err);
        } else {
          resolve(room);
        }
      });
    });
  },

  getRoomFromAll: function(docName) {
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

  getRoom: function(docName) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.findOne({docName: docName, deleted: false})
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
            reject(new Error('getRoomWithCreator(docName, creator): Rooms with creator does not exist'));
          }
        });
    });
  },

  getUsers: function(docName) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.findOne({docName: docName})
        .populate('users.user', 'email displayName name gravatarHash')
        .exec(function(err, foundUsers) {
          if (err) {
            reject(err);
          } else if (foundUsers) {
            var resUsers = [];
            foundUsers.users.some(function(user) {
              resUsers.push(transformUser(user));
            });
            resolve(resUsers);
          } else {
            reject(new Error('getUsers(docName): Room doesnt exist'));
          }
        });
    });
  },

  getUser: function(docName, userId) {
    var room = this;

    return new Promise(function(resolve, reject) {
      room.findOne({docName: docName})
        .populate('users.user', 'email displayName name gravatarHash')
        .exec(function(err, foundUsers) {
          if (err) {
            reject(err);
          } else if (foundUsers) {
            var foundUser;
            foundUsers.users.some(function(user) {
              if (user.user._id.toString() === userId.toString()) {
                foundUser = transformUser(user);
              }
            });

            if (foundUser) {
              resolve(foundUser);
            } else {
              reject(new Error('getUser(docName, userId): Such user not found'));
            }
          } else {
            reject(new Error('getUser(docName, userId): Room doesnt exist'));
          }
        });
    });
  }
};

RoomSchema.path('name').validate(function(name) {
  return name.length;
}, 'Project Name not specified.');

var RoomModel = mongoose.model('Room', RoomSchema);

module.exports = RoomModel;
