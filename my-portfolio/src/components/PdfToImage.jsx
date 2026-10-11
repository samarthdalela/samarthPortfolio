import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'

const formats = [
  { id: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
]

const resolutions = [
  { dpi: 72, label: '72 DPI — screen, smallest file' },
  { dpi: 150, label: '150 DPI — sharp on screen' },
  { dpi: 200, label: '200 DPI — documents & forms' },
  { dpi: 300, label: '300 DPI — print quality' },
]

// Browsers refuse very large canvases (iOS Safari caps around 16.7 million pixels).
const MAX_PIXELS = 16_000_000
const THUMB_WIDTH = 140

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

// pdf.js is large and browser-only, so it is loaded the first time a PDF is opened.
let pdfjsPromise
function loadPdfjs() {
  pdfjsPromise ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    },
  )
  return pdfjsPromise
}

// Renders one page onto a white canvas at the given scale (1 = 72 DPI), capped to MAX_PIXELS.
async function renderPage(page, scale) {
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

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))

function PdfToImage() {
  const [file, setFile] = useState(null)
  const [doc, setDoc] = useState(null)
  const [pages, setPages] = useState([])
  const [needPassword, setNeedPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [settings, setSettings] = useState({ format: 'image/jpeg', dpi: 150, quality: 0.9 })
  const inputRef = useRef(null)
  // Bumped whenever a PDF is opened or cleared, so work for an older PDF stops quietly.
  const openId = useRef(0)
  // Latest state, for cleanup on unmount.
  const latest = useRef({ doc, pages })
  useEffect(() => {
    latest.current = { doc, pages }
  }, [doc, pages])

  const freeResults = (list) => list.forEach((p) => p.result && URL.revokeObjectURL(p.result.url))

  const reset = () => {
    openId.current++
    freeResults(latest.current.pages)
    latest.current.doc?.destroy()
    setDoc(null)
    setPages([])
    setError('')
    setNeedPassword(false)
    setPassword('')
  }

  useEffect(
    () => () => {
      freeResults(latest.current.pages)
      latest.current.doc?.destroy()
    },
    [],
  )

  const open = async (f, pass) => {
    const id = ++openId.current
    const stale = () => openId.current !== id
    setLoading(true)
    setError('')
    try {
      const pdfjs = await loadPdfjs()
      const data = new Uint8Array(await f.arrayBuffer())
      const pdf = await pdfjs.getDocument({ data, password: pass || undefined }).promise
      if (stale()) {
        pdf.destroy()
        return
      }
      setNeedPassword(false)
      setDoc(pdf)
      const list = Array.from({ length: pdf.numPages }, (_, i) => ({ n: i + 1, thumb: '', selected: true, result: null }))
      setPages(list)
      setLoading(false)
      // Thumbnails render one at a time in the background so big PDFs stay responsive.
      for (const p of list) {
        const page = await pdf.getPage(p.n)
        const canvas = await renderPage(page, THUMB_WIDTH / page.getViewport({ scale: 1 }).width)
        if (stale()) return
        const thumb = canvas.toDataURL('image/jpeg', 0.7)
        setPages((cur) => cur.map((x) => (x.n === p.n ? { ...x, thumb } : x)))
      }
    } catch (err) {
      if (stale()) return
      setLoading(false)
      if (err?.name === 'PasswordException') {
        setNeedPassword(true)
        setError(pass ? 'Incorrect password. Please try again.' : '')
      } else if (!latest.current.doc) {
        setError('This file could not be opened as a PDF. It may be damaged or not a real PDF.')
      }
    }
  }

  const addFile = (fileList) => {
    const f = [...fileList].find((x) => x.type === 'application/pdf' || /\.pdf$/i.test(x.name))
    if (!f) {
      setError('Please choose a PDF file.')
      return
    }
    reset()
    setFile(f)
    open(f)
  }

  const set = (key) => (e) => {
    const value = key === 'format' ? e.target.value : Number(e.target.value)
    freeResults(pages)
    setPages((cur) => cur.map((p) => ({ ...p, result: null })))
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const toggle = (n) => setPages((cur) => cur.map((p) => (p.n === n ? { ...p, selected: !p.selected } : p)))
  const selectAll = (selected) => setPages((cur) => cur.map((p) => ({ ...p, selected })))

  const baseName = file ? file.name.replace(/\.pdf$/i, '') : 'page'
  const ext = formats.find((f) => f.id === settings.format).ext
  const lossy = settings.format !== 'image/png'
  const selected = pages.filter((p) => p.selected)
  const done = pages.filter((p) => p.result)

  const convert = async () => {
    setBusy(true)
    setProgress(0)
    freeResults(pages)
    const results = {}
    try {
      for (const [i, p] of selected.entries()) {
        const page = await doc.getPage(p.n)
        const canvas = await renderPage(page, settings.dpi / 72)
        const blob = await toBlob(canvas, settings.format, lossy ? settings.quality : undefined)
        results[p.n] = {
          url: URL.createObjectURL(blob),
          size: blob.size,
          w: canvas.width,
          h: canvas.height,
          name: `${baseName}-page-${p.n}.${ext}`,
        }
        setProgress(i + 1)
      }
      setError('')
    } catch {
      setError('Could not convert every page. Try a lower DPI.')
    }
    setPages((cur) => cur.map((p) => ({ ...p, result: results[p.n] || null })))
    setBusy(false)
  }

  const download = (result) => {
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.name
    a.click()
  }

  const downloadAll = () => {
    done.forEach((p, i) => setTimeout(() => download(p.result), i * 300))
    promptSupport()
  }

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
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => {
            addFile(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="dropzone-icon"><Icon name="file" size={28} /></span>
        <strong>{file ? `${file.name} · ${formatBytes(file.size)} — click to choose another PDF` : 'Drop a PDF here or click to browse'}</strong>
        {!file && <span className="muted">Any PDF · every page becomes an image · nothing is uploaded</span>}
      </div>

      <div className="qr-body resizer-body">
        <div className="qr-form">
          {needPassword && (
            <form
              className="pdf-password"
              onSubmit={(e) => {
                e.preventDefault()
                open(file, password)
              }}
            >
              <label>
                <span>This PDF is password-protected</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter PDF password" autoFocus />
              </label>
              <button className="btn btn-primary" type="submit" disabled={!password || loading}>
                <Icon name="lock" size={16} /> Unlock
              </button>
            </form>
          )}

          <div className="qr-options">
            <label>
              <span>Image format</span>
              <select value={settings.format} onChange={set('format')}>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Resolution</span>
              <select value={settings.dpi} onChange={set('dpi')}>
                {resolutions.map((r) => (
                  <option key={r.dpi} value={r.dpi}>{r.label}</option>
                ))}
              </select>
            </label>
          </div>
          {lossy && (
            <label>
              <span>Quality: {Math.round(settings.quality * 100)}%</span>
              <input type="range" min="0.3" max="1" step="0.05" value={settings.quality} onChange={set('quality')} />
            </label>
          )}

          {pages.length > 0 && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> {pages.length} page{pages.length > 1 ? 's' : ''} ·{' '}
              <strong>{selected.length} selected</strong>
              {pages.length > 1 && (
                <>
                  <button className="link-btn" onClick={() => selectAll(true)}>All</button>
                  <button className="link-btn" onClick={() => selectAll(false)}>None</button>
                </>
              )}
            </p>
          )}
          {error && <p className="resize-error">{error}</p>}

          <div className="qr-actions resizer-actions">
            <button className="btn btn-primary" onClick={convert} disabled={!doc || !selected.length || busy}>
              {busy
                ? `Converting ${progress}/${selected.length}…`
                : `Convert ${selected.length > 1 ? `${selected.length} pages` : 'page'} to ${ext.toUpperCase()}`}
            </button>
            {done.length > 1 && !busy && (
              <button className="btn btn-ghost" onClick={downloadAll}>
                <Icon name="download" size={18} /> Download all ({done.length})
              </button>
            )}
            {file && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  reset()
                  setFile(null)
                }}
              >
                Clear
              </button>
            )}
          </div>
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Your PDF is converted in your browser. Nothing is uploaded.
          </p>
        </div>

        <div className="resize-list">
          {!file && <p className="muted resize-empty">Your PDF pages will appear here.</p>}
          {loading && <p className="muted resize-empty">Opening PDF…</p>}
          {pages.map((p) => (
            <div key={p.n} className={`resize-item pdf-page ${p.selected ? '' : 'is-off'}`}>
              <label className="pdf-page-check">
                <input type="checkbox" checked={p.selected} onChange={() => toggle(p.n)} aria-label={`Include page ${p.n}`} />
              </label>
              {p.thumb ? <img src={p.result ? p.result.url : p.thumb} alt="" /> : <span className="pdf-thumb-placeholder" />}
              <div className="resize-info">
                <strong>Page {p.n}</strong>
                <span className="muted">
                  {p.result ? (
                    <b>
                      {p.result.w}×{p.result.h} · {formatBytes(p.result.size)}
                    </b>
                  ) : p.selected ? (
                    'Will be converted'
                  ) : (
                    'Skipped'
                  )}
                </span>
              </div>
              {p.result && (
                <div className="resize-btns">
                  <button
                    className="icon-btn"
                    onClick={() => {
                      download(p.result)
                      promptSupport()
                    }}
                    aria-label={`Download ${p.result.name}`}
                  >
                    <Icon name="download" size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PdfToImage
