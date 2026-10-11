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

// Email-safe HTML (tables + inline styles) so it renders the same in Gmail, Outlook and phone mail apps.
function emailTemplate({ name, email, subject, message, receivedAt }) {
  const n = escapeHtml(name)
  const e = escapeHtml(email)
  const s = escapeHtml(subject)
  const m = escapeHtml(message).replace(/\n/g, '<br>')
  const initial = escapeHtml(name.trim().charAt(0).toUpperCase() || '?')
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`
  const row = (label, value) => `
    <tr>
      <td style="padding:6px 0;width:90px;color:#7d839a;font-size:13px;vertical-align:top">${label}</td>
      <td style="padding:6px 0;color:#0c0f1d;font-size:14px;font-weight:600">${value}</td>
    </tr>`

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef0f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">${n} sent you a message on Samarth Portfolio: ${s}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f8;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08)">

        <!-- Header -->
        <tr><td style="background:#4f46e5;background-image:linear-gradient(120deg,#4f46e5,#7c3aed 50%,#0891b2);padding:28px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:48px">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;font-weight:700;font-size:17px;line-height:44px;text-align:center">SD</div>
            </td>
            <td style="padding-left:14px">
              <div style="color:#ffffff;font-size:20px;font-weight:700">Samarth Portfolio</div>
              <div style="color:rgba(255,255,255,0.85);font-size:13px">New message from your contact form</div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Sender -->
        <tr><td style="padding:28px 32px 8px">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:52px">
              <div style="width:48px;height:48px;border-radius:50%;background:#eef0ff;color:#4f46e5;font-weight:700;font-size:20px;line-height:48px;text-align:center">${initial}</div>
            </td>
            <td style="padding-left:12px">
              <div style="color:#0c0f1d;font-size:18px;font-weight:700">${n}</div>
              <a href="mailto:${e}" style="color:#4f46e5;font-size:14px;text-decoration:none">${e}</a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:8px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eceef5;border-bottom:1px solid #eceef5;padding:8px 0">
            ${row('Subject', s)}
            ${row('Received', `${escapeHtml(receivedAt)} IST`)}
          </table>
        </td></tr>

        <!-- Message -->
        <tr><td style="padding:20px 32px 8px">
          <div style="color:#7d839a;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px">Message</div>
          <div style="background:#f7f8fc;border-left:4px solid #4f46e5;border-radius:10px;padding:18px 20px;color:#1f2337;font-size:15px;line-height:1.65">${m}</div>
        </td></tr>

        <!-- Action -->
        <tr><td style="padding:24px 32px 32px">
          <a href="${replyHref}" style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 26px;border-radius:999px">Reply to ${n}</a>
          <div style="color:#7d839a;font-size:12px;margin-top:12px">Or just hit Reply — it goes straight to ${e}.</div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f7f8fc;padding:18px 32px;color:#7d839a;font-size:12px;line-height:1.6">
          Sent from the contact form on <a href="https://samarthdalela.xyz/#contact" style="color:#4f46e5;text-decoration:none">samarthdalela.xyz</a> · Samarth Portfolio
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
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
  const receivedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  try {
    await transporter.sendMail({
      from: `"Samarth Portfolio" <${SMTP_USER}>`,
      to: CONTACT_TO || SMTP_USER,
      replyTo: { name: oneLine(data.name), address: data.email },
      subject: `📩 Samarth Portfolio: new message from ${oneLine(data.name)} — ${subject}`,
      text: [
        'New message from Samarth Portfolio (samarthdalela.xyz)',
        '',
        `Name:     ${data.name}`,
        `Email:    ${data.email}`,
        `Subject:  ${subject}`,
        `Received: ${receivedAt} IST`,
        '',
        data.message,
        '',
        `Reply to this email to answer ${data.name} directly.`,
      ].join('\n'),
      html: emailTemplate({ ...data, subject, receivedAt }),
    })
    return send(res, 200, { ok: true })
  } catch (err) {
    console.error('Contact form: send failed', err)
    return send(res, 502, { ok: false, error: 'Could not send your message right now. Please email me directly.' })
  }
}
