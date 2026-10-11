import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Icon from './Icon'
import { profile } from '../data/resume'
import { upiUrl } from '../upi'

const tips = [
  { id: 'chai', emoji: '🍵', label: 'Chai', amount: 20 },
  { id: 'coffee', emoji: '☕', label: 'Coffee', amount: 50 },
  { id: 'treat', emoji: '🍰', label: 'Coffee + snack', amount: 100 },
]

const upiLink = (amount) =>
  upiUrl({ pa: profile.upi, pn: profile.name, am: amount, cu: 'INR', tn: 'Support for free tools' })

// `inModal` renders a shorter version for the support popup.
function Support({ inModal = false }) {
  const [tip, setTip] = useState(tips[1])
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)
  const link = upiLink(tip.amount)

  useEffect(() => {
    QRCode.toDataURL(link, { width: 320, margin: 1, errorCorrectionLevel: 'M' }).then(setQr, () => setQr(''))
  }, [link])

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(profile.upi)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard blocked; the ID is visible to copy by hand
    }
  }

  return (
    <div className={inModal ? 'support support-modal' : 'support card reveal'} id={inModal ? undefined : 'support'}>
      <div className="support-copy">
        <span className="eyebrow">Support</span>
        {inModal ? (
          <>
            <h2 id="support-popup-title">Buy me a chai or coffee ☕</h2>
            <p>
              These tools are free — no ads, no sign-up. A small tip via Google Pay or any UPI app keeps me working on
              them for free. Completely optional.
            </p>
          </>
        ) : (
          <>
            <h2>Help keep these tools free</h2>
            <p>
              I build and run these tools in my free time and keep them free for everyone — no ads, no sign-up. If they
              helped you, buy me a chai or coffee via Google Pay or any UPI app. Your support keeps me building more
              free tools. Completely optional.
            </p>
          </>
        )}

        <div className="tip-options" role="radiogroup" aria-label="Choose an amount">
          {tips.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={tip.id === t.id}
              className={`tip ${tip.id === t.id ? 'is-active' : ''}`}
              onClick={() => setTip(t)}
            >
              <span className="tip-emoji">{t.emoji}</span>
              <span className="tip-label">{t.label}</span>
              <span className="tip-amount">₹{t.amount}</span>
            </button>
          ))}
        </div>

        <div className="upi-id">
          <span className="fact-label">Google Pay / UPI ID</span>
          <div className="upi-row">
            <code>{profile.upi}</code>
            <button className="icon-btn" onClick={copyUpi} aria-label="Copy UPI ID">
              <Icon name={copied ? 'check' : 'copy'} size={18} />
            </button>
          </div>
        </div>

        <a href={link} className="btn btn-primary upi-pay">
          {tip.emoji} Pay ₹{tip.amount} with UPI app
        </a>
        <p className="muted small">The button opens Google Pay, PhonePe or Paytm on your phone. On desktop, scan the QR.</p>
      </div>

      <div className="support-qr">
        <div className="support-qr-box">
          {qr ? (
            <img src={qr} alt={`UPI QR code to pay ₹${tip.amount} to ${profile.name}`} width="240" height="240" />
          ) : (
            <div className="support-qr-placeholder" />
          )}
        </div>
        <p>
          Scan to pay <strong>₹{tip.amount}</strong>
        </p>
        <span className="muted small">Works with any UPI app</span>
      </div>
    </div>
  )
}

export default Support
