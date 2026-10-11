// Static answers for the "Ask about Samarth" chat widget, built from the same resume data as the website.
// Matches the question against keywords; no AI service is involved.
import {
  achievements,
  certifications,
  education,
  experience,
  interests,
  profile,
  projects,
  skills,
} from './resume.js'

const SITE = 'https://samarthdalela.xyz'

// Extra words that point at a specific project.
const projectAliases = {
  'Content Management System': ['cms'],
  'Website Monitor — Server Uptime PWA': ['monitor', 'uptime'],
  'Special Dates — Birthday & Reminder PWA': ['birthday', 'reminder', 'anniversary'],
  'Microservice Architecture with Apache Kafka': ['kafka', 'microservice', 'event-driven'],
  'Ticketing System': ['ticket'],
  'NIELIT Task Management System': ['task'],
  'AI-Powered Automated PPT Generation': ['ppt', 'powerpoint', 'presentation', 'm37labs'],
  'Server, Hosting & Deployment': ['hosting', 'deployment', 'nssm'],
  'Database & Caching Optimization': ['caching', 'indexing', 'query tuning'],
  'API Testing & Load Testing': ['load test', 'k6'],
  'NIC SMTP Relay Email Integration': ['smtp', 'otp', 'nodemailer'],
  'Auto-Translation Chrome Extension': ['translation', 'chrome extension'],
  'Tender Scraper & CMS Auto-Uploader': ['tender', 'scraper', 'scraping'],
  'BCAS Website Maintenance': ['bcas'],
}

const titleStopwords = new Set(['nielit', 'website', 'websites', 'system', 'with', 'main', 'server', 'management', 'automated', 'powered'])

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const hasWord = (q, word) => new RegExp(`(^|[^a-z0-9+#])${escapeRe(word)}([^a-z0-9+#]|$)`).test(q)
// Phrases match anywhere; words of 5+ letters also match as a prefix ("skill" → "skills"); short words must match exactly.
const hasAny = (q, words) =>
  words.some((w) =>
    w.includes(' ') ? q.includes(w) : w.length >= 5 ? new RegExp(`(^|[^a-z0-9])${escapeRe(w)}`).test(q) : hasWord(q, w),
  )
const list = (items) => items.map((i) => `- ${i}`).join('\n')

const contactLine = `You can reach Samarth at ${profile.email} or ${profile.phone}, or use the contact form on the website.`

function findProject(q) {
  let best = null
  let bestScore = 0
  for (const p of projects) {
    const tokens = p.title
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .filter((t) => t.length >= 3 && !titleStopwords.has(t))
    const score =
      tokens.filter((t) => hasWord(q, t)).length + 2 * (projectAliases[p.title] || []).filter((a) => q.includes(a)).length
    if (score > bestScore) {
      best = p
      bestScore = score
    }
  }
  return best
}

function describeProject(p) {
  const links = p.links ? `\nLive: ${p.links.map((l) => l.url).join(', ')}` : ''
  return `**${p.title}**${p.org ? ` (${p.org})` : ''} — ${p.summary}\n${list(p.points)}\nStack: ${p.stack.join(', ')}.${links}`
}

function findSkill(q) {
  for (const group of skills) {
    for (const item of group.items) {
      const key = item.toLowerCase().replace(/\(.*\)/, '').replace(/\.js$/, '').trim()
      if (key.length >= 2 && hasWord(q, key)) return { item, key, group: group.group }
    }
  }
  return null
}

function describeSkill({ item, key, group }) {
  const used = projects.filter((p) => p.stack.some((s) => s.toLowerCase().includes(key))).map((p) => p.title)
  return `Yes — Samarth works with **${item}** (${group}).${
    used.length ? ` He has used it in:\n${list(used.slice(0, 5))}` : ''
  }`
}

export function answerQuestion(question) {
  const q = ` ${question.toLowerCase()} `

  if (hasAny(q, ['resume', 'cv'])) {
    return `You can download Samarth's resume here: ${SITE}${profile.resume}`
  }
  if (hasAny(q, ['opportunit', 'available', 'open to', 'hiring', 'hire', 'freelance', 'job'])) {
    return `Yes, Samarth is open to new opportunities. ${contactLine}`
  }
  if (hasAny(q, ['contact', 'email', 'mail', 'phone', 'call', 'reach', 'number', 'whatsapp'])) {
    return contactLine
  }
  if (hasAny(q, ['qr', 'image resizer', 'resize', 'free tool', 'tools'])) {
    return `Samarth offers these free tools:\n${list([
      `QR Code Generator: ${SITE}/qr-code-generator/`,
      `Image Resizer: ${SITE}/image-resizer/`,
      'Birthday Reminder app: https://impreminder.netlify.app/',
      'Website Monitor app: https://monitorwebsite.netlify.app/',
    ])}`
  }

  const project = findProject(q)
  if (project) return describeProject(project)

  if (hasAny(q, ['project', 'portfolio', 'built', 'build', 'work on', 'worked on'])) {
    return `Some of Samarth's key projects:\n${list(
      projects.filter((p) => p.featured).map((p) => `**${p.title}** — ${p.summary}`),
    )}\nAsk me about any of them for details.`
  }

  const skill = findSkill(q)
  if (skill) return describeSkill(skill)

  if (hasAny(q, ['skill', 'tech', 'technolog', 'stack', 'language', 'know', 'expert', 'good at'])) {
    return `Samarth's main skills:\n${list(skills.map((s) => `**${s.group}:** ${s.items.join(', ')}`))}`
  }
  if (hasAny(q, ['experience', 'nielit', 'company', 'work', 'years', 'career', 'role', 'current'])) {
    return experience
      .map((e) => `**${e.title}, ${e.org}** (${e.duration})\n${list(e.highlights)}`)
      .join('\n\n')
  }
  if (hasAny(q, ['education', 'degree', 'college', 'b.tech', 'btech', 'study', 'studied', 'university', 'school', 'qualification'])) {
    return `Samarth's education:\n${list(education.map((e) => `${e.degree}, ${e.school} (${e.year}) — ${e.score}`))}`
  }
  if (hasAny(q, ['achievement', 'award', 'rank', 'position', 'topper'])) {
    return `Achievements:\n${list(achievements.map((a) => `${a.title} — ${a.detail} (${a.year})`))}`
  }
  if (hasAny(q, ['certif', 'course'])) {
    return `Certifications:\n${list(certifications.map((c) => `${c.name} (${c.org})`))}`
  }
  if (hasAny(q, ['hobby', 'hobbies', 'interest', 'free time', 'fun'])) {
    return `Outside work, Samarth enjoys ${interests.join(', ').toLowerCase()}.`
  }
  if (hasAny(q, ['where', 'location', 'based', 'live', 'city', 'relocat'])) {
    return `Samarth is based in ${profile.location}. ${contactLine}`
  }
  if (hasAny(q, ['hi', 'hello', 'hey', 'namaste'])) {
    return `Hi! I can tell you about Samarth's skills, projects, experience, education or how to contact him. What would you like to know?`
  }
  if (hasAny(q, ['who', 'about', 'summary', 'introduce', 'tell me'])) {
    return `${profile.name} is a ${profile.role} (${profile.tagline}) based in ${profile.location}. ${profile.summary}`
  }

  return `I'm not sure about that one. ${profile.name} is a ${profile.role} (${profile.tagline}). Try asking about his skills, projects, experience or education — or for anything else, ${contactLine.charAt(0).toLowerCase()}${contactLine.slice(1)}`
}
