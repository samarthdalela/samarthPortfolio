// Bakes the rendered pages into their HTML files so search engines see all content without running JS.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render } = await import(pathToFileURL(`${root}dist-ssr/entry-server.js`).href)

const pages = {
  home: 'dist/index.html',
  services: 'dist/services/index.html',
  qr: 'dist/qr-code-generator/index.html',
}

for (const [page, file] of Object.entries(pages)) {
  const path = `${root}${file}`
  const html = readFileSync(path, 'utf8')
  if (!html.includes('<!--app-html-->')) throw new Error(`<!--app-html--> placeholder missing in ${file}`)
  writeFileSync(path, html.replace('<!--app-html-->', render(page)))
  console.log(`Pre-rendered ${file}`)
}
rmSync(`${root}dist-ssr`, { recursive: true, force: true })
