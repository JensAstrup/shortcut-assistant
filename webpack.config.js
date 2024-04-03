const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')

require('dotenv').config()
const Dotenv = require('dotenv-webpack')
const {sentryWebpackPlugin} = require('@sentry/webpack-plugin')
const copyConfig = new CopyWebpackPlugin({
  patterns: [
    {from: './src/manifest.json', to: 'manifest.json'},
    {from: './src/assets', to: 'assets'},
    {from: './src/styles', to: 'styles'},
    {from: './src/html', to: 'html'},
    {from: './src/js', to: 'js'},
    {from: './node_modules/**', to: 'node_modules'}
  ]
})

module.exports = {
  mode: 'production',

  devtool: 'source-map',

  entry: {
    'analyze/analyze': './src/js/analyze/analyze.js',
    'popup/bundle': [
      './src/js/popup/Popup.js',
      './src/js/popup/notesPopup.js',
      './src/js/popup/popupInitializer.js'
    ],
    'service_worker/bundle': [
      './src/js/service-worker/service-worker.ts',
      './src/js/service-worker/omnibox/listeners.ts'
    ],
    'contentScripts/bundle': [
      './src/js/contentScripts.js',
      './src/js/index.js',
      './src/js/analyze/contentScript.js'
    ],
    'analytics/bundle': './src/js/analytics/event.ts'
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
    copyConfig,
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
