'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  gravatarHash: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  hashedPassword: {
    type: String,
    required: true
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
    return this.encryptPassword(password) === this.hashedPassword;
  },

  addRoom: function(roomId, cb) {
    this.rooms.push({
      room: roomId,
    });

    this.save(cb);
  },

  deleteRoom: function(roomId, cb) {
    var _this = this;

    this.rooms.some(function(room, pos) {
      if (room.room === roomId) {
        _this.rooms.splice(pos, 1);
      }
    });

    this.save(cb);
  }
};

UserSchema.statics = {
  getUser: function(userId, cb) {
    this.findById(userId)
      .populate('rooms.room', 'name description docName readOnly', null, {sort: '-createdAt'})
      .exec(cb);
  },

  findUserByName: function(userName, cb) {
    this.findOne({username: userName})
      .populate('rooms.room', 'name description docName readOnly', null, {sort: '-createdAt'})
      .exec(cb);
  },

  findUserByEmail: function(userEmail, cb) {
    this.findOne({email: userEmail})
      .populate('rooms.room', 'name description docName readOnly', null, {sort: '-createdAt'})
      .exec(cb);
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

UserSchema.virtual('fullname')
  .get(function() {
    return this.firstName + ' ' + this.lastName;
  });

UserSchema.path('username').validate(function(username) {
  return username.length;
}, 'Username cannot be blank');

UserSchema.path('username').validate(function(username) {
  var usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(username);
}, 'The specified username is invalid.');

UserSchema.path('email').validate(function(email) {
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email);
}, 'The specified email is invalid.');

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
