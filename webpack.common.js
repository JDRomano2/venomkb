'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        path.join(__dirname, 'venomkb.js')
    ],
    plugins: [
        new HtmlWebpackPlugin({
            template: 'venomkb.html',
            inject: 'body',
            filename: 'index.html'
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new ExtractTextPlugin('styles.css')
    ],
    output: {
        path: path.join(__dirname, '/index/dist'),
        filename: '[name].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!sass-loader',
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg|ico)$/,
                exclude: /node_modules/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(zip|csv|tsv|pn)$/i,
                exclude: /node_modules/,
                use: [
                    'file-loader?name=[name].[ext]'
                ]
            },
            {
                test: /\.ttf$/,
                use: 'url-loader'
            }
        ]
    }
};
