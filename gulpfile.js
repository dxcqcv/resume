var gulp = require('gulp');
let gutil = require('gulp-util');
let webpack = require('webpack');
let webpackConfig = require('./webpack.config.js');
let browserSync = require('browser-sync');

/**
 * watch src folder change then run webpack
 * watch dist folder change then reload browser
 */
gulp.task('compile',function(){
  gulp.watch('app/src/**',['webpack']);
  gulp.watch('app/dist/**').on('change',(event) => {
    browserSync.reload();
  }); 
});

/**
 * build browser sync
 */
gulp.task('browser-sync',function(){
  browserSync({
      host: 'localhost',
      port: 3000,
      server: { 
        baseDir: ['app/dist'],
        index: 'html/index.html'
      }
  });
});

/**
 * default task
 */
gulp.task('default', ['webpack','browser-sync','compile']);

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