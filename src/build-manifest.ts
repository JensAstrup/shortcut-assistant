const fs = require('fs')
require('dotenv').config()


const manifestTemplate = fs.readFileSync('src/manifest.template.json', 'utf8')
const version = process.env.VERSION
if (!version) {
  throw new Error('No version provided')
}
const manifest = manifestTemplate.replace('__VERSION__', version)

fs.writeFileSync('src/manifest.json', manifest)
