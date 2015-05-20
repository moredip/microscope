var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
//var watchify = require('watchify');
var reactify = require('reactify');
 
gulp.task('build', function () {
  browserify({
    entries: ['./js/app.js'],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }).bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('dist'));


  browserify({
    entries: ['./js/listing.js'],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }).bundle()
    .pipe(source('listing.js'))
    .pipe(gulp.dest('dist'))
});

gulp.task('default',['build']);
