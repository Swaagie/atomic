'use strict';

var nib = require('nib')
  , gulp = require('gulp')
  , concat = require('gulp-concat')
  , uglify = require('gulp-uglify')
  , stylus = require('gulp-stylus')
  , minify = require('gulp-minify-css')
  , sourcemaps = require('gulp-sourcemaps');

//
// Set production flag, useful to exclude sourcemaps.
//
var production = process.env.NODE_ENV === 'production';

//
// Default set of tasks.
//
gulp.task('default', ['script', 'style']);

//
// Define Gulp task to concat and minifiy scripts.
//
gulp.task('script', function script() {
  var work = gulp.src('index.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat(type('atomic.{type}.js')));

  //
  // Only write the source map if we are not building for production.
  //
  if (!production) work.pipe(sourcemaps.write());
  return work.pipe(gulp.dest('dist'));
});

//
// Gulp task to generate CSS from stylus files.
//
gulp.task('style', function style() {
  var work = gulp.src('css/*.styl')
    .pipe(stylus({ use: nib() }))
    .pipe(concat(type('atomic.{type}.css')));

  //
  // Only minify if env is production.
  //
  if (production) work.pipe(minify());
  return work.pipe(gulp.dest('dist'));
});

function type(string) {
  return string.replace('{type}', production ? 'min' : 'dev');
}