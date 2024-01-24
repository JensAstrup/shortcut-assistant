const {
    sentryWebpackPlugin
} = require("@sentry/webpack-plugin");

const path = require('path');

module.exports = {
    // or 'production'
    mode: 'development',

    devtool: "source-map",

    entry: {
        'analyze/analyze': './js/analyze/analyze.js',
        'notes/privateNotes': './js/notes/privateNotes.js',
        'popup/bundle': './js/popup.js',
        'service_worker/bundle': './js/service_worker.js',
        'contentScripts/bundle': './js/contentScripts.js'
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },

    plugins: [sentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "jens-astrup",
        project: "shortcut-assistant"
    })]
};