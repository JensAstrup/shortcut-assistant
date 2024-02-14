const {sentryWebpackPlugin} = require("@sentry/webpack-plugin");
const path = require('path');
const Dotenv = require('dotenv-webpack');
require('dotenv').config();

module.exports = {
    mode: 'production',

    devtool: "source-map",

    entry: {
        'analyze/analyze': './js/analyze/analyze.js',
        'notes/privateNotes': './js/notes/privateNotes.js',
        'popup/bundle': [
            './js/popup/popup.js',
            './js/popup/popupLoaded.js',
            './js/popup/listeners.js',
        ],
        'service_worker/bundle': './js/serviceWorker/service_worker.js',
        'contentScripts/bundle': [
            './js/analyze/contentScript.js',
            './js/notes/contentScript.js',
            './js/cycleTime/contentScript.js',
            './js/todoist/contentScript.js',
            './js/developmentTime/contentScript.js',
            './js/contentScripts.js',
        ],
        'analytics': [
            './js/analytics/clientId.js',
            './js/analytics/config.js',
            './js/analytics/event.js',
            './js/analytics/sessionId.js',
        ]
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

    plugins: [new Dotenv(),
        sentryWebpackPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "jens-astrup",
            project: "shortcut-assistant",
            environment: process.env.NODE_ENV,
        })]
};
