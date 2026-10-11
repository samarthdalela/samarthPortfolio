import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'
import { buildPdf } from '../pdfWriter'

// How sharply each page is captured (scale = pixels per CSS pixel) and the JPEG quality.
const qualities = [
  { id: 'small', label: 'Small file size', scale: 1.25, q: 0.75 },
  { id: 'balanced', label: 'Balanced', scale: 2, q: 0.85 },
  { id: 'print', label: 'Print quality (larger file)', scale: 3, q: 0.92 },
]

const MAX_PIXELS = 16_000_000

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

const isDocx = (f) =>
  f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.docx$/i.test(f.name)

// The Word renderer and the page capturer are large and browser-only, so they load on first use.
let libsPromise
function loadLibs() {
  libsPromise ??= Promise.all([import('docx-preview'), import('html2canvas-pro')]).then(([docx, h2c]) => ({
    renderAsync: docx.renderAsync,
    html2canvas: h2c.default,
  }))
  return libsPromise
}

let stageCount = 0

// An off-screen box the document is laid out in at full size. It is clipped to 0×0 so it stays invisible,
// and un-clipped in html2canvas's private copy of the page so the capture sees it.
function createStage() {
  const stage = document.createElement('div')
  stage.id = `docx-stage-${++stageCount}`
  stage.setAttribute('aria-hidden', 'true')
  stage.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none'
  // Reset what the site's own CSS would otherwise pass down (Inter font, 1.65 line height, theme colours),
  // and drop docx-preview's grey preview frame and page shadows so only the white pages are captured.
  // Word's defaults apply wherever the document itself does not set a font or spacing.
  const reset = document.createElement('style')
  reset.textContent = `
#${stage.id} > div { font: 11pt/1.15 Calibri, Carlito, 'Segoe UI', Arial, sans-serif; color: #000; letter-spacing: normal;
  text-align: left; -webkit-font-smoothing: auto }
#${stage.id} .docx-wrapper { background: #fff; padding: 0; gap: 0 }
#${stage.id} .docx-wrapper > section.docx { box-shadow: none; margin: 0 }`
  const styles = document.createElement('div')
  const body = document.createElement('div')
  body.style.cssText = 'position:absolute;left:0;top:0;width:max-content'
  stage.append(reset, styles, body)
  document.body.append(stage)
  return { stage, styles, body }
}

// Captures one page area of the rendered document as JPEG bytes plus a small thumbnail.
async function capture(html2canvas, section, stageId, area, quality) {
  const scale = Math.min(quality.scale, Math.sqrt(MAX_PIXELS / (area.width * area.height)))
  const canvas = await html2canvas(section, {
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

function WordToPdf() {
  const [file, setFile] = useState(null)
  const [quality, setQuality] = useState('balanced')
  const [pages, setPages] = useState([])
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const stageRef = useRef(null)
  // Bumped whenever a new file is chosen or cleared, so work for an older file stops quietly.
  const runId = useRef(0)
  const resultRef = useRef(result)
  useEffect(() => {
    resultRef.current = result
  }, [result])

  const dropStage = () => {
    stageRef.current?.stage.remove()
    stageRef.current = null
  }

  const clearResult = () =>
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url)
      return null
    })

  useEffect(
    () => () => {
      dropStage()
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    },
    [],
  )

  const convert = async (f, qualityId) => {
    const id = ++runId.current
    const stale = () => runId.current !== id
    clearResult()
    setPages([])
    setError('')
    try {
      setStatus('Opening document…')
      const { renderAsync, html2canvas } = await loadLibs()
      // Lay the document out once per file; changing the quality only re-captures it.
      if (!stageRef.current || stageRef.current.file !== f) {
        dropStage()
        const stage = createStage()
        stageRef.current = { ...stage, file: f }
        await renderAsync(f, stage.body, stage.styles, {
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        })
        await document.fonts?.ready
      }
      if (stale()) return
      const { stage, body } = stageRef.current
      const sections = [...body.querySelectorAll('section.docx')]
      if (!sections.length) throw new Error('empty')

      // Each <section> is one Word page. Long sections (no page-break info saved in the file) are sliced into
      // page-height pieces so nothing is cut off.
      const areas = []
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        const pageH = parseFloat(getComputedStyle(section).minHeight) || rect.width * Math.SQRT2
        const left = rect.left + window.scrollX
        const top = rect.top + window.scrollY
        const slices = Math.max(1, Math.ceil((rect.height - 2) / pageH))
        for (let s = 0; s < slices; s++) {
          const height = Math.min(pageH, rect.height - s * pageH)
          areas.push({ section, pageW: rect.width, pageH, area: { x: left, y: top + s * pageH, width: rect.width, height } })
        }
      }

      const q = qualities.find((x) => x.id === qualityId)
      const pdfPages = []
      const thumbs = []
      for (const [i, a] of areas.entries()) {
        setStatus(`Converting page ${i + 1} of ${areas.length}…`)
        const { img, thumb } = await capture(html2canvas, a.section, stage.id, a.area, q)
        if (stale()) return
        // CSS pixels → PDF points (96 → 72 per inch). Short last slices sit at the top of a full-size page.
        const pw = a.pageW * 0.75
        const ph = a.pageH * 0.75
        const dh = a.area.height * 0.75
        pdfPages.push({ img, pw, ph, x: 0, y: ph - dh, dw: pw, dh })
        thumbs.push(thumb)
        setPages([...thumbs])
      }
      const blob = buildPdf(pdfPages)
      setResult({ url: URL.createObjectURL(blob), size: blob.size, pages: pdfPages.length })
      setStatus('')
    } catch {
      if (stale()) return
      dropStage()
      setStatus('')
      setPages([])
      setError('This document could not be converted. Make sure it is a .docx file that opens in Word.')
    }
  }

  const addFile = (fileList) => {
    const f = [...fileList][0]
    if (!f) return
    if (/\.doc$/i.test(f.name) || f.type === 'application/msword') {
      setError('Old .doc files are not supported. Open it in Word or Google Docs, save it as .docx, then add it here.')
      return
    }
    if (!isDocx(f)) {
      setError('Please choose a Word document (.docx).')
      return
    }
    setFile(f)
    convert(f, quality)
  }

  const clearAll = () => {
    runId.current++
    dropStage()
    clearResult()
    setFile(null)
    setPages([])
    setStatus('')
    setError('')
  }

  const pdfName = file ? `${file.name.replace(/\.docx$/i, '')}.pdf` : 'document.pdf'

  const download = () => {
    const a = document.createElement('a')
    a.href = result.url
    a.download = pdfName
    a.click()
    promptSupport()
  }

  // Prints the laid-out document so the browser's "Save as PDF" keeps text selectable and searchable.
  const print = () => {
    const { styles, body } = stageRef.current
    const first = body.querySelector('section.docx').getBoundingClientRect()
    const frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    document.body.append(frame)
    const doc = frame.contentDocument
    const title = pdfName.replace(/\.pdf$/, '').replace(/</g, '&lt;')
    doc.open()
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${styles.innerHTML}
<style>
@page { size: ${first.width}px ${parseFloat(getComputedStyle(body.querySelector('section.docx')).minHeight) || first.height}px; margin: 0 }
html, body { margin: 0; background: #fff; color: #000; font: 11pt/1.15 Calibri, Carlito, 'Segoe UI', Arial, sans-serif }
.docx-wrapper { background: none !important; padding: 0 !important; display: block !important }
.docx-wrapper > section.docx { box-shadow: none !important; margin: 0 !important; break-after: page }
</style></head><body>${body.innerHTML}</body></html>`)
    doc.close()
    const win = frame.contentWindow
    win.onafterprint = () => setTimeout(() => frame.remove(), 500)
    setTimeout(() => {
      win.focus()
      win.print()
    }, 400)
    promptSupport()
  }

  const busy = !!status

  return (
    <div className="qr-tool card resizer">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-files' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFile(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={(e) => {
            addFile(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="dropzone-icon"><Icon name="file" size={28} /></span>
        <strong>{file ? `${file.name} · ${formatBytes(file.size)} — click to choose another file` : 'Drop a Word file here or click to browse'}</strong>
        {!file && <span className="muted">Word documents (.docx) · converted in your browser · nothing is uploaded</span>}
      </div>

      <div className="qr-body resizer-body">
        <div className="qr-form">
          <label>
            <span>Quality</span>
            <select
              value={quality}
              onChange={(e) => {
                setQuality(e.target.value)
                clearResult()
              }}
              disabled={busy}
            >
              {qualities.map((q) => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </label>

          {result && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> PDF ready:{' '}
              <strong>
                {result.pages} page{result.pages > 1 ? 's' : ''} · {formatBytes(result.size)}
              </strong>
            </p>
          )}
          {status && <p className="resize-summary">{status}</p>}
          {error && <p className="resize-error">{error}</p>}

          <div className="qr-actions resizer-actions">
            {result ? (
              <button className="btn btn-primary" onClick={download}>
                <Icon name="download" size={18} /> Download PDF
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => convert(file, quality)} disabled={!file || busy}>
                {busy ? 'Converting…' : 'Convert to PDF'}
              </button>
            )}
            {file && (
              <button className="btn btn-ghost" onClick={clearAll} disabled={busy}>
                Clear
              </button>
            )}
          </div>
          {result && (
            <p className="muted small">
              Want selectable, searchable text?{' '}
              <button className="link-btn" onClick={print}>
                Print → Save as PDF
              </button>{' '}
              uses your browser’s own PDF maker instead.
            </p>
          )}
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Your document is converted in your browser. Nothing is uploaded.
          </p>
        </div>

        <div className="resize-list">
          {!file && <p className="muted resize-empty">Your PDF pages will appear here.</p>}
          {file && !pages.length && busy && <p className="muted resize-empty">{status}</p>}
          {pages.map((thumb, i) => (
            <div key={i} className="resize-item pdf-page">
              <img src={thumb} alt="" />
              <div className="resize-info">
                <strong>Page {i + 1}</strong>
                <span className="muted">{result ? 'In your PDF' : 'Converted'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WordToPdf
