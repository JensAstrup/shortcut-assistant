const baseConfig = require('./webpack.config.js');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
    ...baseConfig,
    mode: 'development',
    devtool: 'inline-source-map',
    watch: true,
    plugins: [
        new Dotenv(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
};
