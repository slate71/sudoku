var gulp         = require('gulp'),
	sass         = require('gulp-sass'),
	sourcemaps   = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	jade         = require('gulp-jade'),
	jshint       = require('gulp-jshint'),
	concat       = require('gulp-concat'),
	livereload   = require('gulp-livereload');

var paths = {
	scripts:   ['./src/js/vendor/*.js', './src/js/*.js'],
	styles:    ['./src/scss/*.scss'],
	templates: ['./src/templ/*.jade']
};

gulp.task('lint', function(){
	gulp.src(paths.scripts)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('scripts', function(){
	gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
		  .pipe(concat('app.js'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./dist/'))
		.pipe(livereload());
});

gulp.task('styles', function(){
	gulp.src(paths.styles)
		.pipe(sourcemaps.init())
		  .pipe(sass())
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('./maps'))
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
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.templates, ['templates']);
});

gulp.task('default', ['watch', 'scripts', 'styles', 'templates']);