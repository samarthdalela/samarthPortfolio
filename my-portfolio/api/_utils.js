// Shared helpers for the serverless functions. Files starting with "_" are not routes on Vercel.

export const send = (res, status, data) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export async function readBody(req, maxBytes = 20000) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > maxBytes) throw new Error('Body too large')
  }
  return JSON.parse(raw || '{}')
}

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()

// Simple per-instance limiter: at most `max` calls per IP in `windowMs`.
export function createRateLimiter(max, windowMs) {
  const hits = new Map()
  return (ip) => {
    const now = Date.now()
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs)
    recent.push(now)
    hits.set(ip, recent)
    return recent.length > max
  }
}
