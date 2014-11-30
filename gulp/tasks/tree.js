var gulp = require('gulp');
var bem = require('gulp-bem');
var config = require('../config').tree;

var levels = [
  config.blocksPath,
  config.pagesPath
];

gulp.task('tree', function () {
  global.tree = bem.objects(levels)
    .pipe(bem.deps())
    .pipe(bem.tree());
});
