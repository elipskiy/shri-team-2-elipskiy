'use strict';

var $ = require('jquery');
var socket = require('../../js/socket');
require('../../js/share/share');

module.exports = function(editorName) {
  var options = {
    updateCursorPosition: updateCursorPosition
  };

  var editor;
  if (editorName === 'ace') {
    editor = require('./ace-editor')(options);
  }

  socket.on('markerUpdate', editor.updateCursorMarker);
  socket.on('markerRemove', editor.removeMarker);
  socket.on('connectedUserReadonly', editor.editorChangeReadonly);
  socket.on('changeLang', updateLanguage);

  var sbPosition;
  var sbEditor;

  function init() {
    sbPosition = $('#statusbar__position');
    sbEditor = $('#statusbar__editor_lang');
    var docName = document.location.pathname.slice(1);
    openDocument(docName);
  }

  function openDocument(docName) {
      sharejs.open(docName, 'text', function(error, doc) {
      if (error) {
        console.error(error);
        return;
      }

      if (doc.created) {
        doc.insert(0, '(function() {\n  console.log(\'Hello, wolrd!\');\n  // Share your link! (' +
          document.location.href + ')\n})();\n');
      }
      editor.attachToDocument(doc);
    });
  }

  function updateCursorPosition(cursorPosition) {
    sbPosition.text('Line: ' + (cursorPosition.row + 1).toString() +
     ', Column: ' + (cursorPosition.column + 1).toString());
    socket.emit('userCursorPosition', cursorPosition);
  }

  function updateLanguage(data) {
    sbEditor.text(data.lang);
    editor.changeMode(data.lang);
  }

  $('.lang_menu__lang_change').on('click', function() {
    var lang = $(this).data('label');

    $('.dropdown__lang_menu').hide();
    updateLanguage({lang: lang});
    socket.emit('roomChangeLang', lang);
  });

  return {
    init: init
  };
};
