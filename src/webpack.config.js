const path = require('path');

module.exports = {
    mode: 'development', // or 'production'
    devtool: 'cheap-module-source-map',
    entry: {
        'analyze/analyze': './js/analyze/analyze.js',
        'notes/privateNotes': './js/notes/privateNotes.js',
        'developmentTime/bundle': './js/developmentTime.js',
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
};
