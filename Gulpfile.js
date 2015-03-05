var gulp = require('gulp');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var es6transpiler = require('gulp-es6-transpiler');

gulp.task('compile', function() {
  gulp.src(['./lib/*.js', 'plant.js'])
    .pipe(concat('run.js'))
    .pipe(es6transpiler({
      "globals": {
        "Point": true,
        "Path": true,
        "Shape": true,
        "onMouseDown": true,
        "project": true,
        "Papa": true
      }
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('combine', function () {
  gulp.src(['papaparse.js', './dist/run.js'])
      .pipe(concat('run2.js'))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('default', function () {
  gulp.start('compile', 'combine');
  gulp.watch('lib/*.js', ['compile', 'combine']);
  gulp.watch('plant.js', ['compile', 'combine']);
});
