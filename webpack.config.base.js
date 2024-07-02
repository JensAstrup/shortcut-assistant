// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json', to: 'manifest.json' },
        { from: './src/assets', to: 'assets' },
        { from: './src/styles', to: 'styles' },
        { from: './src/html', to: 'html' },
      ]
    }),
  ],
}
