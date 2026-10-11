// Helpers shared by the file converters in this folder.

import { captureQualities, pageSizes } from '../pageCapture'
import { pagesToPdf, paginate, printPages } from '../htmlPages'

export const baseName = (file, fallback = 'document') => (file ? file.name.replace(/\.[^.]+$/, '') : fallback)

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)
export { formatBytes }

export const loadXlsx = () => import('xlsx')

const BOM = new RegExp('^' + String.fromCharCode(0xfeff))

// Decodes text files: UTF-8 (with or without BOM), UTF-16 (by BOM), otherwise Windows-1252.
export async function readText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2))
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(BOM, '')
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

// An error whose message is safe to show to the user.
export const userError = (message) => Object.assign(new Error(message), { userMessage: message })

// Options shared by the "… to PDF" converters.
export const pdfOptions = {
  page: { key: 'page', label: 'Page size', default: 'a4', choices: [['a4', 'A4'], ['letter', 'US Letter'], ['legal', 'US Legal']] },
  orientation: {
    key: 'orientation',
    label: 'Orientation',
    default: 'portrait',
    choices: [['portrait', 'Portrait'], ['landscape', 'Landscape']],
  },
  margin: { key: 'margin', label: 'Margins', default: '72', choices: [['36', 'Narrow (0.5 in)'], ['72', 'Normal (1 in)'], ['108', 'Wide (1.5 in)']] },
  quality: {
    key: 'quality',
    label: 'Quality',
    default: 'balanced',
    choices: captureQualities.map((q) => [q.id, q.label]),
  },
}

export function pageSettings(options, landscape = options.orientation === 'landscape') {
  const size = pageSizes[options.page] || pageSizes.a4
  const margin = Math.round((Number(options.margin) || 72) * (96 / 72))
  return landscape ? { pageW: size.h, pageH: size.w, margin } : { pageW: size.w, pageH: size.h, margin }
}

// Lays out HTML blocks into pages and captures them into a PDF result for FileConverter.
export async function blocksToPdf(blocks, { settings, options, name, css, setStatus, isStale }) {
  setStatus('Laying out pages…')
  const laid = paginate(blocks, { ...settings, css })
  const quality = captureQualities.find((q) => q.id === options.quality) || captureQualities[1]
  const out = await pagesToPdf(laid, settings, quality, (i, n) => setStatus(`Creating page ${i} of ${n}…`), isStale)
  if (!out) {
    laid.stage.remove()
    return null
  }
  const file = { name: `${name}.pdf`, blob: out.blob }
  return {
    downloads: [file],
    summary: `PDF ready: ${out.thumbs.length} page${out.thumbs.length > 1 ? 's' : ''} · ${formatBytes(out.blob.size)}`,
    thumbs: out.thumbs,
    print: () => printPages(laid, settings, name),
    cleanup: () => laid.stage.remove(),
  }
}
