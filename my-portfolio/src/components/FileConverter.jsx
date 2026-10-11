import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'
import { converters } from '../convert'

const formatBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`)

const matchesAccept = (file, accept) =>
  accept.split(',').some((a) => {
    const t = a.trim().toLowerCase()
    if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t)
    if (t.endsWith('/*')) return file.type.startsWith(t.slice(0, -1))
    return file.type === t
  })

const save = (d) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(d.blob)
  a.download = d.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// The shared screen for the file-conversion tools: add a file (or paste text), pick options, convert, download.
// Everything that differs per tool lives in its converter config (src/convert/).
function FileConverter({ converter }) {
  const config = converters[converter]
  const [files, setFiles] = useState([])
  const [text, setText] = useState('')
  const [options, setOptions] = useState(() => Object.fromEntries((config.options || []).map((o) => [o.key, o.default])))
  const [password, setPassword] = useState('')
  const [needPassword, setNeedPassword] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  // Bumped on every run, so an older run that finishes late is ignored.
  const runId = useRef(0)
  const resultRef = useRef(result)
  useEffect(() => {
    resultRef.current = result
  }, [result])
  useEffect(() => () => resultRef.current?.cleanup?.(), [])

  const clearResult = () =>
    setResult((r) => {
      r?.cleanup?.()
      return null
    })

  const run = async ({ files: f = files, text: t = text, options: o = options, password: p = password } = {}) => {
    const id = ++runId.current
    const isStale = () => runId.current !== id
    clearResult()
    setError('')
    setStatus('Starting…')
    try {
      const out = await config.convert({
        files: f,
        text: t,
        options: o,
        password: p,
        setStatus: (s) => !isStale() && setStatus(s),
        isStale,
      })
      if (isStale() || !out) return out?.cleanup?.()
      setNeedPassword(false)
      setResult(out)
    } catch (err) {
      if (isStale()) return
      if (err?.name === 'PasswordException') {
        setNeedPassword(true)
        setError(p ? 'Incorrect password. Please try again.' : '')
      } else {
        setError(err?.userMessage || config.errorMessage || 'This file could not be converted.')
      }
    }
    if (!isStale()) setStatus('')
  }

  const addFiles = (list) => {
    const picked = [...list].filter((f) => matchesAccept(f, config.accept))
    if (!picked.length) {
      setError(config.wrongFile || 'Please choose a supported file.')
      return
    }
    const next = config.multiple ? picked : picked.slice(0, 1)
    setFiles(next)
    setText('')
    setPassword('')
    setNeedPassword(false)
    run({ files: next, text: '', password: '' })
  }

  const setOption = (key, value) => {
    const next = { ...options, [key]: value }
    setOptions(next)
    clearResult()
  }

  const busy = !!status
  const hasInput = files.length > 0 || !!text.trim()
  const downloads = result?.downloads || []

  const downloadAll = () => {
    downloads.forEach((d, i) => setTimeout(() => save(d), i * 300))
    promptSupport()
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.code.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
    promptSupport()
  }

  return (
    <div className="qr-tool card resizer">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${files.length ? 'has-files' : ''}`}
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
          accept={config.accept}
          multiple={!!config.multiple}
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="dropzone-icon"><Icon name={config.icon || 'file'} size={28} /></span>
        <strong>
          {files.length
            ? `${files.map((f) => f.name).join(', ')} · ${formatBytes(files.reduce((n, f) => n + f.size, 0))} — click to choose ${config.multiple ? 'other files' : 'another file'}`
            : config.drop}
        </strong>
        {!files.length && <span className="muted">{config.hint}</span>}
      </div>

      <div className="qr-body resizer-body">
        <div className="qr-form">
          {config.textInput && !files.length && (
            <label>
              <span>{config.textInput.label}</span>
              <textarea
                className="b64-text fc-text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  clearResult()
                }}
                placeholder={config.textInput.placeholder}
              />
            </label>
          )}

          {needPassword && (
            <form
              className="pdf-password"
              onSubmit={(e) => {
                e.preventDefault()
                run({ password })
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

          {config.options?.length > 0 && (
            <div className="qr-options">
              {config.options.map((o) => (
                <label key={o.key}>
                  <span>{o.label}</span>
                  <select value={options[o.key]} onChange={(e) => setOption(o.key, e.target.value)} disabled={busy}>
                    {o.choices.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}

          {result?.summary && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> <strong>{result.summary}</strong>
            </p>
          )}
          {result?.notes?.map((n) => (
            <p key={n} className="muted small">{n}</p>
          ))}
          {status && <p className="resize-summary">{status}</p>}
          {error && <p className="resize-error">{error}</p>}

          <div className="qr-actions resizer-actions">
            {downloads.length > 0 ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    save(downloads[0])
                    promptSupport()
                  }}
                >
                  <Icon name="download" size={18} /> {downloads.length > 1 ? `Download ${downloads[0].name}` : (config.downloadLabel || 'Download')}
                </button>
                {downloads.length > 1 && (
                  <button className="btn btn-ghost" onClick={downloadAll}>
                    <Icon name="download" size={18} /> Download all ({downloads.length})
                  </button>
                )}
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => run()} disabled={!hasInput || busy}>
                {busy ? 'Converting…' : config.action}
              </button>
            )}
            {(files.length > 0 || text) && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  runId.current++
                  clearResult()
                  setFiles([])
                  setText('')
                  setStatus('')
                  setError('')
                  setNeedPassword(false)
                }}
                disabled={busy}
              >
                Clear
              </button>
            )}
          </div>
          {result?.print && (
            <p className="muted small">
              Want selectable, searchable text?{' '}
              <button className="link-btn" onClick={result.print}>
                Print → Save as PDF
              </button>{' '}
              uses your browser’s own PDF maker instead.
            </p>
          )}
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Converted in your browser. Your files are never uploaded.
          </p>
        </div>

        <div className="resize-list">
          {!result && <p className="muted resize-empty">{busy ? status : config.empty || 'Your result will appear here.'}</p>}
          {result?.code && (
            <div className="fc-code">
              <textarea className="b64-text" readOnly value={result.code.text} onFocus={(e) => e.target.select()} aria-label={result.code.label} />
              <button className="btn btn-ghost" onClick={copy}>
                <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Copied!' : `Copy ${result.code.label}`}
              </button>
            </div>
          )}
          {result?.previewHtml && (
            <iframe className="fc-preview" title="Preview" sandbox="" srcDoc={result.previewHtml} />
          )}
          {result?.table && (
            <div className="fc-table-wrap">
              <table className="fc-table">
                <tbody>
                  {result.table.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result?.thumbs?.map((thumb, i) => (
            <div key={i} className="resize-item pdf-page">
              <img src={thumb} alt="" />
              <div className="resize-info">
                <strong>{result.thumbLabel || 'Page'} {i + 1}</strong>
              </div>
            </div>
          ))}
          {result?.rows?.map((row, i) => (
            <div key={i} className="resize-item pdf-page">
              <span className="pdf-page-num">{i + 1}</span>
              <div className="resize-info">
                <strong>{row.title}</strong>
                <span className="muted">{row.sub}</span>
              </div>
              {row.download && (
                <div className="resize-btns">
                  <button
                    className="icon-btn"
                    onClick={() => {
                      save(row.download)
                      promptSupport()
                    }}
                    aria-label={`Download ${row.download.name}`}
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

export default FileConverter
