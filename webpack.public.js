const merge = require('webpack-merge');
const webpack = require('webpack');
const prod = require('./webpack.prod.js');

module.exports = merge(
  {
    plugins: [
      new webpack.DefinePlugin({
        PUBLIC: 'true'
      })
    ]
  },
  prod
);
