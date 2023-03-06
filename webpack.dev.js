const { merge } = require('webpack-merge');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development', // loads uglifyjsplugin
  devtool: 'source-map',
  watch: true,
  snapshot: {
        managedPaths: [],
  },
  // when symlinks.resolve is false, we need this to make sure dev server picks up the changes in the symlinked files and rebuilds
  watchOptions: {
    followSymlinks: true,
  },
  resolve: {
  // Uncomment the following line when working with local packages
  // More reading : https://webpack.js.org/configuration/resolve/#resolvesymlinks
    symlinks: false,
  },
});
