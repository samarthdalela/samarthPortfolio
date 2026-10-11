// POST /api/contact — sends the portfolio contact form to your inbox via Gmail SMTP.
// Runs as a Vercel serverless function (and in `npm run dev` via the plugin in vite.config.js).
// Secrets come from environment variables, never from the frontend:
//   SMTP_USER   Gmail address that sends the mail (e.g. codeforgesd@gmail.com)
//   SMTP_PASS   Gmail app password for SMTP_USER
//   CONTACT_TO  where messages are delivered (defaults to SMTP_USER)
import nodemailer from 'nodemailer'

const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Basic per-instance rate limit: 5 messages per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map()

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const send = (res, status, data) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 20000) throw new Error('Body too large')
  }
  return JSON.parse(raw || '{}')
}

function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { ok: false, error: 'Method not allowed' })
  }

  const { SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('Contact form: SMTP_USER / SMTP_PASS are not set')
    return send(res, 500, { ok: false, error: 'Email is not configured on the server.' })
  }

  let body
  try {
    body = await readBody(req)
  } catch {
    return send(res, 400, { ok: false, error: 'Invalid request.' })
  }

  // Honeypot: a hidden field real visitors never fill in. Pretend success for bots.
  if (body.website) return send(res, 200, { ok: true })

  const data = {}
  for (const key of Object.keys(LIMITS)) data[key] = String(body[key] ?? '').trim()

  if (!data.name || !data.email || !data.message) {
    return send(res, 400, { ok: false, error: 'Please fill in your name, email and message.' })
  }
  if (!EMAIL_RE.test(data.email)) {
    return send(res, 400, { ok: false, error: 'Please enter a valid email address.' })
  }
  for (const [key, max] of Object.entries(LIMITS)) {
    if (data[key].length > max) return send(res, 400, { ok: false, error: `Your ${key} is too long.` })
  }
  // Header fields must be single-line.
  const oneLine = (s) => s.replace(/[\r\n]+/g, ' ')

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) {
    return send(res, 429, { ok: false, error: 'Too many messages. Please try again in a few minutes.' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') },
  })

  const subject = oneLine(data.subject || 'New message')
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="margin:0 0 12px">New message from your portfolio</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}<br>
      <strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br>
      <strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <div style="padding:12px 16px;background:#f4f5fb;border-radius:8px;white-space:pre-wrap">${escapeHtml(data.message)}</div>
      <p style="color:#888;font-size:12px">Sent from the contact form on samarthdalela.xyz. Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
    </div>`

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: CONTACT_TO || SMTP_USER,
      replyTo: { name: oneLine(data.name), address: data.email },
      subject: `Portfolio: ${subject} — ${oneLine(data.name)}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${subject}\n\n${data.message}`,
      html,
    })
    return send(res, 200, { ok: true })
  } catch (err) {
    console.error('Contact form: send failed', err)
    return send(res, 502, { ok: false, error: 'Could not send your message right now. Please email me directly.' })
  }
}
