var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var reactify = require('reactify');
var sass = require('gulp-sass');

function logError(err) {
  console.log(err.message)
}

gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {

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

gulp.task('build',['js','sass']);
gulp.task('watch', ['build'], function() {
  gulp.watch('./js/**/*', ['js']);
  gulp.watch('./sass/**/*', ['sass']);
});


gulp.task('default',['build']);
