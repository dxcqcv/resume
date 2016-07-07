var webpack = require('webpack');

// for extract css
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// path
const path = require('path');
const PATHS = {
  app: path.join(__dirname, 'src'),
  bin: path.join(__dirname, '')
};

// for get multiple entry list
function getEntryList () {
  let glob = require('glob');
  let fileList = [];

  let entryList = glob.sync(PATHS.app+'/**/*.ts').reduce(function(o,v,i) {
    let regex = /([^\/]+)(?=\.\w+$)/;
    let index = v.match(regex)[0];
    o[index] = v;
    return o;
  },{});
  return entryList;
} 

module.exports = {
  entry: getEntryList(),
  output: {
    path: PATHS.bin,
    filename: 'js/[name].js'
  },
      // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js","styl"]
    },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'jshint'
      }
    ],
    loaders: [
      /********* ts to js */
      {
        test:/\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      /********* stylus to css*/
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style',['css','stylus'])
      },
      /********* url loader*/
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        exclude: /node_modules/,
        loader: 'url-loader?limit=8192'
      }
    ]
  },

  plugins: [
    /** commonsPlugin */
    new webpack.optimize.CommonsChunkPlugin("commons", "js/commons.js"),
    /** extract css */
    new ExtractTextPlugin('css/[name].css')
  ],
  jshint: {
    esversion: 6
  }
};