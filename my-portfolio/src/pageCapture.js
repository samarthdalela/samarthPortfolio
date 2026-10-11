// Shared by the "… to PDF" tools: an off-screen box to lay documents out in, a page capturer (html2canvas → JPEG),
// and a print helper for PDFs with selectable text.

const MAX_PIXELS = 16_000_000

let html2canvasPromise
export const loadHtml2canvas = () => (html2canvasPromise ??= import('html2canvas-pro').then((m) => m.default))

let stageCount = 0

// An off-screen box documents are laid out in at full size. It is clipped to 0×0 so it stays invisible, and
// un-clipped in html2canvas's private copy of the page so the capture sees it. `css` is scoped to the stage
// (use #STAGE as the selector prefix); the base reset stops the site's own fonts and colours leaking in.
export function createStage(css = '') {
  const stage = document.createElement('div')
  stage.id = `doc-stage-${++stageCount}`
  stage.setAttribute('aria-hidden', 'true')
  stage.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none'
  const style = document.createElement('style')
  style.textContent =
    `#${stage.id} > div { font: 11pt/1.15 Calibri, Carlito, 'Segoe UI', Arial, sans-serif; color: #000; letter-spacing: normal;
      text-align: left; -webkit-font-smoothing: auto }\n` + css.replaceAll('#STAGE', `#${stage.id}`)
  const styles = document.createElement('div')
  const body = document.createElement('div')
  body.style.cssText = 'position:absolute;left:0;top:0;width:max-content'
  stage.append(style, styles, body)
  document.body.append(stage)
  return { stage, style, styles, body, remove: () => stage.remove() }
}

// Captures an area of the page (document coordinates) as JPEG bytes plus a small thumbnail.
// quality: { scale, q } — scale is pixels per CSS pixel.
export async function captureArea(el, stageId, area, quality) {
  const html2canvas = await loadHtml2canvas()
  const scale = Math.min(quality.scale, Math.sqrt(MAX_PIXELS / (area.width * area.height)))
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: '#ffffff',
    logging: false,
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    onclone: (doc) => {
      const copy = doc.getElementById(stageId)
      if (copy) copy.style.overflow = 'visible'
    },
  })
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality.q))
  const thumb = document.createElement('canvas')
  thumb.width = 140
  thumb.height = Math.round((140 * canvas.height) / canvas.width)
  thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height)
  return {
    img: { bytes: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height },
    thumb: thumb.toDataURL('image/jpeg', 0.7),
  }
}

// The whole element's area in document coordinates.
export function areaOf(el) {
  const rect = el.getBoundingClientRect()
  return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, width: rect.width, height: rect.height }
}

// Prints HTML in a hidden frame, so the browser's "Save as PDF" makes a PDF with selectable, searchable text.
export function printHtml({ title, head = '', body, pageW, pageH }) {
  const frame = document.createElement('iframe')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.append(frame)
  const doc = frame.contentDocument
  doc.open()
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/</g, '&lt;')}</title>${head}
<style>
@page { size: ${pageW}px ${pageH}px; margin: 0 }
html, body { margin: 0; background: #fff; color: #000; font: 11pt/1.15 Calibri, Carlito, 'Segoe UI', Arial, sans-serif }
</style></head><body>${body}</body></html>`)
  doc.close()
  const win = frame.contentWindow
  win.onafterprint = () => setTimeout(() => frame.remove(), 500)
  setTimeout(() => {
    win.focus()
    win.print()
  }, 400)
}

// Standard page sizes in CSS pixels (96 per inch). PDF points = px × 0.75.
export const pageSizes = {
  a4: { w: 794, h: 1123, label: 'A4' },
  letter: { w: 816, h: 1056, label: 'US Letter' },
  legal: { w: 816, h: 1344, label: 'US Legal' },
}

export const captureQualities = [
  { id: 'small', label: 'Small file size', scale: 1.25, q: 0.75 },
  { id: 'balanced', label: 'Balanced', scale: 2, q: 0.85 },
  { id: 'print', label: 'Print quality (larger file)', scale: 3, q: 0.92 },
]
