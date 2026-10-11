import { buildPdf } from '../pdfWriter'
import { areaOf, captureArea, captureQualities, createStage } from '../pageCapture'
import { baseName, formatBytes, pdfOptions, userError } from './common'

// pptx-preview draws each slide as an HTML box (.pptx-preview-slide-wrapper); each is captured into a PDF page.
const RENDER_WIDTH = 1280

export default {
  accept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  drop: 'Drop a PowerPoint file here or click to browse',
  hint: 'PowerPoint presentations (.pptx) · each slide becomes a PDF page · nothing is uploaded',
  wrongFile: 'Please choose a PowerPoint file (.pptx). Old .ppt files must be saved as .pptx first.',
  action: 'Convert to PDF',
  downloadLabel: 'Download PDF',
  empty: 'Your slides will appear here.',
  errorMessage: 'This presentation could not be converted. Make sure it is a .pptx file that opens in PowerPoint.',
  options: [pdfOptions.quality],
  async convert({ files, options, setStatus, isStale }) {
    setStatus('Opening presentation…')
    const { init } = await import('pptx-preview')
    const buffer = await sanitize(await files[0].arrayBuffer())
    const stage = createStage(`#STAGE .slide-host { background: #fff }`)
    try {
      // Read the slide size first, so slides are drawn at their real shape.
      const probe = document.createElement('div')
      stage.body.append(probe)
      const pptx = await init(probe, { width: RENDER_WIDTH, height: 720, mode: 'list' }).load(buffer.slice(0))
      probe.remove()
      const ratio = pptx?.width && pptx?.height ? pptx.height / pptx.width : 9 / 16

      const host = document.createElement('div')
      host.className = 'slide-host'
      stage.body.append(host)
      const previewer = init(host, { width: RENDER_WIDTH, height: Math.round(RENDER_WIDTH * ratio), mode: 'list' })
      await previewer.preview(buffer)
      await document.fonts?.ready
      if (isStale()) return null

      const slides = [...host.querySelectorAll('.pptx-preview-slide-wrapper')]
      if (!slides.length) throw userError('No slides were found in this presentation.')
      const quality = captureQualities.find((q) => q.id === options.quality) || captureQualities[1]
      const pages = []
      const thumbs = []
      for (const [i, slide] of slides.entries()) {
        setStatus(`Converting slide ${i + 1} of ${slides.length}…`)
        const area = areaOf(slide)
        const { img, thumb } = await captureArea(slide, stage.stage.id, area, quality)
        if (isStale()) return null
        const pw = area.width * 0.75
        const ph = area.height * 0.75
        pages.push({ img, pw, ph, x: 0, y: 0, dw: pw, dh: ph })
        thumbs.push(thumb)
      }
      const blob = buildPdf(pages)
      return {
        downloads: [{ name: `${baseName(files[0])}.pdf`, blob }],
        summary: `PDF ready: ${pages.length} slide${pages.length > 1 ? 's' : ''} · ${formatBytes(blob.size)}`,
        thumbs,
        thumbLabel: 'Slide',
      }
    } finally {
      stage.remove()
    }
  },
}

// Some generators (e.g. pptxgenjs) list parts in [Content_Types].xml that are not in the file. pptx-preview
// stops loading at the first missing part and then finds no slides, so those entries are removed first.
async function sanitize(buffer) {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const types = await zip.file('[Content_Types].xml')?.async('string')
  if (!types) return buffer
  const overrideRe = new RegExp('<Override [^>]*PartName="/([^"]+)"[^>]*/>', 'g')
  const fixed = types.replace(overrideRe, (entry, part) => (zip.file(decodeURIComponent(part)) ? entry : ''))
  if (fixed === types) return buffer
  zip.file('[Content_Types].xml', fixed)
  return zip.generateAsync({ type: 'arraybuffer' })
}
