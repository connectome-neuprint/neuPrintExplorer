const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.config.js');

module.exports = merge(
  {
    plugins: [
      new webpack.DefinePlugin({
        PUBLIC: 'true'
      })
    ]
  },
  common
);
