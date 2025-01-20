var gulp = require('gulp')
  , gutil = require('gulp-util')
  , concat = require('gulp-concat')
  , minifycss = require('gulp-minify-css')
  , uglify = require('gulp-uglify')
  , useref = require('gulp-useref');

var html = {
  source: 'src',
  target: 'dist'
}

var css = {
  source: 'src/css',
  target: 'dist/css'
};

var js = {
  source: 'src/js',
  target: 'dist/js'
};

gulp.task('html', function() {
  gulp.src([
    html.source + '/*.html'
  ])
  .pipe(useref({noAssets: true}))
  .pipe(gulp.dest(html.target));
});

gulp.task('css', function() {
  gulp.src([
    css.source + '/*.css'
  ])
  .pipe(minifycss())
  .pipe(concat('all.min.css'))
  .pipe(gulp.dest(css.target));
});

gulp.task('js', function() {
  gulp.src([
    js.source + '/*.js'
  ])
  .pipe(uglify({mangle:true}).on('error', gutil.log))
  .pipe(concat('all.min.js'))
  .pipe(gulp.dest(js.target));
});

gulp.task('default', ['html', 'css', 'js']);

gulp.task('watch', function() {
  gulp.watch(html.source + '/*.html', ['html']);
  gulp.watch(css.source + '/*.css', ['css']);
  gulp.watch(js.source + '/*.js', ['js']);
});
