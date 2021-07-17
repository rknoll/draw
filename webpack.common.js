const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();

require('dotenv-defaults').config();

module.exports = {
  entry: path.join(__dirname, 'client/index.js'),
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/,
        options: {
          configFile: path.join(__dirname, 'babel.config.js'),
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|ogg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[contenthash:8].[ext]',
            outputPath: 'assets',
          },
        }],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[contenthash:8].[ext]',
            outputPath: 'fonts',
          },
        }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'client/index.html'),
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(__dirname, 'assets/logo.svg'),
      prefix: 'assets/[hash:8]/',
      favicons: {
        appleStatusBarStyle: 'black',
        start_url: '/',
      },
    }),
    new Dotenv({
      safe: true,
      systemvars: true,
      silent: true,
      defaults: true,
    }),
    !process.env.COMMITHASH && gitRevisionPlugin,
    new webpack.DefinePlugin({
      'BUILDTIME': JSON.stringify(new Date().toISOString()),
      'COMMITHASH': JSON.stringify(process.env.COMMITHASH || gitRevisionPlugin.commithash()),
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      [path.resolve(__dirname, './assets/sounds')]: path.resolve(__dirname, process.env.SOUND_FILES),
    },
  },
};
