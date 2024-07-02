// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

// eslint-disable-next-line import/order,@typescript-eslint/no-var-requires
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin')
// eslint-disable-next-line import/order,@typescript-eslint/no-var-requires
const baseConfig = require('./webpack.config.base')


process.env.SENTRY_RELEASE = process.env.VERSION



module.exports = {

  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : 'source-map',

  entry: {
    'js/analyze/analyze': './src/js/analyze/listeners.ts',
    'js/popup/bundle': [
      './src/js/popup/popup.ts',
      './src/js/popup/notes-popup.ts',
      './src/js/popup/initializer.ts',
      './src/js/auth/oauth/oauth.ts',
    ],
    'js/service_worker/bundle': [
      './src/js/service-worker/service-worker.ts',
      './src/js/service-worker/omnibox/listeners.ts',
      './src/js/service-worker/listeners',
      './src/js/auth/oauth/service-worker/listener.ts'
    ],
    'js/contentScripts/bundle': [
      './src/js/content-scripts.ts',
      './src/js/index.ts',
      './src/js/additional-content/content-script.ts',
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
    alias: {
      // Translate TypeScript paths to Webpack aliases
      '@sx': path.resolve(__dirname, './src/js/')
    },
    extensions: ['.tsx', '.ts', '.js']
  },

  plugins: [
    ...baseConfig.plugins,
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
