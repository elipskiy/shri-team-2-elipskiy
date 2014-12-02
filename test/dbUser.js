'use strict';

var chai = require('chai');
var should = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var dbUser = require('../server/db/user');
var dbRoom = require('../server/db/room');
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
  });

  describe('user', function() {

    describe('localReg()', function() {
      var userId = 1;
      var userName = 'vasya';
      var userEmail = 'vasya@test.ru';

      before(function(done) {
        dbUser.localReg(userEmail, 'pass').then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return user', function() {
        return should(dbUser.localReg('petya@test.ru', '12345')).to.eventually.an.instanceof(User);
      });

      it('should be rejected if email already in use', function() {
        return should(dbUser.localReg(userEmail, '123')).to.be.rejected;
      });

      it('should be rejected if email is invalid', function() {
        return should(dbUser.localReg('vasya@', '123')).to.be.rejected;
      });

      it('should be rejected if password is invalid', function() {
        return should(dbUser.localReg('vasya2@test.ru')).to.be.rejected;
      });

    });

    describe('localAuth()', function() {
      var userId = 1;
      var userName = 'vasya';
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';

      before(function(done) {
        dbUser.localReg(userEmail, userPass).then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return user', function() {
        return should(dbUser.localAuth(userEmail, userPass)).to.eventually.deep.property('email', userEmail.toString());
      });

      it('should be rejected if user not exist', function() {
        return should(dbUser.localAuth('petya@test.ru', userPass)).to.be.rejected;
      });

      it('should be rejected if password does not match', function() {
        return should(dbUser.localAuth(userName, '12345')).to.be.rejected;
      });
    });

    describe('getUserById()', function() {
      var userId = 1;
      var userName = 'vasya';
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';

      before(function(done) {
        dbUser.localReg(userEmail, userPass).then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return user', function() {
        return should(dbUser.getById(userId)).to.eventually.deep.property('email', userEmail.toString());
      });

      it('should be rejected if user not exist', function() {
        return should(dbUser.getById('1')).to.be.rejected;
      });
    });

    describe('providerReg()', function() {
      var userId = 1;
      var userEmail = 'vasya@test.ru';

      before(function(done) {
        dbUser.localReg(userEmail, 'pass').then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return True if provider registered', function() {
        return should(dbUser.providerReg('github', {id: '12345'}, userId)).to.eventually.be.true;
      });

      it('should be rejected if user not found', function() {
        return should(dbUser.providerReg('github', {id: '12345'}, 1)).to.be.rejected;
      });

    });

    describe('providerAuth()', function() {
      var userId = 1;
      var userEmail = 'vasya@test.ru';
      var provider = 'provider';
      var providerId = 123;

      before(function(done) {
        dbUser.localReg(userEmail, 'pass').then(function(user) {
          userId = user._id;
          return dbUser.providerReg(provider, {id: providerId}, userId);
        }).then(function() {
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return user', function() {
        return should(dbUser.providerAuth(provider, providerId)).to.eventually.an.instanceof(User);
      });

      it('should be rejected if user with such providerId not found', function() {
        return should(dbUser.providerAuth(provider, '1')).to.be.rejected;
      });

      it('should be rejected if user with such provider not found', function() {
        return should(dbUser.providerAuth('google', providerId)).to.be.rejected;
      });

    });

    describe('update.pass()', function() {
      var userId = 1;
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';

      before(function(done) {
        dbUser.localReg(userEmail, userPass).then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should be rejected if password do not match', function() {
        return should(dbUser.update.pass({newPass: '12345', confirmPass: 'qwerty'}, userId)).to.be.rejected;
      });

      it('should be rejected if new password invalid', function() {
        return should(dbUser.update.pass({newPass: '', confirmPass: ''}, userId)).to.be.rejected;
      });

      it('should be rejected if old password incorrect', function() {
        return should(dbUser.update.pass({newPass: 'yandex', confirmPass: 'yandex', oldPass: 'google'}, userId)).to.be.rejected;
      });

      it('should return user', function() {
        return should(dbUser.update.pass({newPass: 'yandex', confirmPass: 'yandex', oldPass: userPass}, userId)).to.eventually.an.instanceof(User);
      });

    });

    describe('update.data()', function() {
      var userId = 1;
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';
      var displayName = 'Vasya F.';

      before(function(done) {
        dbUser.localReg(userEmail, userPass).then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should be rejected if email invalid', function() {
        return should(dbUser.update.data({displayName: '', email: 'qwe@'}, userId)).to.be.rejected;
      });

      it('should return email as displayName if displayNamde is empty', function() {
        return should(dbUser.update.data({displayName: '', email: 'vasya@yandex.ru'}, userId)).to.eventually.deep.property('displayName', 'vasya@yandex.ru');
      });

      it('should return user', function() {
        return should(dbUser.update.data({displayName: displayName, email: userEmail}, userId)).to.eventually.an.instanceof(User);
      });

    });

    describe('update.addRoom()', function() {
      var userCreatorId = 1;
      var userEmail = 'vasya@test.ru';
      var userPass = 'pass';
      var userId = 1;
      var roomId = 1;

      before(function(done) {
        dbUser.localReg(userEmail, userPass).then(function(user) {
          userCreatorId = user._id;
          return dbRoom.create({projectname: 'test'}, userCreatorId);
        }).then(function(room) {
          roomId = room.docName;
          return dbUser.localReg('petya@test.ru', 'userPass');
        }).then(function(user) {
          userId = user._id;
          done();
        });
      });

      after(function(done) {
        connection.db.dropDatabase();
        done();
      });

      it('should return True if room added', function() {
        return should(dbUser.update.addRoom(userId, roomId)).to.eventually.be.true;
      });

      it('should be rejected if room deleted', function() {
        return dbRoom.remove(roomId, userCreatorId).then(function() {
          return should(dbUser.update.addRoom(userId, roomId)).to.be.rejected;
        });
      });

    });

  });

});
