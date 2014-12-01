'use strict';

var $ = require('jquery');
var socket = require('../../../js/socket');

socket.on('connectedUserReadonly', changeReadonly);

function changeReadonly(user) {
  if (!user.readonly) {
    $('.head__project .icon__readonly').css('visibility', 'hidden');
  }
}

$('.head__project .icon__add').on('click', function() {
  $.post(
    '/api/add/room/', {
      docName: document.location.pathname.slice(1)
    }, onAddRoomSuccess);
});

function onAddRoomSuccess() {
  $('.head__project .icon__add').css('visibility', 'hidden');
}
