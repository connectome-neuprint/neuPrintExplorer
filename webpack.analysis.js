const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const common = require('./webpack.prod.js');

module.exports = merge(common, {
  plugins: [
    new BundleAnalyzerPlugin({analyzerMode: 'static'})
  ]
});
