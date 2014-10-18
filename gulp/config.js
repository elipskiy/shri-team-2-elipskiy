var dest = 'build'

module.exports = {
  copyStatic: {
    src: 'client/**',
    dst: dest
  },
  css: {
    src: 'blocks/**/*.css',
    concatSrc: 'index/index.css',
    browsers: ['last 2 versions'],
    cascade: false,
    dest: dest
  }
}