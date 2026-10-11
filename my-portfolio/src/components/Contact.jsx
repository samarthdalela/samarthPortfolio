import { useState } from 'react'
import Icon from './Icon'
import { SectionHead } from './Sections'
import { profile } from '../data/resume'

function Contact() {
  const [copied, setCopied] = useState(false)
  const empty = { name: '', email: '', subject: '', message: '', website: '' }
  const [form, setForm] = useState(empty)
  // idle | sending | sent | error
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  // Sends through the /api/contact serverless function (Gmail SMTP on the server).
  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not send your message.')
      setStatus('sent')
      setForm(empty)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <section id="contact" className="section section-alt">
      <div className="container">
        <SectionHead eyebrow="06 · Contact" title="Let's build something together">
          I'm looking for a challenging role where I can put strong coding and problem-solving skills to work. My inbox is open.
        </SectionHead>

        <div className="contact-grid">
          <div className="contact-cards">
            <div className="contact-card card reveal">
              <span className="fact-icon"><Icon name="mail" /></span>
              <div className="contact-text">
                <span className="fact-label">Email</span>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </div>
              <button className="icon-btn" onClick={copyEmail} aria-label="Copy email address">
                <Icon name={copied ? 'check' : 'copy'} size={18} />
              </button>
            </div>
            <div className="contact-card card reveal">
              <span className="fact-icon"><Icon name="phone" /></span>
              <div className="contact-text">
                <span className="fact-label">Phone</span>
                <a href={`tel:${profile.phone.replace(/-/g, '')}`}>{profile.phone}</a>
              </div>
            </div>
            <div className="contact-card card reveal">
              <span className="fact-icon"><Icon name="pin" /></span>
              <div className="contact-text">
                <span className="fact-label">Location</span>
                <span>{profile.location}</span>
              </div>
            </div>
            <a href={profile.resume} download className="contact-card card reveal resume-card">
              <span className="fact-icon"><Icon name="file" /></span>
              <div className="contact-text">
                <span className="fact-label">Resume</span>
                <span>Download PDF</span>
              </div>
              <span className="icon-btn"><Icon name="download" size={18} /></span>
            </a>
            {copied && <p className="toast" role="status">Email copied to clipboard</p>}
          </div>

          <form className="contact-form card reveal" onSubmit={onSubmit}>
            <label>
              <span>Your name</span>
              <input required value={form.name} onChange={update('name')} placeholder="Jane Doe" autoComplete="name" />
            </label>
            <label>
              <span>Your email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="jane@company.com"
                autoComplete="email"
              />
            </label>
            <label>
              <span>Subject</span>
              <input value={form.subject} onChange={update('subject')} placeholder="Job opportunity" />
            </label>
            <label>
              <span>Message</span>
              <textarea required rows="5" value={form.message} onChange={update('message')} placeholder="Tell me about the role or project…" />
            </label>
            {/* Honeypot: hidden from people; bots fill it in and get ignored. */}
            <input
              className="hp-field"
              name="website"
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={update('website')}
            />
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'} <Icon name="send" size={18} />
            </button>
            {status === 'sent' && (
              <p className="form-status is-success" role="status">
                <Icon name="check" size={16} /> Thanks! Your message has been sent — I'll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="form-status is-error" role="alert">
                {error} You can also email me at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
