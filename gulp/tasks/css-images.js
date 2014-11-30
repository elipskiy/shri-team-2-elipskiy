var gulp = require('gulp');
var bem = require('gulp-bem');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var config = require('../config');

gulp.task('css-images', ['tree'], function() {
  function buildImg(page) {
    return global.tree.deps(config.tree.pagesPath + '/' + page.id)
      .pipe(bem.src('*.{svg,png,icon}'))
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(config.img.dest));
  }

  return bem.objects(config.tree.pagesPath).map(buildImg);
});
