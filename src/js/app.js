'use strict';

var connection = require('./socket')();
var guard = require('./guard')();

connection.init();
getUserName();

function getUserName() {
  var userName = localStorage.getItem('app_userName') || guard.askTheName();
  connection.verifyUserName(userName, function(ans) {
    if (!ans) {
      localStorage.removeItem('app_userName');
      getUserName();
    } else {
      localStorage.setItem('app_userName', userName);
      connection.connect(userName);
    }
  });
}

var editor = ace.edit('ace-editor');
editor.setTheme('ace/theme/merbivore_soft');
editor.getSession().setMode('ace/mode/javascript');
editor.getSession().setUseSoftTabs(true);
editor.getSession().setUseWrapMode(true);
editor.setShowPrintMargin(true);
editor.setShowInvisibles(true);
