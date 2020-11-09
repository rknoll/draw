const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const GoogleAnalyticsPlugin = require('./plugins/GoogleAnalyticsPlugin');

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
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsFilename: path.join(__dirname, 'stats.json'),
    }),
    new GoogleAnalyticsPlugin(process.env.ANALYTICS_ID),
  ],
  profile: true,
  stats: {
    children: false,
    colors: true,
  },
});
