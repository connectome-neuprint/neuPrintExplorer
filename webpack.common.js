const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/index.html",
    filename: path.resolve(__dirname, 'build', 'index.html'),
    title: 'Caching'
});
const cleanPlugin = new CleanWebpackPlugin(['build']);
const miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: 'css/style.[contenthash].css',
});
const copyWebpackPlugin = new CopyWebpackPlugin([
    { from: 'public', to: 'public', toType: 'dir' },
    { from: 'external', to: 'external', toType: 'dir' }
]);

module.exports = {
    entry: {
        app: './src/js/app.js'
    },
    plugins: [
        htmlPlugin,
        cleanPlugin,
        miniCssExtractPlugin,
        copyWebpackPlugin
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'js/[name].[contenthash].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: [
                    'webpack.config.js',
                    'src/**/*.js'
                ],
                exclude: /node_modules/,
                use: ['eslint-loader']
            }
        ]
    }
}