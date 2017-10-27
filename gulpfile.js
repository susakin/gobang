/*jshint esversion: 6 */
var gulp = require('gulp');
var rollup = require('gulp-rollup');
var jshint = require('gulp-jshint');

gulp.task('bundle',function() {
	gulp.src('./src/**/*.js')
	//.pipe(jshint()).pipe(jshint.reporter('default'))
	.pipe(rollup({
		input : 'src/main.js',
		output : 'build/js/main.min.js',
		format: "umd",
		name: 'Player'	
	})).pipe(gulp.dest('./build'));
});

gulp.task('default',function() {
	gulp.watch('./src/**/*.js',['bundle']);
})