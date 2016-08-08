var gulp = require('gulp');
let gutil = require('gulp-util');
let webpack = require('webpack');
let webpackConfig = require('./webpack.config.js');
let browserSync = require('browser-sync');
let ghPages = require('gulp-gh-pages');

/**
 * make page to gh
 */
gulp.task('deploy',['build-for-deploy'], ()=>{
  return gulp.src('./app/dist/**/*')
    .pipe(ghPages())
})

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
 * move static to dist
 */
gulp.task('static', ()=> {
  return gulp.src('./static/**/*', {base: 'static'})
    .pipe(gulp.dest('./app/dist/static'))
});

/**
 * default task that build and watch
 */
gulp.task('default', ['static','webpack','browser-sync','compile']);

/**
 * deploy task just build
 */
gulp.task('build-for-deploy', ['static','webpack']);

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