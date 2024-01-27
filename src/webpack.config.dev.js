const baseConfig = require('./webpack.config.js');
const Dotenv = require('dotenv-webpack');

module.exports = {
    ...baseConfig,
    mode: 'development',
    devtool: 'inline-source-map',
    watch: true,
    plugins: [
        new Dotenv(),
    ],
};
