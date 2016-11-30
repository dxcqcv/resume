var gulp = require('gulp');
let gutil = require('gulp-util');
var pug = require('gulp-pug');
var puglint = require('gulp-pug-lint');
let webpack = require('webpack');
let webpackConfig = require('./webpack.config.js');
let browserSync = require('browser-sync');
let ghPages = require('gulp-gh-pages');

/**
 * check pug syntax
 */
 gulp.task('checkGulp', function(){
   return gulp.src('app/src/html/index.pug')
   .pipe(puglint);
 })

/**
 * utility
 */
let highlight = (str) => {
  return str.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\`(.+?)\`/g,'<strong>$1</strong>');
}
/**
 * get json data 
 */
var locals = (function getLocals() {
  let resumeData = require('./resume.json');
  let localePath = './i18n/'+ resumeData.data_lang +'/dist.js';
  let locals = require(localePath);
  
  for(let item in resumeData) {
    locals[item] = resumeData[item];
  }
  
  locals.highlight = highlight;
  return locals;
}());
/**
 * pug to html
 */
 gulp.task('html',function(){
   return gulp.src('./app/src/html/index.pug')
   .pipe(pug({
     locals: locals
   }))
   .pipe(gulp.dest('./app/dist/html'))
 });

/**
 * deploy task just build
 */
//gulp.task('build-for-deploy', gulp.series('static','webpack'));

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

/**
 * move static to dist
 */
gulp.task('static', function() {
  return gulp.src('./static/**/*', {base: 'static'})
    .pipe(gulp.dest('./app/dist/static'))
});

/**
 * make page to gh
 */
gulp.task('deploy', ()=>{
  return gulp.src('./app/dist/**/*')
    .pipe(ghPages())
});

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
 * default task that build and watch
 */
gulp.task('default', gulp.series('static','html','webpack','browser-sync','compile'));