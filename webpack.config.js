'use strict';

const webpack = require('webpack');

const debug = process.env.NODE_ENV !== 'production';

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
function getLocals() {
  let resumeData = require('./resume.json');
  let localePath = './i18n/'+ resumeData.data_lang +'/dist.js';
  let locals = require(localePath);
  
  for(let item in resumeData) {
    locals[item] = resumeData[item];
  }
  
  locals.highlight = highlight;
  return locals;
}
 
/**
 * postcss
 */
const autoprefixer = require('autoprefixer'); 
/**
 * refence
 */
const siteDist = '../';
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
function getEntryList (type) {
  let glob = require('glob');
  let fileList = [];

  let entryList = glob.sync(PATHS.app+'/**/*.'+type).reduce(function(o,v,i) {
    let regex = /([^\/]+)(?=\.\w+$)/;
    let index = v.match(regex)[0];
    o[index] = v;
    return o;
  },{});
  return entryList;
} 

/**
 * loop multiple files
 */
let entryHtmlPlugins = Object.keys(getEntryList('pug'))
                        .filter(function(element){
                          return element == 'index';
                        })
                        .map(function(entryName){
                          let v = getEntryList('pug')[entryName]; // get full path
                          let filenamePath = v.split(/app\/src\/([^.]*)/)[1] +'.html';
                          let templatePath = v.split(/(app\/src\/.*)/)[1];
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
  entry: getEntryList('ts'),
  output: {
    path: PATHS.bin,
    publicPath: debug ? siteDist :'{{site.baseurl}}/',
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
      }
    ],
    loaders: [
        {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=application/font-woff&name="+ siteDist +"fonts/[name].[ext]":"url?limit=10000&mimetype=application/font-woff&name=./fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=application/font-woff&name=./fonts/[name].[ext]" :"url?limit=10000&mimetype=application/font-woff&name=./fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=application/octet-stream&name=./fonts/[name].[ext]":"url?limit=10000&mimetype=application/octet-stream&name=./fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "file?&name=./fonts/[name].[ext]":"file?&name=./fonts/[name]-[hash:8].[ext]"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: debug? "url?limit=10000&mimetype=image/svg+xml&name=./fonts/[name].[ext]":"url?limit=10000&mimetype=image/svg+xml&name=./fonts/[name]-[hash:8].[ext]"
      },
      /********* css to js */
      {
        test: /\.css$/,
        exclude: ['/node_modules/'],
        loader: ExtractTextPlugin.extract('style',['css','postcss'],{publicPath:'.'})
      },
      /********* pug to js */
      {
        test:/\.pug$/,
        exclude: ['/node_modules/'],
        loader: 'pug-html',
        query: {
          data: getLocals(),
          pretty: true
        }
      },
      /********* ts to js */
      {
        test:/\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      /********* stylus to css*/
      {
        test: /\.styl$/,
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
    return [autoprefixer];
  },
  plugins: debug ? [
    /** clean folders */
    new CleanWebpackPlugin(['css/','js/','_site/js/','_site/css/'],{
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
    new CleanWebpackPlugin(['css/','js/','_site/js/','_site/css/'],{
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
