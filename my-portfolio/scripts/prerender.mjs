// Bakes the rendered page into dist/index.html so search engines see all content without running JS.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const htmlPath = `${root}dist/index.html`
const { render } = await import(pathToFileURL(`${root}dist-ssr/entry-server.js`).href)

const html = readFileSync(htmlPath, 'utf8')
if (!html.includes('<!--app-html-->')) throw new Error('<!--app-html--> placeholder missing in index.html')
writeFileSync(htmlPath, html.replace('<!--app-html-->', render()))
rmSync(`${root}dist-ssr`, { recursive: true, force: true })
console.log('Pre-rendered dist/index.html')
