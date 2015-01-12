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
        "project": true
      }
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', function () {
  gulp.watch('lib/*.js', ['compile']);
  gulp.watch('plant.js', ['compile']);
});
