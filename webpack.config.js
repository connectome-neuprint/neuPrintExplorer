const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: path.resolve(__dirname, 'build', 'index.html'),
  title: 'Caching'
});
const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: 'css/style.[contenthash].css'
});
const copyWebpackPlugin = new CopyWebpackPlugin({
  patterns: [
    { from: 'public', to: 'public', toType: 'dir' },
    {
      from: 'node_modules/@janelia-flyem/neuroglancer/dist/module/chunk_worker.bundle.js',
      to: 'chunk_worker.bundle.js',
      toType: 'file'
    },
    {
      from: 'node_modules/@janelia-flyem/neuroglancer/dist/module/async_computation.bundle.js',
      to: 'async_computation.bundle.js',
      toType: 'file'
    },
    {
      from: 'node_modules/@janelia-flyem/neuroglancer/dist/module/main.css',
      to: 'ng.css',
      toType: 'file'
    },
    {
      from: 'public/mockServiceWorker.js',
      to: 'mockServiceWorker.js',
      toType: 'file'
    },

  ]
});

module.exports = {
  entry: {
    app: './src/js/app.jsx'
  },
  plugins: [
    htmlPlugin,
    new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ['build']}),
    miniCssExtractPlugin,
    copyWebpackPlugin,
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      PUBLIC: 'false'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'js/[name].[contenthash].bundle.js',
    chunkFilename: 'js/[name].[contenthash].bundle.js',
    publicPath: '/'
  },
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  devServer: {
    static: './build'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: ['babel-loader']
      },
      {
        test: /\.jsx?$/,
        use: ['source-map-loader'],
        exclude: [/node_modules\/@janelia-flyem\/neuroglancer/, /node_modules\/swagger-client/],
        enforce: 'pre'
      },
      {
          test: /\.svg$/,
          loader: require.resolve('svg-inline-loader'),
          options: {removeSVGTagAttrs: false, removeTags: true}
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
      containers: path.resolve(__dirname, 'src/js/containers'),
      components: path.resolve(__dirname, 'src/js/components'),
      helpers: path.resolve(__dirname, 'src/js/helpers'),
      plugins: path.resolve(__dirname, 'src/js/plugins'),
      views: path.resolve(__dirname, 'src/js/components/view-plugins'),
      actions: path.resolve(__dirname, 'src/js/actions')
    },
    symlinks: false,
    extensions: ['.js', '.jsx', '.react.js']
  }
};
