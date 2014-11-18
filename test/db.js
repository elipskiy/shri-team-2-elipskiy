'use strict';

var chai = require('chai');
var should = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var db = require('../server/db.js');
var mongoose = require('mongoose');
var Room = require('../server/models/room');
var User = require('../server/models/user');
var connection;

chai.use(chaiAsPromised);

describe('db', function() {

  before(function(done) {
    mongoose.connect('mongodb://localhost/testMeepo');
    connection = mongoose.connection;
    done();
  });

  after(function(done) {
    connection.close();
    done();
  })

  describe('room', function() {

    describe('create()', function() {
      var userId = 1;

      before(function(done) {
        db.user.localReg('vasya@test.ru', 'pass').then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should create room', function() {
        return should(db.room.create({projectname: 'test'}, userId)).to.eventually.an.instanceof(Room);
      });

      it('should be rejected if room name does not exist', function() {
        return should(db.room.create({})).to.be.rejected;
      });

      it('should be rejected if creator not found', function() {
        return should(db.room.create({projectname: 'test'}, 1)).to.be.rejected;
      });

    });


    describe('getRoom()', function() {
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        db.user.localReg('vasya@test.ru', 'pass').then(function(user) {
          userId = user._id;
          return userId
        }).then(function(userId) {
          db.room.create({projectname: 'test'}, userId).then(function(room) {
            roomId = room.docName;
            done();
          });
        })
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return exist room', function() {
        return should(db.room.get(roomId)).to.eventually.be.instanceof(Room);
      });

      it('should be rejected if room doesnt exist', function() {
        return should(db.room.get(2)).to.be.rejected;
      });

    });


    describe('update.addUser()', function() {
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        db.user.localReg('vasya@test.ru', 'pass').then(function(user) {
          return user._id;
        }).then(function(user) {
          db.room.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            db.user.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
              done();
            });
          });
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should add user to room', function() {
        return db.room.update.addUser(roomId, userId).then(function() {
          return should(db.room.getUsers(roomId)).to.eventually.have.length(1);
        });
      });

      it('should be rejected if room doesnt exist', function() {
        return should(db.room.update.addUser(2, userId)).to.be.rejected;
      });

      it('should be rejected if user doesnt exist', function() {
        return should(db.room.update.addUser(roomId, 1)).to.be.rejected;
      });

    });


    describe('update.removeUser()', function() {
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        db.user.localReg('vasya@test.ru', 'pass').then(function(user) {
          return user._id;
        }).then(function(user) {
          db.room.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            db.user.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
            }).then(function() {
              db.room.update.addUser(roomId, userId).then(function() {
                done();
              });
            });
          });
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should remove user from room', function() {
        return db.room.update.removeUser(roomId, userId).then(function(t) {
          return should(db.room.getUsers(roomId)).to.eventually.be.empty;
        });
      });

      it('should return True if user removed', function() {
        return db.room.update.addUser(roomId, userId).then(function() {
          return should(db.room.update.removeUser(roomId, userId)).to.eventually.be.true;
        });
      });

      it('should return False if user not exist in room', function() {
        return should(db.room.update.removeUser(roomId, 42)).to.eventually.be.false;
      });

      it('should be rejected if room doesnt exist', function() {
        return should(db.room.update.removeUser(2, userId)).to.be.rejected;
      });

    });


    describe('getUsers()', function() {
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        db.user.localReg('vasya@test.ru', 'pass').then(function(user) {
          return user._id;
        }).then(function(user) {
          db.room.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            db.user.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
            }).then(function() {
              done();
            });
          });
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return users from room', function() {
        return db.room.update.addUser(roomId, userId).then(function() {
          return should(db.room.getUsers(roomId)).to.eventually.deep.property('[0].userId', userId.toString());
        });
      });

      it('should be rejected if room doesnt exist', function() {
        return should(db.room.getUsers(2)).to.be.rejected;
      });

    });

    describe('user.setCursor()', function() {
      var userId = 1;
      var roomId = 1;
      var cursor = {row: 1, collumn: 1};

      before(function(done) {
        db.user.localReg('vasya@test.ru', 'pass').then(function(user) {
          return user._id;
        }).then(function(user) {
          db.room.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            db.user.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
            }).then(function() {
              db.room.update.addUser(roomId, userId).then(function() {
                done();
              });
            });
          });
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should set cursor user', function() {
        return db.room.user.setCursor(roomId, userId, cursor).then(function() {
          return should(db.room.user.get(roomId, userId)).to.eventually.deep.property('userCursor.row', cursor.row);
        }).then(function() {
          return should(db.room.user.get(roomId, userId)).to.eventually.deep.property('userCursor.collumn', cursor.collumn);
        });
      });

      it('should be rejected if room doesnt exist', function() {
        return should(db.room.user.setCursor(2, userId, cursor)).to.be.rejected;
      });

    });

    describe('user.localAuth()', function() {
      var userId = 1;
      var userName = 'vasya';
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';

      before(function(done) {
        db.user.localReg(userEmail, userPass).then(function(user) {
          userId = user._id;
        }).then(function() {
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return user', function() {
        return should(db.user.localAuth(userEmail, userPass)).to.eventually.deep.property('email', userEmail.toString());
      });

      it('should return False if user not exist', function() {
        return should(db.user.localAuth('petya@test.ru', userPass)).to.eventually.be.false;
      });

      it('should return False if password does not match', function() {
        return should(db.user.localAuth(userName, '12345')).to.eventually.be.false;
      });
    });

    describe('user.getUserById()', function() {
      var userId = 1;
      var userName = 'vasya';
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';

      before(function(done) {
        db.user.localReg(userEmail, userPass).then(function(user) {
          userId = user._id;
        }).then(function() {
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return user', function() {
        return should(db.user.getById(userId)).to.eventually.deep.property('email', userEmail.toString());
      });

      it('should be rejected if user not exist', function() {
        return should(db.user.getById('1')).to.be.rejected;
      });
    });

  });

});
