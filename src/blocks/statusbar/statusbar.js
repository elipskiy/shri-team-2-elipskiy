'use strict';

var $ = require('jquery');

$('.statusbar__change-theme').on('click', function() {
  $('body').toggleClass('theme_dark');

  if ($('body').hasClass('theme_dark')) {
    localStorage.MeppoTheme = 'dark';

    $('.ace_editor').removeClass('ace-solarized-light').addClass('ace-solarized-dark ace_dark');
  } else {
    localStorage.MeppoTheme = 'light';

    $('.ace_editor').removeClass('ace-solarized-dark ace_dark').addClass('ace-solarized-light');
  }
});
