const CopyWebpackPlugin = require('copy-webpack-plugin')


const copyConfig = new CopyWebpackPlugin({
  patterns: [
    { from: './src/manifest.json', to: 'manifest.json' },
    { from: './src/assets', to: 'assets' },
    { from: './src/styles', to: 'styles' },
    { from: './src/html', to: 'html' },
  ]
})

module.exports = {
  copyConfig
}
