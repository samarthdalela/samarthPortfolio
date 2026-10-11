import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

// Ways to use the encoded image, shown as tabs in "encode" mode.
const outputs = [
  { id: 'uri', label: 'Data URI', make: (uri) => uri },
  { id: 'raw', label: 'Base64 only', make: (uri) => uri.slice(uri.indexOf(',') + 1) },
  { id: 'html', label: 'HTML <img>', make: (uri, name) => `<img src="${uri}" alt="${name.replace(/"/g, '')}" />` },
  { id: 'css', label: 'CSS background', make: (uri) => `background-image: url("${uri}");` },
  { id: 'md', label: 'Markdown', make: (uri, name) => `![${name.replace(/[[\]]/g, '')}](${uri})` },
]

// Image types recognised from the first bytes when the Base64 has no "data:image/...;base64," prefix.
const signatures = [
  { prefix: 'iVBORw0KGgo', type: 'image/png', ext: 'png' },
  { prefix: '/9j/', type: 'image/jpeg', ext: 'jpg' },
  { prefix: 'R0lGOD', type: 'image/gif', ext: 'gif' },
  { prefix: 'UklGR', type: 'image/webp', ext: 'webp' },
  { prefix: 'Qk', type: 'image/bmp', ext: 'bmp' },
  { prefix: 'AAABAA', type: 'image/x-icon', ext: 'ico' },
  { prefix: 'PHN2Zy', type: 'image/svg+xml', ext: 'svg' },
  { prefix: 'PD94bWwg', type: 'image/svg+xml', ext: 'svg' },
  { prefix: 'AAAAIGZ0eXBhdmlm', type: 'image/avif', ext: 'avif' },
]
const extFor = (type) =>
  signatures.find((s) => s.type === type)?.ext || type.split('/')[1]?.replace('svg+xml', 'svg').replace('jpeg', 'jpg') || 'png'

// Parses pasted text into image bytes: accepts a data URI, plain or URL-safe Base64, with or without line breaks.
function decode(text) {
  const input = text.trim().replace(/^["'(]+|["')]+;?$/g, '')
  const match = input.match(/^data:([\w/+.-]+)?(?:;[\w=-]+)*;base64,(.*)$/s)
  let b64 = (match ? match[2] : input).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (!b64) throw new Error('Paste a Base64 string or data URI first.')
  if (/[^A-Za-z0-9+/=]/.test(b64)) throw new Error('This is not valid Base64 — it contains characters Base64 does not use.')
  b64 = b64.replace(/=+$/, '')
  b64 += '='.repeat((4 - (b64.length % 4)) % 4)
  let binary
  try {
    binary = atob(b64)
  } catch {
    throw new Error('This is not valid Base64.')
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const type = (match?.[1]?.startsWith('image/') && match[1]) || signatures.find((s) => b64.startsWith(s.prefix))?.type || 'image/png'
  return { bytes, type }
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const loadSize = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => reject(new Error('The Base64 was decoded, but it is not an image this browser can show.'))
    img.src = url
  })

function Base64Tool({ initialMode = 'encode' }) {
  const [mode, setMode] = useState(initialMode)

  // Encode (image → Base64)
  const [file, setFile] = useState(null)
  const [uri, setUri] = useState('')
  const [size, setSize] = useState(null)
  const [output, setOutput] = useState('uri')
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  // Decode (Base64 → image)
  const [text, setText] = useState('')
  const [decoded, setDecoded] = useState(null)
  const [error, setError] = useState('')
  const decodedRef = useRef(decoded)
  useEffect(() => {
    decodedRef.current = decoded
  }, [decoded])
  useEffect(() => () => decodedRef.current && URL.revokeObjectURL(decodedRef.current.url), [])

  const encodeFile = (fileList) => {
    const f = [...fileList].find((x) => x.type.startsWith('image/'))
    if (!f) {
      setError('Please choose an image file.')
      return
    }
    setError('')
    setCopied(false)
    const reader = new FileReader()
    reader.onload = async () => {
      setFile(f)
      setUri(reader.result)
      setSize(await loadSize(reader.result).catch(() => null))
    }
    reader.readAsDataURL(f)
  }

  // Paste an image from the clipboard while encoding.
  useEffect(() => {
    if (mode !== 'encode') return
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.files || [])]
      if (files.length) encodeFile(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [mode])

  // Decoding runs on every keystroke; only the latest run may update the preview.
  const decodeId = useRef(0)
  const runDecode = async (value) => {
    const id = ++decodeId.current
    if (decodedRef.current) URL.revokeObjectURL(decodedRef.current.url)
    decodedRef.current = null
    setDecoded(null)
    setError('')
    if (!value.trim()) return
    try {
      const { bytes, type } = decode(value)
      const url = URL.createObjectURL(new Blob([bytes], { type }))
      try {
        const dims = await loadSize(url)
        if (id !== decodeId.current) return URL.revokeObjectURL(url)
        setDecoded({ url, type, size: bytes.length, ...dims })
      } catch (err) {
        URL.revokeObjectURL(url)
        throw err
      }
    } catch (err) {
      if (id === decodeId.current) setError(err.message)
    }
  }

  const encoded = uri ? outputs.find((o) => o.id === output).make(uri, file?.name || 'image') : ''

  const copy = async () => {
    setCopied(await copyText(encoded))
    setTimeout(() => setCopied(false), 2000)
    promptSupport()
  }

  const downloadText = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([encoded], { type: 'text/plain' }))
    a.download = `${(file?.name || 'image').replace(/\.[^.]+$/, '')}-base64.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    promptSupport()
  }

  const downloadImage = () => {
    const a = document.createElement('a')
    a.href = decoded.url
    a.download = `image.${extFor(decoded.type)}`
    a.click()
    promptSupport()
  }

  return (
    <div className="qr-tool card resizer">
      <div className="qr-types" role="tablist" aria-label="Direction">
        {[
          ['encode', 'Image → Base64'],
          ['decode', 'Base64 → Image'],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={`filter ${mode === id ? 'is-active' : ''}`}
            onClick={() => {
              setMode(id)
              setError('')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'encode' ? (
        <>
          <div
            className={`dropzone b64-drop ${dragging ? 'is-dragging' : ''} ${file ? 'has-files' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              encodeFile(e.dataTransfer.files)
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
              hidden
              onChange={(e) => {
                encodeFile(e.target.files)
                e.target.value = ''
              }}
            />
            <span className="dropzone-icon"><Icon name="image" size={28} /></span>
            <strong>{file ? `${file.name} — click to choose another image` : 'Drop an image here or click to browse'}</strong>
            {!file && <span className="muted">PNG, JPG, WebP, GIF, SVG, ICO, AVIF · or paste with Ctrl+V</span>}
          </div>
          {error && <p className="resize-error">{error}</p>}

          {uri && (
            <div className="b64-body">
              <div className="b64-preview">
                <img src={uri} alt="Your image" />
                <p className="muted small">
                  {size && `${size.w}×${size.h} · `}
                  {formatBytes(file.size)} → <b>{formatBytes(encoded.length)}</b> as text
                </p>
              </div>
              <div className="b64-output">
                <div className="qr-types b64-formats" role="tablist" aria-label="Output format">
                  {outputs.map((o) => (
                    <button
                      key={o.id}
                      role="tab"
                      aria-selected={output === o.id}
                      className={`filter ${output === o.id ? 'is-active' : ''}`}
                      onClick={() => setOutput(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <textarea className="b64-text" readOnly value={encoded} onFocus={(e) => e.target.select()} aria-label="Base64 output" />
                <div className="qr-actions resizer-actions">
                  <button className="btn btn-primary" onClick={copy}>
                    <Icon name={copied ? 'check' : 'copy'} size={18} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button className="btn btn-ghost" onClick={downloadText}>
                    <Icon name="download" size={18} /> Download .txt
                  </button>
                </div>
                {file.size > 100 * 1024 && (
                  <p className="muted small">
                    Tip: Base64 makes files about 33% bigger. For images over ~10 KB, a normal image file usually loads faster on websites.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="b64-body">
          <div className="b64-output">
            <label>
              <span>Paste Base64 or a data URI</span>
              <textarea
                className="b64-text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  runDecode(e.target.value)
                }}
                placeholder="data:image/png;base64,iVBORw0KGgo…  or just  iVBORw0KGgo…"
                spellCheck="false"
              />
            </label>
            <div className="qr-actions resizer-actions">
              {text && (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setText('')
                    runDecode('')
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {error && <p className="resize-error">{error}</p>}
          </div>
          <div className="b64-preview">
            {decoded ? (
              <>
                <img src={decoded.url} alt="Decoded image" />
                <p className="resize-summary">
                  <Icon name="check" size={16} /> {extFor(decoded.type).toUpperCase()} · {decoded.w}×{decoded.h} · {formatBytes(decoded.size)}
                </p>
                <button className="btn btn-primary" onClick={downloadImage}>
                  <Icon name="download" size={18} /> Download image
                </button>
              </>
            ) : (
              <p className="muted resize-empty">The image will appear here.</p>
            )}
          </div>
        </div>
      )}
      <p className="qr-privacy">
        <Icon name="lock" size={14} /> Everything runs in your browser. Nothing is uploaded.
      </p>
    </div>
  )
}

export default Base64Tool
