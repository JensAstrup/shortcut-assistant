const {sentryWebpackPlugin} = require('@sentry/webpack-plugin')
const path = require('path')
const Dotenv = require('dotenv-webpack')
require('dotenv').config()

module.exports = {
  mode: 'production',

  devtool: 'source-map',

  entry: {
    'analyze/analyze': './js/analyze/analyze.js',
    'popup/bundle': [
      './js/popup/Popup.js',
      './js/popup/notesPopup.js',
      './js/popup/popupInitializer.js'
    ],
    'service_worker/bundle': [
      './js/serviceWorker/service_worker.js',
      './js/serviceWorker/fetch_completion.js',
      './js/serviceWorker/omnibox/listeners.js',
      './js/serviceWorker/omnibox/omnibox.js'
    ],
    'contentScripts/bundle': './js/contentScripts.js',
    'analytics': [
      './js/analytics/clientId.js',
      './js/analytics/config.js',
      './js/analytics/event.js',
      './js/analytics/sessionId.js'
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
          loader: 'babel-loader'
        }
      }
    ]
  },

  plugins: [new Dotenv(),
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'jens-astrup',
      project: 'shortcut-assistant',
      environment: process.env.NODE_ENV
    })]
}
