'use strict';

const webpack = require('webpack');

const debug = process.env.NODE_ENV !== 'production';

 
/**
 * postcss
 */
const cssnext = require('postcss-cssnext'); 
const opacity = require('postcss-opacity'); 
const vmin = require('postcss-vmin'); 
const will_change= require('postcss-will-change'); 
const alias = require('postcss-alias');
/**
 * refence
 */
const siteDist = 'static/';
// for clean folders before building
const CleanWebpackPlugin = require('clean-webpack-plugin');
// for creation of HTML
const HtmlWebpackPlugin = require('html-webpack-plugin');
// for extract css
const ExtractTextPlugin = require('extract-text-webpack-plugin');


// path
const path = require('path');
const PATHS = {
  app: path.join(__dirname, '/app/src'),
  bin: path.join(__dirname, '/app/dist')
};

// for get multiple entry list to add CSS and others sources
function getEntryList (entry,type) {
  let path = (entry === 0) ? PATHS.app : PATHS.bin
  let glob = require('glob');
  let fileList = [];

  let entryList = glob.sync(path +'/**/*.'+type).reduce(function(o,v,i,arr) {
    let regex = /([^\/]+)(?=\.\w+$)/g;
    let index = v.match(regex)[0];
    // avoid duplicated index 
    if(Object.keys(o).length !==0 && index === Object.keys(o)[i-1].toString()) {
      index = index + i; 
    }
    o[index] = v;
    return o;
  },{});
  return entryList;
} 
 
/**
 * render html
 */
let entryHtmlPlugins = Object.keys(getEntryList(1,'html'))
  .filter(function(element){
    return element.match(/index?./) ;
  })
  .map(function(entryName){
    let v = getEntryList(1,'html')[entryName]; // get full path
    let filenamePath = v.split(/app\/dist\/([^.]*)/g)[1] +'.html';
    let templatePath = v.split(/(app\/dist\/.*)/g)[1];
    // filter chunks config
    let chunkList = [];
    switch(entryName){
      case 'index':
        chunkList.push('commons','index');
        break;
    }
    return new HtmlWebpackPlugin({
      filename: filenamePath,
      chunks: chunkList,
      template: templatePath
    });
  });

module.exports = {
  entry: getEntryList(0,'ts'),
  output: {
    path: PATHS.bin,
    publicPath: '../',
    filename: debug ? 'js/[name].js' : 'js/[name]-[hash:8].js'
  },
      // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
      enforceModuleExtension: true,
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [ '.webpack.js', '.web.js', '.ts', '.tsx', 'styl']
  },
  module: {
    //preLoaders: [
      //{
        //test: /\.js$/,
        //exclude: /node_modules/,
        //loader: 'jshint'
      //},
      //{
        //test: /\.ts$/,
        //exclude: /node_modules/,
        //loader: 'tslint'
      //},
      //{
        //test: /\.pug$/,
        //exclude: /node_modules/,
        //loader: 'pug-lint'
      //}
    //],
    rules: [
        {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,

        use:[{ loader: 'url-loader',
          options: {
            limit:'10000',
            mimetype:'application/font-woff',
            name: siteDist +'fonts/[name]-[hash:8].[ext]'
          }
        } ]
        }, 
       {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use:[{ loader: 'url-loader',
          options: {
            limit:'10000',
            mimetype:'application/font-woff',
            name: siteDist +'fonts/[name]-[hash:8].[ext]'
          }
        } ]
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use:[{ loader: 'url-loader',
          options: {
            limit:'10000',
            mimetype:'application/octet-stream',
            name: siteDist +'fonts/[name]-[hash:8].[ext]'
          }
        } ]
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use:[{ loader: 'file-loader',
          options: {
            name: siteDist +'fonts/[name]-[hash:8].[ext]'
          }
        } ]
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use:[{ loader: 'url-loader',
          options: {
            limit:'10000',
            mimetype: 'image/svg+xml',
            name: siteDist +'fonts/[name]-[hash:8].[ext]'
          }
        } ]
      },
      /********* ts to js */
      {
        test:/\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      /********* stylus to css*/
      {
        test: /\.(styl|css)$/,
        exclude: ['/node_modules/'],
        use:ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use:['css-loader','postcss-loader','stylus-loader']
        })  
      },
      /********* url loader*/
      {
        test: /\.(png|jpg)$/,
        exclude: /node_modules/,
        use:[{ 
          loader: 'url-loader',
          options: {
            limit: '8192',
            name:'[name]-[hash:8].[ext]'
          }
        } ]
      }
    ]
  },
  plugins: debug ? [
    /** clean folders */
    //new CleanWebpackPlugin(['app/dist/css/','app/dist/js/','app/dist/static/fonts'],{
      //root: __dirname,
      //verbose: true,
      //dry: false 
    //}),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        resolve:{
          extensions: ['.ts', '.tsx', '.js']
        },
        postcss: [
          alias,
          will_change,
          vmin,
          cssnext({browsers:'last 2 versions,> 1%,ie >= 8'}),
          opacity
        ], 
      }
    }),

    /** commonsPlugin */
    new webpack.optimize.CommonsChunkPlugin({name:"commons", filename:"js/commons.js"}),
    /** extract css */
    new ExtractTextPlugin({
      filename:'css/[name].css'}),
      //new HtmlWebpackPlugin({
        //template: 'app/dist/html-en/index.html',
        //filename: 'html-en/index.html'
      //}),
      //new HtmlWebpackPlugin({
        //template: 'app/dist/html/index.html',
        //filename: 'html/index.html'
      //}),
  ].concat(entryHtmlPlugins):[
        /** clean folders */
    //new CleanWebpackPlugin(['app/dist/css/','app/dist/js/','app/dist/static/fonts'],{
      //root: __dirname,
      //verbose: true,
      //dry: false 
    //}),
    /** commonsPlugin */
    new webpack.optimize.CommonsChunkPlugin({name:"commons",filename: "js/commons-[hash:8].js"}),
    /** extract css */
    new ExtractTextPlugin({filename:'css/[name]-[hash:8].css'}),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ].concat(entryHtmlPlugins)
};
