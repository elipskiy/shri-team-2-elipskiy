'use strict';

var mongoose = require('mongoose');
var colorize = require('../libs/colorize');
var id = require('../libs/idGenerator');

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
  addUser: function(userId, cb) {
    this.users.push({
      user: userId,
      userColor: this.getColor()
    });

    this.save(cb);
  },

  removeUser: function(userId, cb) {
    var _this = this;
    var foundUser = false;

    this.users.some(function(user, pos) {
      if (user.user.toString() === userId.toString()) {
        _this.restoreColor(user.userColor);
        _this.users.splice(pos, 1);
        foundUser = true;
      }
    });

    this.save();
    cb(foundUser);
  },

  userSetCursor: function(userId, position, cb) {
    this.users.some(function(user) {
      if (user.user.toString() === userId.toString()) {
        user.userCursor = position;
      }
    });

    this.save(cb);
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
  }
};

RoomSchema.statics = {
  getRoom: function(roomId, cb) {
    this.findOne({docName: roomId}, cb);
  },

  getUsers: function(roomId, cb) {
    this.findOne({docName: roomId})
      .populate('users.user', 'username')
      .exec(function(err, data) {
        if (err || !data) {
          cb(err, null);
        } else {
          var resUsers = [];
          data.users.some(function(user) {
            resUsers.push(transformUser(user));
          });
          cb(null, resUsers);
        }
      });
  },

  getUser: function(roomId, userId, cb) {
    this.findOne({docName: roomId, 'users.user': userId})
      .populate('users.user', 'username')
      .exec(function(err, data) {
        if (err || !data) {
          cb(err, null);
        } else {
          data.users.some(function(user) {
            if (user.user._id.toString() === userId.toString()) {
              cb(null, transformUser(user));
            }
          });
        }
      });
  }
};

var transformUser = function(user) {
  var resUser = {};
  resUser.userId = user.user._id.toString();
  resUser.userName = user.user.username;
  resUser.userColor = user.userColor;
  resUser.userCursor = user.userCursor;
  return resUser;
};

var RoomModel = mongoose.model('Room', RoomSchema);

module.exports = RoomModel;
