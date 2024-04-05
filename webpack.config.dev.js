const baseConfig = require('./webpack.config.js')
const Dotenv = require('dotenv-webpack')
const {sentryWebpackPlugin} = require('@sentry/webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
require('dotenv').config()

module.exports = {
  ...baseConfig,
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  plugins: [new Dotenv(),
    baseConfig.plugins[1]
  ]
}
