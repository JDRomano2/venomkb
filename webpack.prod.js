'use strict';

const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    output: {
        filename: '[name].min.js'
    },
    plugins: [
        new UglifyJSPlugin({
            compressor: {
                warnings: false,
                screw_ie8: true
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
});
