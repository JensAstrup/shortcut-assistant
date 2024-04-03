const fs = require('fs');
require('dotenv').config();

const manifestTemplate = fs.readFileSync('src/manifest.template.json', 'utf8')
const manifest = manifestTemplate.replace(`__VERSION__`, process.env.VERSION)

fs.writeFileSync('src/manifest.json', manifest)
