'use strict';

var $ = require('jquery');

$('#showpassword').change(function() {
  if (this.checked) {
    $('#password').attr('type', 'text');
  } else {
    $('#password').attr('type', 'password');
  }
});
