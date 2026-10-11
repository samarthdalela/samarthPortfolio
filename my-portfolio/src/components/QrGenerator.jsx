import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import Icon from './Icon'
import { upiUrl } from '../upi'
import { promptSupport } from '../support'

// Escapes the characters that have meaning in the Wi-Fi QR format.
const wifiEscape = (s) => s.replace(/([\\;,:"])/g, '\\$1')

const types = [
  {
    id: 'url',
    label: 'URL / Text',
    fields: [{ key: 'text', label: 'Website or text', placeholder: 'https://samarthdalela.xyz', textarea: true }],
    build: (v) => v.text,
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    fields: [
      { key: 'ssid', label: 'Network name (SSID)', placeholder: 'My Home WiFi' },
      { key: 'password', label: 'Password', placeholder: '••••••••' },
      { key: 'security', label: 'Security', options: ['WPA', 'WEP', 'nopass'] },
    ],
    build: (v) =>
      v.ssid &&
      `WIFI:T:${v.security || 'WPA'};S:${wifiEscape(v.ssid)};P:${wifiEscape(v.password || '')};;`,
  },
  {
    id: 'upi',
    label: 'UPI Payment',
    fields: [
      { key: 'pa', label: 'UPI ID', placeholder: 'name@okbank' },
      { key: 'pn', label: 'Payee name', placeholder: 'Your name or shop' },
      { key: 'am', label: 'Amount (₹, optional)', placeholder: '100', type: 'number' },
      { key: 'tn', label: 'Note (optional)', placeholder: 'Order #123' },
    ],
    build: (v) =>
      v.pa && upiUrl({ pa: v.pa.trim(), pn: v.pn || v.pa.trim(), am: v.am, cu: 'INR', tn: v.tn }),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    fields: [
      { key: 'phone', label: 'Phone with country code', placeholder: '919876543210', type: 'tel' },
      { key: 'msg', label: 'Message (optional)', placeholder: 'Hi!', textarea: true },
    ],
    build: (v) => {
      const digits = (v.phone || '').replace(/\D/g, '')
      if (!digits) return ''
      return `https://wa.me/${digits}${v.msg ? `?text=${encodeURIComponent(v.msg)}` : ''}`
    },
  },
  {
    id: 'email',
    label: 'Email',
    fields: [
      { key: 'to', label: 'Email address', placeholder: 'someone@example.com', type: 'email' },
      { key: 'subject', label: 'Subject (optional)', placeholder: 'Hello' },
      { key: 'body', label: 'Message (optional)', placeholder: 'Write your message…', textarea: true },
    ],
    build: (v) => {
      if (!v.to) return ''
      const p = new URLSearchParams()
      if (v.subject) p.set('subject', v.subject)
      if (v.body) p.set('body', v.body)
      const q = p.toString().replace(/\+/g, '%20')
      return `mailto:${v.to}${q ? `?${q}` : ''}`
    },
  },
  {
    id: 'phone',
    label: 'Phone',
    fields: [{ key: 'phone', label: 'Phone number', placeholder: '+91 98765 43210', type: 'tel' }],
    build: (v) => v.phone && `tel:${v.phone.replace(/[^\d+]/g, '')}`,
  },
  {
    id: 'sms',
    label: 'SMS',
    fields: [
      { key: 'phone', label: 'Phone number', placeholder: '+91 98765 43210', type: 'tel' },
      { key: 'msg', label: 'Message', placeholder: 'Your message', textarea: true },
    ],
    build: (v) => v.phone && `SMSTO:${v.phone.replace(/[^\d+]/g, '')}:${v.msg || ''}`,
  },
  {
    id: 'vcard',
    label: 'Contact card',
    fields: [
      { key: 'first', label: 'First name', placeholder: 'Samarth' },
      { key: 'last', label: 'Last name', placeholder: 'Dalela' },
      { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
      { key: 'org', label: 'Company (optional)', placeholder: 'NIELIT' },
      { key: 'url', label: 'Website (optional)', placeholder: 'https://…' },
    ],
    build: (v) => {
      if (!v.first && !v.last) return ''
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v.last || ''};${v.first || ''}`,
        `FN:${[v.first, v.last].filter(Boolean).join(' ')}`,
        v.org && `ORG:${v.org}`,
        v.phone && `TEL;TYPE=CELL:${v.phone}`,
        v.email && `EMAIL:${v.email}`,
        v.url && `URL:${v.url}`,
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n')
    },
  },
]

const levels = [
  { id: 'L', label: 'Low (7%)' },
  { id: 'M', label: 'Medium (15%)' },
  { id: 'Q', label: 'Quartile (25%)' },
  { id: 'H', label: 'High (30%)' },
]

function QrGenerator() {
  const [typeId, setTypeId] = useState('url')
  const [values, setValues] = useState({ url: { text: 'https://samarthdalela.xyz' } })
  const [fg, setFg] = useState('#0c0f1d')
  const [bg, setBg] = useState('#ffffff')
  const [size, setSize] = useState(512)
  const [margin, setMargin] = useState(2)
  const [level, setLevel] = useState('M')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  const type = types.find((t) => t.id === typeId)
  const v = values[typeId] || {}
  const payload = type.build(v) || ''
  const options = { errorCorrectionLevel: level, margin, color: { dark: fg, light: bg } }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!payload) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    QRCode.toCanvas(canvas, payload, { ...options, width: size }, (err) => setError(err ? err.message : ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, fg, bg, size, margin, level])

  const setField = (key) => (e) =>
    setValues((all) => ({ ...all, [typeId]: { ...all[typeId], [key]: e.target.value } }))

  const fileName = `qr-${typeId}-samarthdalela`

  const downloadPng = () => {
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = `${fileName}.png`
    a.click()
    promptSupport()
  }

  const downloadSvg = async () => {
    const svg = await QRCode.toString(payload, { ...options, type: 'svg', width: size })
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.svg`
    a.click()
    URL.revokeObjectURL(url)
    promptSupport()
  }

  const copyImage = () => {
    canvasRef.current.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
        promptSupport()
      } catch {
        downloadPng()
      }
    })
  }

  const ready = Boolean(payload) && !error

  return (
    <div className="qr-tool card">
      <div className="qr-types" role="tablist" aria-label="QR code type">
        {types.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={typeId === t.id}
            className={`filter ${typeId === t.id ? 'is-active' : ''}`}
            onClick={() => setTypeId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="qr-body">
        <div className="qr-form">
          {type.fields.map((f) => (
            <label key={f.key}>
              <span>{f.label}</span>
              {f.options ? (
                <select value={v[f.key] || f.options[0]} onChange={setField(f.key)}>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o === 'nopass' ? 'None (open network)' : o}</option>
                  ))}
                </select>
              ) : f.textarea ? (
                <textarea rows="3" value={v[f.key] || ''} onChange={setField(f.key)} placeholder={f.placeholder} />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={v[f.key] || ''}
                  onChange={setField(f.key)}
                  placeholder={f.placeholder}
                />
              )}
            </label>
          ))}

          <details className="qr-advanced" open>
            <summary>Design &amp; quality</summary>
            <div className="qr-options">
              <label className="qr-color">
                <span>Foreground</span>
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
              </label>
              <label className="qr-color">
                <span>Background</span>
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
              </label>
              <label>
                <span>Size: {size}px</span>
                <input type="range" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(+e.target.value)} />
              </label>
              <label>
                <span>Margin: {margin}</span>
                <input type="range" min="0" max="8" value={margin} onChange={(e) => setMargin(+e.target.value)} />
              </label>
              <label className="qr-level">
                <span>Error correction</span>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </details>
        </div>

        <div className="qr-preview">
          <div className={`qr-canvas-wrap ${ready ? '' : 'is-empty'}`}>
            <canvas ref={canvasRef} aria-label="Generated QR code" />
            {!ready && <p className="muted">{error || 'Fill in the details to generate your QR code'}</p>}
          </div>
          <div className="qr-actions">
            <button className="btn btn-primary" onClick={downloadPng} disabled={!ready}>
              <Icon name="download" size={18} /> PNG
            </button>
            <button className="btn btn-ghost" onClick={downloadSvg} disabled={!ready}>
              <Icon name="download" size={18} /> SVG
            </button>
            <button className="btn btn-ghost" onClick={copyImage} disabled={!ready}>
              <Icon name={copied ? 'check' : 'copy'} size={18} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Generated in your browser. Nothing is uploaded or stored.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QrGenerator
