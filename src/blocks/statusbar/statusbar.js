'use strict';

var $ = require('jquery');

$('.statusbar__change-theme').on('click', function() {
  $('body').toggleClass('theme_dark');

  if ($('body').hasClass('theme_dark')) {
    localStorage.MeppoTheme = 'dark';
  } else {
    localStorage.MeppoTheme = 'light';
  }
});
