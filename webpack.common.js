const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const Dotenv = require('dotenv-webpack');

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
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'client/sw.js'),
    }),
  ],
  resolve: {
    alias: {
      [path.resolve(__dirname, './assets/sounds')]: path.resolve(__dirname, process.env.SOUND_FILES),
    },
  },
};
