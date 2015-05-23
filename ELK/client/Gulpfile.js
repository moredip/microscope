var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
//var watchify = require('watchify');
var reactify = require('reactify');

function logError(err) {
  console.log(err.message)
}
 
gulp.task('build', function () {

  ["servicesOverview.js","traceDetail.js","listing.js"].forEach( function(entryFile){
    browserify({
      entries: ['./js/'+entryFile],
      transform: [reactify],
      debug: true,
      cache: {}, packageCache: {}, fullPaths: true
    }).bundle()
      .on('error',logError)
      .pipe(source(entryFile))
      .pipe(gulp.dest('dist'));
  });
});

gulp.task('watch', ['build'], function() {
  gulp.watch('./js/**/*', ['build']);
});

gulp.task('default',['build']);
