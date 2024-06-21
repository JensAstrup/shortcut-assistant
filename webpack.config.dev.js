const { sentryWebpackPlugin } = require('@sentry/webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const baseConfig = require('./webpack.config.js')


module.exports = {
  ...baseConfig,
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  plugins: [
    ...baseConfig.plugins,
  ]
}
