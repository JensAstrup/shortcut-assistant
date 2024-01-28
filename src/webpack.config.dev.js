const baseConfig = require('./webpack.config.js');
const Dotenv = require('dotenv-webpack')
const {sentryWebpackPlugin} = require('@sentry/webpack-plugin')
require('dotenv').config();

module.exports = {
    ...baseConfig,
    mode: 'development',
    devtool: 'inline-source-map',
    watch: true,
    plugins: [new Dotenv(),
        sentryWebpackPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "jens-astrup",
            project: "shortcut-assistant",
            environment: 'development',
        })]
};
