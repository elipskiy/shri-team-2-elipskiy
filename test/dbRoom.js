'use strict';

var chai = require('chai');
var should = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var dbRoom = require('../server/db/room');
var dbUser = require('../server/db/user');
var mongoose = require('mongoose');
var Room = require('../server/models/room');
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
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should create room', function() {
        return should(dbRoom.create({projectname: 'test'}, userId)).to.eventually.an.instanceof(Room);
      });

      it('should be rejected if room name does not exist', function() {
        return should(dbRoom.create({projectname: ''})).to.be.rejected;
      });

      it('should be rejected if creator not found', function() {
        return should(dbRoom.create({projectname: 'test'}, 1)).to.be.rejected;
      });

    });

    describe('remove()', function() {
      var userCreatorId = '1';
      var userId = '1';
      var roomId = '1';

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userCreatorId = user._id;
          return userCreatorId;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
              dbUser.update.addRoom(userId, roomId).then(function() {
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

      it('should be rejected if room name does not exist', function() {
        return should(dbRoom.remove(1, userId)).to.be.rejected;
      });

      it('should be rejected if creator not found', function() {
        return should(dbRoom.remove(roomId, 1)).to.be.rejected;
      });

      it('should remove the room user not creator', function() {
        return should(dbRoom.remove(roomId, userId)).to.eventually.be.true;
      })

      it('should remove room', function() {
        return should(dbRoom.remove(roomId, userCreatorId)).to.eventually.be.true;
      });

      it('should be rejected if room not found for user not creator', function() {
        return should(dbRoom.remove(roomId, userId)).to.be.rejected;
      });

    });

    describe('restore()', function() {
      var userCreatorId = '1';
      var userId = '1';
      var roomId = '1';

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userCreatorId = user._id;
        }).then(function() {
          dbRoom.create({projectname: 'test'}, userCreatorId).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
              dbUser.update.addRoom(userId, roomId).then(function() {
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

      it('should be rejected if room name does not exist', function() {
        return should(dbRoom.restore('1', userId)).to.be.rejected;
      });

      it('should be rejected if creator not found', function() {
        return should(dbRoom.restore(roomId, '1')).to.be.rejected;
      });

      it('should restore the room user not creator', function() {
        return dbRoom.remove(roomId, userId).then(function() {
          return should(dbRoom.restore(roomId, userId)).to.eventually.be.true;
        });
      });

      it('should restore room', function() {
        return dbRoom.remove(roomId, userCreatorId).then(function() {
          return should(dbRoom.restore(roomId, userCreatorId)).to.eventually.be.true;
        });
      });

    });

    describe('getRoom()', function() {
      var userId = '1';
      var roomId = '1';

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userId = user._id;
          return userId;
        }).then(function(userId) {
          dbRoom.create({projectname: 'test'}, userId).then(function(room) {
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
        return should(dbRoom.get(roomId)).to.eventually.be.instanceof(Room);
      });

      it('should be rejected if room doesnt exist', function() {
        return should(dbRoom.get(2)).to.be.rejected;
      });

      it('should be rejected if room deleted', function() {
        return dbRoom.remove(roomId, userId).then(function() {
          return should(dbRoom.get(roomId)).to.be.rejected;
        });
      });

    });

    describe('getUsers()', function() {
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          return user._id;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg('vasya2@test.ru', 'pass').then(function(user) {
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
        return dbRoom.update.addUser(roomId, userId).then(function() {
          return should(dbRoom.getUsers(roomId)).to.eventually.deep.property('[0].userId', userId.toString());
        });
      });

      it('should be rejected if room doesnt exist', function() {
        return should(dbRoom.getUsers(2)).to.be.rejected;
      });

    });


    describe('update.addUser()', function() {
      var userCreatorId = '1';
      var userId = '1';
      var roomId = '1';

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userCreatorId = user.id;
          return user._id;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg('vasya2@test.ru', 'pass').then(function(user) {
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
        return dbRoom.update.addUser(roomId, userId).then(function() {
          return should(dbRoom.getUsers(roomId)).to.eventually.have.length(1);
        });
      });

      it('should return room if user already added', function() {
        return dbRoom.update.addUser(roomId, userId).then(function() {
          return should(dbRoom.getUsers(roomId)).to.eventually.have.length(1);
        });
      });

      it('should be rejected if room doesnt exist', function() {
        return should(dbRoom.update.addUser(2, userId)).to.be.rejected;
      });

      it('should be rejected if user doesnt exist', function() {
        return should(dbRoom.update.addUser(roomId, 1)).to.be.rejected;
      });

      it('should be rejected if room deleted', function() {
        return dbRoom.remove(roomId, userCreatorId).then(function() {
          return should(dbRoom.update.addUser(roomId, userId)).to.be.rejected;
        });
      });
    });


    describe('update.removeUser()', function() {
      var userCreatorId = 1;
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userCreatorId = user.id;
          return user._id;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
            }).then(function() {
              dbRoom.update.addUser(roomId, userId).then(function() {
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
        return dbRoom.update.removeUser(roomId, userId).then(function(t) {
          return should(dbRoom.getUsers(roomId)).to.eventually.be.empty;
        });
      });

      it('should return True if user removed', function() {
        return dbRoom.update.addUser(roomId, userId).then(function() {
          return should(dbRoom.update.removeUser(roomId, userId)).to.eventually.be.true;
        });
      });

      it('should be rejected if user not exist in room', function() {
        return should(dbRoom.update.removeUser(roomId, 42)).to.be.rejected;
      });

      it('should be rejected if room doesnt exist', function() {
        return should(dbRoom.update.removeUser(2, userId)).to.be.rejected;
      });

      it('should be rejected if room deleted', function() {
        return dbRoom.remove(roomId, userCreatorId).then(function() {
          return should(dbRoom.update.removeUser(roomId, userId)).to.be.rejected;
        });
      });

    });

    describe('update.lang()', function() {
      var userCreatorId = 1;
      var userId = 1;
      var roomId = 1;
      var lang = 'mysticalscript';

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userCreatorId = user.id;
          return user._id;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            done();
          });
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return True if lang updated', function() {
        return should(dbRoom.update.lang(roomId, lang)).to.eventually.be.true;
      });

      it('should be rejected if room deleted', function() {
        return dbRoom.remove(roomId, userCreatorId).then(function() {
          return should(dbRoom.update.lang(roomId, lang)).to.be.rejected;
        });
      });

    });

    describe('user.setCursor()', function() {
      var userCreatorId = 1;
      var userId = 1;
      var roomId = 1;
      var cursor = {row: 1, column: 1};

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          userCreatorId = user.id;
          return user._id;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg('vasya2@test.ru', 'pass').then(function(user) {
              userId = user._id;
            }).then(function() {
              dbRoom.update.addUser(roomId, userId).then(function() {
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
        return dbRoom.user.setCursor(roomId, userId, cursor).then(function() {
          return should(dbRoom.user.get(roomId, userId)).to.eventually.deep.property('userCursor.row', cursor.row);
        }).then(function() {
          return should(dbRoom.user.get(roomId, userId)).to.eventually.deep.property('userCursor.column', cursor.column);
        });
      });

      it('should be rejected if room doesnt exist', function() {
        return should(dbRoom.user.setCursor(2, userId, cursor)).to.be.rejected;
      });

      it('should be rejected if user doesnt exist', function() {
        return should(dbRoom.user.setCursor(roomId, 1, cursor)).to.be.rejected;
      });

      it('should be rejected if position is not valid', function() {
        return should(dbRoom.user.setCursor(roomId, userId, {r:1})).to.be.rejected;
      });

      it('should be rejected if room deleted', function() {
        return dbRoom.remove(roomId, userCreatorId).then(function() {
          return should(dbRoom.user.setCursor(roomId, userId, cursor)).to.be.rejected;
        });
      });

    });

    describe('user.get()', function() {
      var userId = 1;
      var roomId = 1;
      var userEmail = 'vasya2@test.ru';

      before(function(done) {
        dbUser.localReg('vasya@test.ru', 'pass').then(function(user) {
          return user._id;
        }).then(function(user) {
          dbRoom.create({projectname: 'test'}, user).then(function(room) {
            roomId = room.docName;
          }).then(function() {
            dbUser.localReg(userEmail, 'pass').then(function(user) {
              userId = user._id;
            }).then(function() {
              dbRoom.update.addUser(roomId, userId).then(function() {
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

      it('should return user', function() {
        return should(dbRoom.user.get(roomId, userId)).to.eventually.deep.property('userName', userEmail.toString());
      });

      it('should be rejected if room doesnt exist', function() {
        return should(dbRoom.user.get(2, userId)).to.be.rejected;
      });

      it('should be rejected if such user not found', function() {
        return should(dbRoom.user.get(roomId, 1)).to.be.rejected;
      });

    });

  });

});
