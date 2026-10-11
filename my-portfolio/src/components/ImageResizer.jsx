import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'

const presets = [
  { id: 'ig-post', label: 'Instagram post', w: 1080, h: 1080 },
  { id: 'ig-story', label: 'Instagram / WhatsApp story', w: 1080, h: 1920 },
  { id: 'yt-thumb', label: 'YouTube thumbnail', w: 1280, h: 720 },
  { id: 'fb-cover', label: 'Facebook cover', w: 820, h: 312 },
  { id: 'li-banner', label: 'LinkedIn banner', w: 1584, h: 396 },
  { id: 'dp', label: 'Profile picture / WhatsApp DP', w: 500, h: 500 },
  { id: 'passport', label: 'Passport photo (35×45 mm)', w: 413, h: 531 },
  { id: 'hd', label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
  { id: '4k', label: '4K (3840×2160)', w: 3840, h: 2160 },
]

const formats = [
  { id: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
]

const MAX_SIDE = 8000

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('This file could not be opened as an image.'))
    img.src = url
  })

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality))

// Final output size for one image, based on the chosen mode.
function targetSize(img, s) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  let w
  let h
  if (s.mode === 'percent') {
    w = (iw * s.percent) / 100
    h = (ih * s.percent) / 100
  } else if (s.mode === 'preset') {
    const p = presets.find((x) => x.id === s.preset)
    w = p.w
    h = p.h
  } else if (s.lock) {
    // Aspect locked: the width (or height, if width is empty) drives the other side for each image.
    if (s.width) {
      w = s.width
      h = (s.width * ih) / iw
    } else {
      h = s.height || ih
      w = (h * iw) / ih
    }
  } else {
    w = s.width || iw
    h = s.height || ih
  }
  const clamp = (v) => Math.max(1, Math.min(MAX_SIDE, Math.round(v)))
  return { w: clamp(w), h: clamp(h) }
}

// Draws the image onto a w×h canvas. Downscales in steps of 2× for sharper results.
function draw(img, w, h, fit, bg, opaqueBg) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (opaqueBg) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
  }
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  let dw = w
  let dh = h
  let sx = 0
  let sy = 0
  let sw = iw
  let sh = ih
  if (fit === 'contain') {
    const k = Math.min(w / iw, h / ih)
    dw = iw * k
    dh = ih * k
  } else if (fit === 'cover') {
    const k = Math.max(w / iw, h / ih)
    sw = w / k
    sh = h / k
    sx = (iw - sw) / 2
    sy = (ih - sh) / 2
  }

  let source = img
  let srcW = sw
  let srcH = sh
  // Step down by halves while the source is more than twice the destination size.
  while (srcW / 2 > dw && srcH / 2 > dh) {
    const step = document.createElement('canvas')
    step.width = Math.round(srcW / 2)
    step.height = Math.round(srcH / 2)
    const sctx = step.getContext('2d')
    sctx.imageSmoothingQuality = 'high'
    sctx.drawImage(source, sx, sy, srcW, srcH, 0, 0, step.width, step.height)
    source = step
    sx = 0
    sy = 0
    srcW = step.width
    srcH = step.height
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, sx, sy, srcW, srcH, (w - dw) / 2, (h - dh) / 2, dw, dh)
  return canvas
}

// Encodes the canvas, searching quality (and then dimensions) to hit a target file size if one is set.
async function encode(img, size, s) {
  const type = s.format
  const lossy = type !== 'image/png'
  const opaque = type === 'image/jpeg'
  let { w, h } = size
  let canvas = draw(img, w, h, s.fit, s.bg, opaque || s.fit === 'contain')
  const targetBytes = s.targetKB ? s.targetKB * 1024 : 0

  if (!targetBytes || !lossy) {
    return { blob: await toBlob(canvas, type, s.quality), w, h, hitTarget: true }
  }

  const MIN_Q = 0.05
  for (let attempt = 0; attempt < 8; attempt++) {
    const smallest = await toBlob(canvas, type, MIN_Q)
    if (smallest.size > targetBytes) {
      // Too big even at the lowest quality: shrink the dimensions. File size scales roughly with area,
      // so jump straight to the estimated size instead of shrinking in small steps.
      if (w <= 16 || h <= 16) return { blob: smallest, w, h, hitTarget: false }
      const k = Math.min(0.95, Math.sqrt(targetBytes / smallest.size) * 0.95)
      w = Math.max(16, Math.round(w * k))
      h = Math.max(16, Math.round(h * k))
      canvas = draw(img, w, h, s.fit, s.bg, opaque || s.fit === 'contain')
      continue
    }
    // Fits at the lowest quality: find the highest quality that still fits.
    let best = smallest
    let lo = MIN_Q
    let hi = 0.95
    for (let i = 0; i < 7; i++) {
      const q = (lo + hi) / 2
      const blob = await toBlob(canvas, type, q)
      if (blob.size <= targetBytes) {
        best = blob
        lo = q
      } else {
        hi = q
      }
    }
    return { blob: best, w, h, hitTarget: true }
  }
  return { blob: await toBlob(canvas, type, MIN_Q), w, h, hitTarget: false }
}

let nextId = 1

function ImageResizer() {
  const [items, setItems] = useState([])
  const [settings, setSettings] = useState({
    mode: 'pixels',
    width: 1080,
    height: '',
    lock: true,
    percent: 50,
    preset: 'ig-post',
    fit: 'contain',
    format: 'image/jpeg',
    quality: 0.85,
    targetKB: '',
    bg: '#ffffff',
  })
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  // Latest items, for freeing object URLs on unmount.
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const set = (key) => (e) => {
    const t = e.target
    const value = t.type === 'checkbox' ? t.checked : t.type === 'number' || t.type === 'range' ? (t.value === '' ? '' : Number(t.value)) : t.value
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const addFiles = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'))
    const added = await Promise.all(
      files.map(async (file) => {
        const url = URL.createObjectURL(file)
        try {
          const img = await loadImage(url)
          return { id: nextId++, file, url, img, w: img.naturalWidth, h: img.naturalHeight, result: null, error: '' }
        } catch (err) {
          return { id: nextId++, file, url, img: null, w: 0, h: 0, result: null, error: err.message }
        }
      }),
    )
    setItems((list) => [...list, ...added])
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

  // Free object URLs when the page closes.
  useEffect(
    () => () =>
      itemsRef.current.forEach((it) => {
        URL.revokeObjectURL(it.url)
        if (it.result) URL.revokeObjectURL(it.result.url)
      }),
    [],
  )

  const remove = (id) =>
    setItems((list) => {
      const it = list.find((x) => x.id === id)
      if (it) {
        URL.revokeObjectURL(it.url)
        if (it.result) URL.revokeObjectURL(it.result.url)
      }
      return list.filter((x) => x.id !== id)
    })

  const clearAll = () => items.forEach((it) => remove(it.id))

  const resizeAll = async () => {
    setBusy(true)
    const updated = []
    for (const it of items) {
      if (!it.img) {
        updated.push(it)
        continue
      }
      try {
        const size = targetSize(it.img, settings)
        const out = await encode(it.img, size, settings)
        if (it.result) URL.revokeObjectURL(it.result.url)
        const ext = formats.find((f) => f.id === settings.format).ext
        const base = it.file.name.replace(/\.[^.]+$/, '')
        updated.push({
          ...it,
          error: '',
          result: {
            url: URL.createObjectURL(out.blob),
            size: out.blob.size,
            w: out.w,
            h: out.h,
            name: `${base}-${out.w}x${out.h}.${ext}`,
            hitTarget: out.hitTarget,
          },
        })
      } catch {
        updated.push({ ...it, error: 'Could not resize this image.' })
      }
    }
    setItems(updated)
    setBusy(false)
  }

  const download = (it) => {
    const a = document.createElement('a')
    a.href = it.result.url
    a.download = it.result.name
    a.click()
  }

  const downloadAll = () => {
    items.filter((it) => it.result).forEach((it, i) => setTimeout(() => download(it), i * 250))
    promptSupport()
  }

  const first = items.find((it) => it.img)
  const preview = first ? targetSize(first.img, settings) : null
  const lossy = settings.format !== 'image/png'
  const done = items.filter((it) => it.result).length

  return (
    <div className="qr-tool card resizer">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${items.length ? 'has-files' : ''}`}
        onDragOver={(e) => {
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
        <span className="dropzone-icon"><Icon name="image" size={28} /></span>
        <strong>Drop images here or click to browse</strong>
        <span className="muted">JPG, PNG, WebP, GIF, BMP · multiple images at once · or paste with Ctrl+V</span>
      </div>

      <div className="qr-body resizer-body">
        <div className="qr-form">
          <div className="qr-types" role="tablist" aria-label="Resize mode">
            {[
              ['pixels', 'By pixels'],
              ['percent', 'By percentage'],
              ['preset', 'Presets'],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={settings.mode === id}
                className={`filter ${settings.mode === id ? 'is-active' : ''}`}
                onClick={() => setSettings((s) => ({ ...s, mode: id }))}
              >
                {label}
              </button>
            ))}
          </div>

          {settings.mode === 'pixels' && (
            <div className="qr-options">
              <label>
                <span>Width (px)</span>
                <input type="number" min="1" max={MAX_SIDE} value={settings.width} onChange={set('width')} placeholder="auto" />
              </label>
              <label>
                <span>Height (px)</span>
                <input
                  type="number"
                  min="1"
                  max={MAX_SIDE}
                  value={settings.lock && settings.width && preview ? preview.h : settings.height}
                  onChange={(e) => setSettings((s) => ({ ...s, height: e.target.value === '' ? '' : Number(e.target.value), width: s.lock ? '' : s.width }))}
                  placeholder="auto"
                />
              </label>
              <label className="check qr-level">
                <input type="checkbox" checked={settings.lock} onChange={set('lock')} />
                <span>Keep aspect ratio</span>
              </label>
            </div>
          )}

          {settings.mode === 'percent' && (
            <label>
              <span>Scale: {settings.percent}%</span>
              <input type="range" min="5" max="200" step="5" value={settings.percent} onChange={set('percent')} />
            </label>
          )}

          {settings.mode === 'preset' && (
            <label>
              <span>Preset size</span>
              <select value={settings.preset} onChange={set('preset')}>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — {p.w}×{p.h}
                  </option>
                ))}
              </select>
            </label>
          )}

          {(settings.mode === 'preset' || (settings.mode === 'pixels' && !settings.lock)) && (
            <label>
              <span>If the shape doesn’t match</span>
              <select value={settings.fit} onChange={set('fit')}>
                <option value="contain">Fit whole image (add background)</option>
                <option value="cover">Fill and crop edges</option>
                <option value="stretch">Stretch to fit</option>
              </select>
            </label>
          )}

          <details className="qr-advanced" open>
            <summary>Format &amp; file size</summary>
            <div className="qr-options">
              <label>
                <span>Format</span>
                <select value={settings.format} onChange={set('format')}>
                  {formats.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </label>
              <label className="qr-color">
                <span>Background</span>
                <input type="color" value={settings.bg} onChange={set('bg')} />
              </label>
              {lossy && (
                <>
                  <label>
                    <span>Quality: {Math.round(settings.quality * 100)}%</span>
                    <input type="range" min="0.1" max="1" step="0.05" value={settings.quality} onChange={set('quality')} disabled={!!settings.targetKB} />
                  </label>
                  <label>
                    <span>Target size (KB, optional)</span>
                    <input type="number" min="5" value={settings.targetKB} onChange={set('targetKB')} placeholder="e.g. 50" />
                  </label>
                </>
              )}
            </div>
            {!lossy && <p className="muted small">PNG is lossless. Choose JPG or WebP to set quality or a target file size.</p>}
          </details>

          {preview && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> {first.w}×{first.h} → <strong>{preview.w}×{preview.h}</strong>
              {items.length > 1 && <span className="muted"> (first image)</span>}
            </p>
          )}

          <div className="qr-actions resizer-actions">
            <button className="btn btn-primary" onClick={resizeAll} disabled={!items.some((it) => it.img) || busy}>
              {busy ? 'Resizing…' : `Resize ${items.length > 1 ? `${items.length} images` : 'image'}`}
            </button>
            {done > 1 && (
              <button className="btn btn-ghost" onClick={downloadAll}>
                <Icon name="download" size={18} /> Download all ({done})
              </button>
            )}
            {items.length > 0 && (
              <button className="btn btn-ghost" onClick={clearAll}>
                Clear
              </button>
            )}
          </div>
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Images are resized in your browser. Nothing is uploaded.
          </p>
        </div>

        <div className="resize-list">
          {items.length === 0 && <p className="muted resize-empty">Your images will appear here.</p>}
          {items.map((it) => (
            <div key={it.id} className="resize-item">
              <img src={it.result ? it.result.url : it.url} alt="" />
              <div className="resize-info">
                <strong title={it.file.name}>{it.result ? it.result.name : it.file.name}</strong>
                {it.error ? (
                  <span className="resize-error">{it.error}</span>
                ) : (
                  <span className="muted">
                    {it.w}×{it.h} · {formatBytes(it.file.size)}
                    {it.result && (
                      <>
                        {' '}→ <b>{it.result.w}×{it.result.h} · {formatBytes(it.result.size)}</b>
                        {!it.result.hitTarget && <em> (smallest possible)</em>}
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="resize-btns">
                {it.result && (
                  <button
                    className="icon-btn"
                    onClick={() => {
                      download(it)
                      promptSupport()
                    }}
                    aria-label={`Download ${it.result.name}`}
                  >
                    <Icon name="download" size={18} />
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

export default ImageResizer
