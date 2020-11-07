const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    contentBase: path.join(__dirname, 'public'),
    hot: true,
    proxy: {
      '/api/*': 'http://localhost:3000',
      '/socket.io/*': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
});
