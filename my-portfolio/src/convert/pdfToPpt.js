import { renderPage } from '../pdfjs'
import { baseName, formatBytes, userError } from './common'
import { openPdf, readPage, splitCells, toLines } from './pdfText'

const SCALE = 2 // render at 144 DPI

// Renders a page with its text left out (pdf.js draws text with fillText/strokeText), giving the background
// that editable text boxes are placed on.
async function renderWithoutText(page) {
  const viewport = page.getViewport({ scale: SCALE })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillText = () => {}
  ctx.strokeText = () => {}
  await page.render({ canvasContext: ctx, viewport }).promise
  return canvas
}

// The text colour of a box: average colour of the pixels that change most when the text is drawn.
function textColor(full, bg, box) {
  const x = Math.max(0, Math.floor(box.x * SCALE))
  const y = Math.max(0, Math.floor(box.y * SCALE))
  const w = Math.min(full.width - x, Math.ceil(box.w * SCALE))
  const h = Math.min(full.height - y, Math.ceil(box.h * SCALE))
  if (w <= 0 || h <= 0) return '000000'
  const a = full.getContext('2d').getImageData(x, y, w, h).data
  const b = bg.getContext('2d').getImageData(x, y, w, h).data
  let r = 0
  let g = 0
  let bl = 0
  let n = 0
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 200) {
      r += a[i]
      g += a[i + 1]
      bl += a[i + 2]
      n++
    }
  }
  if (!n) return '000000'
  return [r, g, bl].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('')
}

const jpegDataUrl = (canvas) => canvas.toDataURL('image/jpeg', 0.85)

export default {
  accept: '.pdf,application/pdf',
  drop: 'Drop a PDF here or click to browse',
  hint: 'Any PDF — each page becomes a slide · nothing is uploaded',
  wrongFile: 'Please choose a PDF file.',
  action: 'Convert to PowerPoint',
  downloadLabel: 'Download PowerPoint',
  empty: 'Your slides will appear here.',
  errorMessage: 'This PDF could not be converted.',
  options: [
    {
      key: 'mode',
      label: 'Conversion',
      default: 'text',
      choices: [['text', 'Editable text on the original background'], ['image', 'Exact look — pages as pictures']],
    },
  ],
  async convert({ files, options, password, setStatus, isStale }) {
    setStatus('Opening PDF…')
    const { pdfjs, pdf } = await openPdf(files[0], password)
    const { default: PptxGenJS } = await import('pptxgenjs')
    const pptx = new PptxGenJS()
    const first = (await pdf.getPage(1)).getViewport({ scale: 1 })
    pptx.defineLayout({ name: 'PDF', width: first.width / 72, height: first.height / 72 })
    pptx.layout = 'PDF'
    const thumbs = []
    let textSlides = 0

    for (let n = 1; n <= pdf.numPages; n++) {
      setStatus(`Making slide ${n} of ${pdf.numPages}…`)
      const page = await pdf.getPage(n)
      const vp = page.getViewport({ scale: 1 })
      // Pages of a different size are scaled into the slide size.
      const k = Math.min(first.width / vp.width, first.height / vp.height)
      const inch = (pt) => (pt * k) / 72
      const slide = pptx.addSlide()
      const full = await renderPage(page, SCALE)
      const { items, chars } = options.mode === 'text' ? await readPage(pdfjs, page) : { items: [], chars: 0 }
      if (isStale()) return null

      if (options.mode === 'text' && chars >= 10) {
        textSlides++
        const bg = await renderWithoutText(page)
        slide.addImage({ data: jpegDataUrl(bg), x: 0, y: 0, w: inch(vp.width), h: inch(vp.height) })
        for (const line of toLines(items)) {
          for (const cell of splitCells(line, 1.5)) {
            const size = Math.max(...cell.items.map((it) => it.size))
            const box = { x: cell.x0, y: line.y - size * 0.95, w: cell.x1 - cell.x0, h: size * 1.25 }
            const runs = []
            for (const it of cell.items) {
              const last = runs.at(-1)
              const text = last && it.x - (last.end || 0) > it.size * 0.15 && !/\s$/.test(last.text) ? ` ${it.str}` : it.str
              if (last && last.options.bold === it.bold && last.options.italic === it.italic && last.options.fontFace === (it.family || 'Calibri')) {
                last.text += text
              } else {
                runs.push({ text, options: { bold: it.bold, italic: it.italic, fontFace: it.family || 'Calibri', fontSize: Math.round(it.size * k * 2) / 2 } })
              }
              runs.at(-1).end = it.x + it.w
            }
            slide.addText(
              runs.map(({ text, options: o }) => ({ text, options: o })),
              {
                x: inch(box.x),
                y: inch(box.y),
                w: inch(box.w * 1.08 + 4),
                h: inch(box.h),
                margin: 0,
                valign: 'top',
                fit: 'none',
                wrap: false,
                color: textColor(full, bg, box),
              },
            )
          }
        }
      } else {
        slide.addImage({ data: jpegDataUrl(full), x: 0, y: 0, w: inch(vp.width), h: inch(vp.height) })
      }
      const thumb = document.createElement('canvas')
      thumb.width = 140
      thumb.height = Math.round((140 * full.height) / full.width)
      thumb.getContext('2d').drawImage(full, 0, 0, thumb.width, thumb.height)
      thumbs.push(thumb.toDataURL('image/jpeg', 0.7))
    }
    pdf.destroy()
    if (!thumbs.length) throw userError('This PDF has no pages.')
    setStatus('Saving PowerPoint…')
    const blob = await pptx.write({ outputType: 'blob' })
    const scanned = options.mode === 'text' ? thumbs.length - textSlides : 0
    return {
      downloads: [{ name: `${baseName(files[0])}.pptx`, blob }],
      summary: `${thumbs.length} slide${thumbs.length > 1 ? 's' : ''} · ${formatBytes(blob.size)}`,
      notes: scanned ? [`${scanned} page${scanned > 1 ? 's have' : ' has'} no selectable text (probably scanned), so ${scanned > 1 ? 'they were' : 'it was'} added as a picture.`] : [],
      thumbs,
      thumbLabel: 'Slide',
    }
  },
}
