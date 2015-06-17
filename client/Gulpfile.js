var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var reactify = require('reactify');
var sass = require('gulp-sass');
var template = require('gulp-template');
var rename = require('gulp-rename');
var babelify = require('babelify');

function logError(err) {
  console.log(err.message)
}

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass({
      includePaths: require('node-neat').includePaths
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {

  ["servicesOverview.js","traceDetail.js","listing.js"].forEach( function(entryFile){
    browserify({
      entries: ['./js/'+entryFile],
      transform: [reactify,babelify],
      debug: true,
      cache: {}, packageCache: {}, fullPaths: true
    }).bundle()
      .on('error',logError)
      .pipe(source(entryFile))
      .pipe(gulp.dest('dist/js'));
  });
});

function buildHtmlFile(htmlFile,jsFile){
  return gulp.src('_layout.html')
        .pipe(template({jsFile: jsFile}))
        .pipe(rename(htmlFile+'.html'))
        .pipe(gulp.dest('dist'));
}

gulp.task('html', function(){
  buildHtmlFile('index','servicesOverview');
  buildHtmlFile('listing','listing');
  buildHtmlFile('trace','traceDetail');
});

gulp.task('copy', function(){
  gulp.src('images/**/*')
    .pipe(gulp.dest('dist/images'));

  gulp.src(['js/d3.min.js','js/react-with-addons-0.13.3.js'])
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build',['copy','html','js','sass']);

gulp.task('watch', ['build'], function() {
  gulp.watch('./js/**/*', ['js']);
  gulp.watch('./sass/**/*', ['sass']);
  gulp.watch('./*.html', ['html']);
  gulp.watch('./images/**/*', ['copy']);
});


gulp.task('default',['build']);
