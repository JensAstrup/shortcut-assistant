import {parse} from 'node-html-parser'


function extractText(html: string): string {
  const root = parse(html)
  return root.textContent.replace(/\s+/g, ' ').trim() // Normalize whitespace
}

export default extractText
