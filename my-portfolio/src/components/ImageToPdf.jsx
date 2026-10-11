import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'

// Page sizes in PDF points (1 pt = 1/72 inch). "fit" makes each page the size of its image.
const pageSizes = [
  { id: 'a4', label: 'A4 (210×297 mm)', w: 595.28, h: 841.89 },
  { id: 'letter', label: 'US Letter (8.5×11 in)', w: 612, h: 792 },
  { id: 'legal', label: 'US Legal (8.5×14 in)', w: 612, h: 1008 },
  { id: 'a5', label: 'A5 (148×210 mm)', w: 419.53, h: 595.28 },
  { id: 'fit', label: 'Same as image', w: 0, h: 0 },
]

const margins = [
  { id: 0, label: 'No margin' },
  { id: 18, label: 'Small' },
  { id: 36, label: 'Large' },
]

// JPEG quality and the longest side each image is scaled down to before embedding.
const qualities = [
  { id: 'high', label: 'High quality (larger file)', q: 0.92, maxSide: 3500 },
  { id: 'medium', label: 'Balanced', q: 0.8, maxSide: 2200 },
  { id: 'small', label: 'Small file size', q: 0.6, maxSide: 1400 },
]

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('This file could not be opened as an image.'))
    img.src = url
  })

// Rotates and downscales an image onto a white canvas, then encodes it as JPEG bytes.
async function toJpeg(img, rotation, quality) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const k = Math.min(1, quality.maxSide / Math.max(iw, ih))
  const w = Math.max(1, Math.round(iw * k))
  const h = Math.max(1, Math.round(ih * k))
  const sideways = rotation % 180 !== 0
  const canvas = document.createElement('canvas')
  canvas.width = sideways ? h : w
  canvas.height = sideways ? w : h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality.q))
  return { bytes: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height }
}

// Where an image goes on its page: page size (honouring orientation) and the centred, scaled image box.
function layout(img, s) {
  const margin = s.margin
  if (s.pageSize === 'fit') {
    // 96 px per inch, so a 1920 px wide photo becomes a 20 inch page.
    const dw = img.w * 0.75
    const dh = img.h * 0.75
    return { pw: dw + margin * 2, ph: dh + margin * 2, x: margin, y: margin, dw, dh }
  }
  const size = pageSizes.find((p) => p.id === s.pageSize)
  const landscape = s.orientation === 'landscape' || (s.orientation === 'auto' && img.w > img.h)
  const pw = landscape ? size.h : size.w
  const ph = landscape ? size.w : size.h
  const k = Math.min((pw - margin * 2) / img.w, (ph - margin * 2) / img.h)
  const dw = img.w * k
  const dh = img.h * k
  return { pw, ph, x: (pw - dw) / 2, y: (ph - dh) / 2, dw, dh }
}

// Minimal PDF 1.4 writer: one page per JPEG, embedded as-is with DCTDecode (no re-compression).
function buildPdf(pages) {
  const enc = new TextEncoder()
  const chunks = []
  const offsets = []
  let length = 0
  const push = (data) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data
    chunks.push(bytes)
    length += bytes.length
  }
  const object = (n, ...parts) => {
    offsets[n] = length
    push(`${n} 0 obj\n`)
    parts.forEach(push)
    push('\nendobj\n')
  }
  const num = (v) => +v.toFixed(2)

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  const pageRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`)

  pages.forEach((p, i) => {
    const pageNo = 3 + i * 3
    const contentNo = pageNo + 1
    const imageNo = pageNo + 2
    const content = `q ${num(p.dw)} 0 0 ${num(p.dh)} ${num(p.x)} ${num(p.y)} cm /Im0 Do Q`
    object(
      pageNo,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(p.pw)} ${num(p.ph)}] ` +
        `/Resources << /XObject << /Im0 ${imageNo} 0 R >> >> /Contents ${contentNo} 0 R >>`,
    )
    object(contentNo, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    object(
      imageNo,
      `<< /Type /XObject /Subtype /Image /Width ${p.img.w} /Height ${p.img.h} /ColorSpace /DeviceRGB ` +
        `/BitsPerComponent 8 /Filter /DCTDecode /Length ${p.img.bytes.length} >>\nstream\n`,
      p.img.bytes,
      '\nendstream',
    )
  })

  const count = 3 + pages.length * 3
  const xref = length
  push(`xref\n0 ${count}\n0000000000 65535 f \n`)
  for (let n = 1; n < count; n++) push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return new Blob(chunks, { type: 'application/pdf' })
}

let nextId = 1

function ImageToPdf() {
  const [items, setItems] = useState([])
  const [settings, setSettings] = useState({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 18,
    quality: 'medium',
    fileName: 'images',
  })
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragId, setDragId] = useState(null)
  const inputRef = useRef(null)
  // Latest state, for freeing object URLs on unmount.
  const latest = useRef({ items, result })
  useEffect(() => {
    latest.current = { items, result }
  }, [items, result])

  // Any change to the images or settings makes the last PDF out of date.
  const clearResult = () =>
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url)
      return null
    })

  const updateItems = (fn) => {
    clearResult()
    setItems(fn)
  }

  const set = (key) => (e) => {
    const value = key === 'margin' ? Number(e.target.value) : e.target.value
    if (key !== 'fileName') clearResult()
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const addFiles = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'))
    const added = await Promise.all(
      files.map(async (file) => {
        const url = URL.createObjectURL(file)
        try {
          const img = await loadImage(url)
          return { id: nextId++, file, url, img, rotation: 0, error: '' }
        } catch (err) {
          return { id: nextId++, file, url, img: null, rotation: 0, error: err.message }
        }
      }),
    )
    updateItems((list) => [...list, ...added])
  }

  // Paste images from the clipboard anywhere on the page.
  useEffect(() => {
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.files || [])]
      if (files.length) addFiles(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  useEffect(
    () => () => {
      latest.current.items.forEach((it) => URL.revokeObjectURL(it.url))
      if (latest.current.result) URL.revokeObjectURL(latest.current.result.url)
    },
    [],
  )

  const remove = (id) =>
    updateItems((list) => {
      const it = list.find((x) => x.id === id)
      if (it) URL.revokeObjectURL(it.url)
      return list.filter((x) => x.id !== id)
    })

  const clearAll = () => items.forEach((it) => remove(it.id))

  const rotate = (id) => updateItems((list) => list.map((it) => (it.id === id ? { ...it, rotation: (it.rotation + 90) % 360 } : it)))

  const moveTo = (id, index) =>
    updateItems((list) => {
      const from = list.findIndex((x) => x.id === id)
      if (from < 0 || index < 0 || index >= list.length || from === index) return list
      const next = [...list]
      next.splice(index, 0, next.splice(from, 1)[0])
      return next
    })

  const sortByName = () =>
    updateItems((list) => [...list].sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true })))

  const convert = async () => {
    setBusy(true)
    try {
      const quality = qualities.find((q) => q.id === settings.quality)
      const pages = []
      for (const it of items) {
        if (!it.img) continue
        const img = await toJpeg(it.img, it.rotation, quality)
        pages.push({ img, ...layout(img, settings) })
      }
      const blob = buildPdf(pages)
      clearResult()
      setResult({ url: URL.createObjectURL(blob), size: blob.size, pages: pages.length })
    } catch {
      setResult({ error: 'Could not create the PDF. Try fewer or smaller images, or choose “Small file size”.' })
    }
    setBusy(false)
  }

  const download = () => {
    const name = (settings.fileName.trim() || 'images').replace(/[\\/:*?"<>|]+/g, '-').replace(/\.pdf$/i, '')
    const a = document.createElement('a')
    a.href = result.url
    a.download = `${name}.pdf`
    a.click()
    promptSupport()
  }

  const valid = items.filter((it) => it.img).length

  return (
    <div className="qr-tool card resizer">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${items.length ? 'has-files' : ''}`}
        onDragOver={(e) => {
          if (dragId) return
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="dropzone-icon"><Icon name="file" size={28} /></span>
        <strong>{items.length ? 'Add more images' : 'Drop images here or click to browse'}</strong>
        <span className="muted">JPG, PNG, WebP, GIF, BMP · many images at once · or paste with Ctrl+V</span>
      </div>

      <div className="qr-body resizer-body">
        <div className="qr-form">
          <div className="qr-options">
            <label>
              <span>Page size</span>
              <select value={settings.pageSize} onChange={set('pageSize')}>
                {pageSizes.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            {settings.pageSize !== 'fit' && (
              <label>
                <span>Orientation</span>
                <select value={settings.orientation} onChange={set('orientation')}>
                  <option value="auto">Auto (match each image)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
            )}
            <label>
              <span>Margin</span>
              <select value={settings.margin} onChange={set('margin')}>
                {margins.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Quality</span>
              <select value={settings.quality} onChange={set('quality')}>
                {qualities.map((q) => (
                  <option key={q.id} value={q.id}>{q.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>PDF file name</span>
            <input type="text" value={settings.fileName} onChange={set('fileName')} placeholder="images" maxLength={80} />
          </label>

          {result && !result.error && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> PDF ready: <strong>{result.pages} page{result.pages > 1 ? 's' : ''} · {formatBytes(result.size)}</strong>
            </p>
          )}
          {result?.error && <p className="resize-error">{result.error}</p>}

          <div className="qr-actions resizer-actions">
            {result && !result.error ? (
              <button className="btn btn-primary" onClick={download}>
                <Icon name="download" size={18} /> Download PDF
              </button>
            ) : (
              <button className="btn btn-primary" onClick={convert} disabled={!valid || busy}>
                {busy ? 'Creating PDF…' : `Convert ${valid > 1 ? `${valid} images` : 'image'} to PDF`}
              </button>
            )}
            {items.length > 1 && (
              <button className="btn btn-ghost" onClick={sortByName}>
                Sort by name
              </button>
            )}
            {items.length > 0 && (
              <button className="btn btn-ghost" onClick={clearAll}>
                Clear
              </button>
            )}
          </div>
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Your PDF is made in your browser. Images are never uploaded.
          </p>
        </div>

        <div className="resize-list">
          {items.length === 0 && <p className="muted resize-empty">Your pages will appear here, in order.</p>}
          {items.length > 1 && <p className="muted small">Drag to reorder, or use the arrows.</p>}
          {items.map((it, i) => (
            <div
              key={it.id}
              className={`resize-item pdf-item ${dragId === it.id ? 'is-dragging' : ''}`}
              draggable
              onDragStart={(e) => {
                setDragId(it.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => {
                if (!dragId) return
                e.preventDefault()
                if (dragId !== it.id) moveTo(dragId, i)
              }}
              onDragEnd={() => setDragId(null)}
            >
              <span className="pdf-page-num">{i + 1}</span>
              <img src={it.url} alt="" style={{ transform: `rotate(${it.rotation}deg)` }} />
              <div className="resize-info">
                <strong title={it.file.name}>{it.file.name}</strong>
                {it.error ? (
                  <span className="resize-error">{it.error}</span>
                ) : (
                  <span className="muted">
                    {it.img.naturalWidth}×{it.img.naturalHeight} · {formatBytes(it.file.size)}
                    {it.rotation > 0 && ` · rotated ${it.rotation}°`}
                  </span>
                )}
              </div>
              <div className="resize-btns">
                <button className="icon-btn" onClick={() => moveTo(it.id, i - 1)} disabled={i === 0} aria-label="Move up">
                  <Icon name="arrowUp" size={16} />
                </button>
                <button className="icon-btn" onClick={() => moveTo(it.id, i + 1)} disabled={i === items.length - 1} aria-label="Move down">
                  <Icon name="arrowDown" size={16} />
                </button>
                {it.img && (
                  <button className="icon-btn" onClick={() => rotate(it.id)} aria-label="Rotate 90 degrees">
                    <Icon name="refresh" size={16} />
                  </button>
                )}
                <button className="icon-btn" onClick={() => remove(it.id)} aria-label="Remove image">
                  <Icon name="close" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageToPdf
