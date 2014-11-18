'use strict';

var $ = require('jquery');

if (localStorage.MeppoTheme === 'light') {
  $('body').removeClass('theme_dark');
} else {
  $('body').addClass('theme_dark');
}
