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
  ]
})

module.exports = {
  mode: 'production',

  devtool: 'source-map',

  entry: {
    'js/analyze/analyze': './src/js/analyze/listeners.ts',
    'js/popup/bundle': [
      './src/js/popup/popup.ts',
      './src/js/popup/notes-popup.ts',
      './src/js/popup/initializer.ts'
    ],
    'js/service_worker/bundle': [
      './src/js/service-worker/service-worker.ts',
      './src/js/service-worker/omnibox/listeners.ts'
    ],
    'js/contentScripts/bundle': [
      './src/js/content-scripts.ts',
      './src/js/index.ts',
      './src/js/comment-box/content-script.ts',
    ],
    'js/analytics/bundle': './src/js/analytics/event.ts'
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
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
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
