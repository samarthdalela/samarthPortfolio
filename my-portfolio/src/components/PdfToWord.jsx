import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'
import { loadPdfjs } from '../pdfjs'
import { buildDocx, readPage } from '../pdfToDocx'

const modes = [
  { id: 'text', label: 'Editable text (recommended)' },
  { id: 'image', label: 'Exact layout — pages as pictures (not editable)' },
]

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

function PdfToWord() {
  const [file, setFile] = useState(null)
  const [doc, setDoc] = useState(null)
  const [needPassword, setNeedPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('text')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [result, setResult] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  // Bumped whenever a PDF is opened or cleared, so work for an older PDF stops quietly.
  const runId = useRef(0)
  const latest = useRef({ doc, result })
  useEffect(() => {
    latest.current = { doc, result }
  }, [doc, result])

  useEffect(
    () => () => {
      latest.current.doc?.destroy()
      if (latest.current.result) URL.revokeObjectURL(latest.current.result.url)
    },
    [],
  )

  const clearResult = () => {
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url)
      return null
    })
    setRows([])
  }

  const reset = () => {
    runId.current++
    latest.current.doc?.destroy()
    setDoc(null)
    clearResult()
    setError('')
    setStatus('')
    setNeedPassword(false)
    setPassword('')
  }

  const open = async (f, pass) => {
    const id = ++runId.current
    setStatus('Opening PDF…')
    setError('')
    try {
      const pdfjs = await loadPdfjs()
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()), password: pass || undefined }).promise
      if (runId.current !== id) return pdf.destroy()
      setNeedPassword(false)
      setDoc(pdf)
      setStatus('')
    } catch (err) {
      if (runId.current !== id) return
      setStatus('')
      if (err?.name === 'PasswordException') {
        setNeedPassword(true)
        setError(pass ? 'Incorrect password. Please try again.' : '')
      } else {
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

  const convert = async () => {
    const id = ++runId.current
    const stale = () => runId.current !== id
    clearResult()
    setError('')
    try {
      const pdfjs = await loadPdfjs()
      const pages = []
      for (let n = 1; n <= doc.numPages; n++) {
        setStatus(`Reading page ${n} of ${doc.numPages}…`)
        const page = await doc.getPage(n)
        pages.push({ page, ...(await readPage(pdfjs, page)) })
        if (stale()) return
      }
      const out = await buildDocx(pages, mode, (n) => setStatus(`Building page ${n} of ${pages.length}…`))
      if (stale()) return
      setRows(pages.map((p, i) => ({ n: i + 1, text: mode === 'text' && p.chars >= 30 })))
      setResult({ url: URL.createObjectURL(out.blob), size: out.blob.size, ...out })
      setStatus('')
    } catch {
      if (stale()) return
      setStatus('')
      setError('Could not convert this PDF. Try “Exact layout” instead.')
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = result.url
    a.download = `${file.name.replace(/\.pdf$/i, '')}.docx`
    a.click()
    promptSupport()
  }

  const busy = !!status
  const scannedPages = result && mode === 'text' ? result.imagePages : 0

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
        {!file && <span className="muted">Any PDF with text · converted in your browser · nothing is uploaded</span>}
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
              <button className="btn btn-primary" type="submit" disabled={!password || busy}>
                <Icon name="lock" size={16} /> Unlock
              </button>
            </form>
          )}

          <label>
            <span>Conversion</span>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value)
                clearResult()
              }}
              disabled={busy}
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
          <p className="muted small">
            {mode === 'text'
              ? 'Rebuilds paragraphs, fonts, bold/italic, sizes and alignment so you can edit the text in Word.'
              : 'Each page becomes a picture in Word — looks identical, but the text can’t be edited.'}
          </p>

          {doc && !result && !busy && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> {doc.numPages} page{doc.numPages > 1 ? 's' : ''} ready to convert
            </p>
          )}
          {result && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> Word file ready:{' '}
              <strong>
                {doc.numPages} page{doc.numPages > 1 ? 's' : ''} · {formatBytes(result.size)}
              </strong>
            </p>
          )}
          {scannedPages > 0 && (
            <p className="muted small">
              {scannedPages} page{scannedPages > 1 ? 's have' : ' has'} no selectable text (probably scanned), so{' '}
              {scannedPages > 1 ? 'they were' : 'it was'} added as a picture.
            </p>
          )}
          {status && <p className="resize-summary">{status}</p>}
          {error && <p className="resize-error">{error}</p>}

          <div className="qr-actions resizer-actions">
            {result ? (
              <button className="btn btn-primary" onClick={download}>
                <Icon name="download" size={18} /> Download Word file
              </button>
            ) : (
              <button className="btn btn-primary" onClick={convert} disabled={!doc || busy}>
                {busy ? 'Converting…' : 'Convert to Word'}
              </button>
            )}
            {file && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  reset()
                  setFile(null)
                }}
                disabled={busy}
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
          {!rows.length && <p className="muted resize-empty">{busy ? status : 'Your converted pages will be listed here.'}</p>}
          {rows.map((r) => (
            <div key={r.n} className="resize-item pdf-page">
              <span className="pdf-page-num">{r.n}</span>
              <div className="resize-info">
                <strong>Page {r.n}</strong>
                <span className="muted">{r.text ? <b>Editable text</b> : 'Added as a picture'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PdfToWord
