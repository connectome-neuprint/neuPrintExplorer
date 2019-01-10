const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: path.resolve(__dirname, 'build', 'index.html'),
  title: 'Caching'
});
const cleanPlugin = new CleanWebpackPlugin(['build']);
const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: 'css/style.[contenthash].css'
});
const copyWebpackPlugin = new CopyWebpackPlugin([
  { from: 'public', to: 'public', toType: 'dir' },
  { from: 'external', to: 'external', toType: 'dir' },
  {
    from: 'node_modules/@janelia-flyem/neuroglancer/dist/min/chunk_worker.bundle.js',
    to: 'chunk_worker.bundle.js',
    toType: 'file'
  }
]);

module.exports = {
  entry: {
    app: './src/js/app.jsx'
  },
  plugins: [
    htmlPlugin,
    cleanPlugin,
    miniCssExtractPlugin,
    copyWebpackPlugin,
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    })
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'js/[name].[contenthash].bundle.js',
    publicPath: '/'
  },
  mode: 'development',
  watch: true,
  watchOptions: {
    // https://stackoverflow.com/questions/41522721/how-to-watch-certain-node-modules-changes-with-webpack-dev-server
    ignored: [
      /node_modules([\\]+|\/)+(?!@neuprint)/
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './build'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
      helpers: path.resolve(__dirname, 'src/js/helpers'),
      plugins: path.resolve(__dirname, 'src/js/components/plugins'),
      views: path.resolve(__dirname, 'src/js/components/view-plugins'),
      actions: path.resolve(__dirname, 'src/js/actions')
    },
    symlinks: false,
    extensions: ['.js', '.jsx', '.react.js']
  }
};
