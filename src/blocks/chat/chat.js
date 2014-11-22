'use strict';

var $ = require('jquery');
var socket = require('../../js/socket');

$('.chat__input').keypress(function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();

    if ($(this).val() !== ' ') {
      socket.emit('userChatMessage', $(this).val());
    }

    $(this).val('');
  }
});

var messages = $('.chat__messages');

function onNewMessage(data) {
  messages.append(
    $('<div class="chat__message">')
      .append(
        $('<img class="message__avatar">').css('backgroundColor', data.user.userColor)
          .attr('src', 'http://www.gravatar.com/avatar/' + data.user.userGravatar + '?s=30&d=blank')
      )
      .append(
        $('<span class="message__message">').text(data.message)
      )
      .append(
        $('<span class="message__color">').css('backgroundColor', data.user.userColor)
      )
  );
}

socket.on('userChatMessage', onNewMessage);
