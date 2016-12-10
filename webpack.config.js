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

// for get multiple entry list
function getEntryList (entry,type) {
  let path = (entry === 0) ? PATHS.app : PATHS.bin
  let glob = require('glob');
  let fileList = [];

  let entryList = glob.sync(path +'/**/*.'+type).reduce(function(o,v,i) {
    let regex = /([^\/]+)(?=\.\w+$)/;
    let index = v.match(regex)[0];
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
                          return element == 'index';
                        })
                        .map(function(entryName){
                          let v = getEntryList(1,'html')[entryName]; // get full path
                          let filenamePath = v.split(/app\/dist\/([^.]*)/)[1] +'.html';
                          let templatePath = v.split(/(app\/dist\/.*)/)[1];
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
                          })
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
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js",".styl"]
    },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'jshint'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'tslint'
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        loader: 'pug-lint'
      }
    ],
    loaders: [
        {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=application/font-woff&name="+ siteDist +"fonts/[name].[ext]":"url?limit=10000&mimetype=application/font-woff&name="+ siteDist +"fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=application/font-woff&name="+ siteDist +"fonts/[name].[ext]" :"url?limit=10000&mimetype=application/font-woff&name="+ siteDist +"fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=application/octet-stream&name="+ siteDist +"fonts/[name].[ext]":"url?limit=10000&mimetype=application/octet-stream&name="+ siteDist +"fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "file?&name="+ siteDist +"fonts/[name].[ext]":"file?&name="+ siteDist +"fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=image/svg+xml&name="+ siteDist +"fonts/[name].[ext]":"url?limit=10000&mimetype=image/svg+xml&name="+ siteDist +"fonts/[name]-[hash:8].[ext]"
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
        loader: ExtractTextPlugin.extract('style',['css','postcss','stylus'])
      },
      /********* url loader*/
      {
        test: /\.(png|jpg)$/,
        exclude: /node_modules/,
        loader: 'url-loader?limit=8192&name=[name]-[hash:8].[ext]'
      }
    ]
  },
    postcss: () => {
    return [
      alias,
      will_change,
      vmin,
      cssnext({browsers:'last 2 versions,> 1%,ie >= 8'}),
      opacity
      ];
  },
  plugins: debug ? [
    /** clean folders */
    new CleanWebpackPlugin(['app/dist/css/','app/dist/js/','app/dist/static/fonts'],{
      root: __dirname,
      verbose: true,
      dry: false 
    }),
    /** commonsPlugin */
    new webpack.optimize.CommonsChunkPlugin("commons", "js/commons.js"),
    /** extract css */
    new ExtractTextPlugin('css/[name].css'),
  ].concat(entryHtmlPlugins):[
        /** clean folders */
    new CleanWebpackPlugin(['app/dist/css/','app/dist/js/','app/dist/static/fonts'],{
      root: __dirname,
      verbose: true,
      dry: false 
    }),
    /** commonsPlugin */
    new webpack.optimize.CommonsChunkPlugin("commons", "js/commons-[hash:8].js"),
    /** extract css */
    new ExtractTextPlugin('css/[name]-[hash:8].css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ].concat(entryHtmlPlugins),
  jshint: {
    esversion: 6
  }
};
