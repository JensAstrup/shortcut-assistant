// eslint-disable-next-line @typescript-eslint/no-var-requires
const { copyConfig } = require('./copyConfig')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./webpack.config.js')


module.exports = {
  ...baseConfig,
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  plugins: [
    copyConfig
  ]
}
