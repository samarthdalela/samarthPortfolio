// Bakes the rendered pages into their HTML files so search engines see all content without running JS.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render, renderLanding, landings } = await import(pathToFileURL(`${root}dist-ssr/entry-server.js`).href)

const pages = {
  home: 'dist/index.html',
  services: 'dist/services/index.html',
  videos: 'dist/videos/index.html',
  qr: 'dist/qr-code-generator/index.html',
  resizer: 'dist/image-resizer/index.html',
  imageToPdf: 'dist/image-to-pdf/index.html',
  pdfToImage: 'dist/pdf-to-image/index.html',
  wordToPdf: 'dist/word-to-pdf/index.html',
  pdfToWord: 'dist/pdf-to-word/index.html',
  imageToBase64: 'dist/image-to-base64/index.html',
  base64ToImage: 'dist/base64-to-image/index.html',
}

function bake(file, body) {
  const path = `${root}${file}`
  const html = readFileSync(path, 'utf8')
  if (!html.includes('<!--app-html-->')) throw new Error(`<!--app-html--> placeholder missing in ${file}`)
  writeFileSync(path, html.replace('<!--app-html-->', body))
  console.log(`Pre-rendered ${file}`)
}

for (const [page, file] of Object.entries(pages)) bake(file, render(page))
for (const { slug } of landings) bake(`dist/${slug}/index.html`, renderLanding(slug))
rmSync(`${root}dist-ssr`, { recursive: true, force: true })
