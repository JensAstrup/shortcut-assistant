const fs = require('fs');
require('dotenv').config();

const manifestTemplate = fs.readFileSync('manifest.template.json', 'utf8');
const manifest = manifestTemplate
 .replace(`__CLIENT_ID__`, process.env.CLIENT_ID)
 .replace(`__VERSION__`, process.env.VERSION)
 .replace(`__CHROME_KEY__`, process.env.CHROME_KEY);

fs.writeFileSync('manifest.json', manifest);
