'use strict';

var socket = require('../../js/socket');
var $ = require('jquery');

var userList = $('.user-list');

function onUsersUpdate(users) {
  userList.empty();

  users.forEach(function(user) {
    userList.append(
      $('<li class="user">')
        .append(
          $('<figure class="user__color">').css('backgroundColor', user.userColor)
        )
        .append(user.userName)
    );
  });
}

socket.on('usersUpdate', onUsersUpdate);
