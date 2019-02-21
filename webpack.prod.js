const merge = require('webpack-merge');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'production', // loads uglifyjsplugin
  devtool: 'source-map',
  watch: false,
  plugins: [
    new BundleAnalyzerPlugin({analyzerMode: 'static'})
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
});
