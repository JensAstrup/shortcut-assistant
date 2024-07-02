// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require('copy-webpack-plugin')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Dotenv = require('dotenv-webpack')


const envFiles = {
  development: './.env.local',
  staging: './.env.staging',
  production: './.env'
}

const envFile = envFiles[process.env.NODE_ENV] || './.env'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: envFile })


module.exports = {
  plugins: [
    new Dotenv({ path: envFile }),
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
