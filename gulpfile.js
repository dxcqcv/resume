var gulp = require('gulp');
let gutil = require('gulp-util');
var pug = require('gulp-pug');
let webpack = require('webpack');
let webpackConfig = require('./webpack.config.js');

/*************** watch ************************/
gulp.task('watch', function(){
  gulp.watch(['./src/**/*.pug'],['html']); 
  gulp.watch(['./src/**/*.styl','./src/**/*.ts'],['webpack']); 
});

/*************** pug to html ************************/
gulp.task('html', function(){
  return gulp.src(['./src/*.pug','./src/**/*.pug'])
             .pipe(pug({pretty:true}))
             .pipe(gulp.dest('./'));
});

/*************** webpack ************************/
gulp.task('webpack', function(callback){
  webpack(webpackConfig, function(err,stats){
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('webpack', stats.toString({
      colors: true
    }));      
    callback();
  });
});