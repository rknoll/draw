const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name].[contenthash:8].js',
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: 'disabled', generateStatsFile: true }),
  ],
  profile: true,
  stats: {
    children: false,
    colors: true,
  },
});
