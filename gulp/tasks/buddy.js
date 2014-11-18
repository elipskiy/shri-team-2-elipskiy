var gulp = require('gulp');
var buddyjs = require('gulp-buddy.js');
var config = require('../config');

gulp.task('buddy', function () {
  return gulp.src([
    config.js.clientSrc,
    config.js.serverSrc
  ].concat(config.js.ignoreSrc).concat('!server/libs/**'))
    .pipe(buddyjs({
      reporter: 'detailed'
    }));
});
