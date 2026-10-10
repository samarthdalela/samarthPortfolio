import { useState } from 'react'
import Icon from './Icon'
import { SectionHead } from './Sections'
import { profile } from '../data/resume'

function Contact() {
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', message: '' })

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  // No backend: open the visitor's mail client with the message prefilled.
  const onSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(form.subject || `Hello from ${form.name}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
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
              <input required value={form.name} onChange={update('name')} placeholder="Jane Doe" />
            </label>
            <label>
              <span>Subject</span>
              <input value={form.subject} onChange={update('subject')} placeholder="Job opportunity" />
            </label>
            <label>
              <span>Message</span>
              <textarea required rows="5" value={form.message} onChange={update('message')} placeholder="Tell me about the role or project…" />
            </label>
            <button type="submit" className="btn btn-primary">
              Send message <Icon name="send" size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
