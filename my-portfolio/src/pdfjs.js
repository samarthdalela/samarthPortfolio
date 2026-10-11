// Shared pdf.js helpers for the PDF tools. pdf.js is large and browser-only, so it loads on first use.

let pdfjsPromise
export function loadPdfjs() {
  pdfjsPromise ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    },
  )
  return pdfjsPromise
}

// Browsers refuse very large canvases (iOS Safari caps around 16.7 million pixels).
const MAX_PIXELS = 16_000_000

// Renders one page onto a white canvas at the given scale (1 = 72 DPI), capped to MAX_PIXELS.
export async function renderPage(page, scale) {
  let viewport = page.getViewport({ scale })
  const pixels = viewport.width * viewport.height
  if (pixels > MAX_PIXELS) viewport = page.getViewport({ scale: scale * Math.sqrt(MAX_PIXELS / pixels) })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext: ctx, viewport }).promise
  return canvas
}
