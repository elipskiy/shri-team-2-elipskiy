'use strict';

var chai = require('chai');
var should = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var dbUser = require('../server/db/user');
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
        return should(dbUser.localReg('vasya@', '')).to.be.rejected;
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
        }).then(function() {
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
        }).then(function() {
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

  });

});
