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
});

/**
 * utility
 */
let highlight = (str) => {
  return str.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\`(.+?)\`/g,'<strong>$1</strong>');
};
/**
 * get json data 
 */
var locals = function getLocals(version) {
  let resumeData = require(version);
  let localePath = './i18n/'+ resumeData.data_lang +'/dist.js';
  let locals = require(localePath);
  
  for(let item in resumeData) {
    locals[item] = resumeData[item];
  }
  
  locals.highlight = highlight;
  return locals;
};
var localsCn = locals('./resume-cn.json');
var localsEn = locals('./resume-en.json');
/**
 * pug to html
 */
gulp.task('html',function(){
  return gulp.src('./app/src/html/index.pug')
    .pipe(pug({
      locals: localsCn 
    }))
    .pipe(gulp.dest('./app/dist/html'));
});
gulp.task('html-en',function(){
  return gulp.src('./app/src/html/index.pug')
    .pipe(pug({
      locals: localsEn 
    }))
    .pipe(gulp.dest('./app/dist/html-en'));
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
    .pipe(gulp.dest('./app/dist/static'));
});

/**
 * make page to gh
 */
gulp.task('deploy', ()=>{
  return gulp.src('./app/dist/**/*')
    .pipe(ghPages());
});

/**
 * watch src folder change then run webpack
 * watch dist folder change then reload browser
 */
gulp.watch(['app/src/**/*','resume.json'],gulp.series('html','html-en','webpack',function() {
  browserSync.reload();
}));

/**
 * build browser sync
 */
gulp.task('browser-sync',function(){
  browserSync({
    host: 'localhost',
    port: 3000,
    server: { 
      baseDir: ['app/dist'],
      // which html show in server
      //index: 'html-en/index.html'
      index: 'html/index.html'
    }
  });
});


/**
 * default task that build 
 */
// gulp.task('default',gulp.series('static','html','html-en','webpack','browser-sync'));
gulp.task('default',gulp.series('static','html','html-en','webpack','browser-sync'));
