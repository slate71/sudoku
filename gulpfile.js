'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var jade = require('gulp-jade');

var paths = {
    styles:    ['./src/scss/**/*.scss'],
    templates: ['./src/templ/*.jade']
};

var customOptions = {
  entries: ['./src/js/index.js'],
  debug: true
};

var options = assign({}, watchify.args, customOptions);
var b = watchify(browserify(options));

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'));
}

gulp.task('styles', function(){
    gulp.src(paths.styles)
        .pipe(sourcemaps.init())
          .pipe(sass())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'))
        .pipe(livereload());
});

gulp.task('templates', function(){
    gulp.src(paths.templates)
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./'))
        .pipe(livereload());
});

gulp.task('watch', function(){
    livereload.listen();
    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.templates, ['templates']);
});

gulp.task('default', ['watch', 'js', 'styles','templates']);
