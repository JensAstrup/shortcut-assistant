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
      './js/serviceWorker/omnibox/listeners.js'
    ],
    'contentScripts/bundle': [
      './js/contentScripts.js',
      './js/index.js'
    ],
    'analytics': './js/analytics/event.js'
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'] // Add this line
  },

  plugins: [new Dotenv(),
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'jens-astrup',
      project: 'shortcut-assistant',
      environment: process.env.NODE_ENV,
      sourcemaps: {
        filesToDeleteAfterUpload: ['*.js.map']
      }
    })]
}
