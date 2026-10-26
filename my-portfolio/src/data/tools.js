// Catalog of every free tool for the free tools page (/services/): a few featured cards, then one section per
// category. Landing pages from landings.js are added to their category automatically, so a new page needs no
// change here. Each tool appears once per section.

import { landings } from './landings'

const page = (p) => ({ href: `/${p.slug}/`, name: p.name, text: p.short })
const isConverter = (p) => p.slug.endsWith('-converter') || p.slug.startsWith('convert-')

// Shown first, as large cards with their price. `highlight` makes a card wide, with a "New" tag.
export const featured = [
  {
    href: '/audio-to-text/',
    icon: 'mic',
    price: '₹1000/month',
    highlight: 'New · AI',
    name: 'Audio to Text Converter',
    text: 'Transcribe MP3, voice notes and videos to text in Hindi, English and 25+ languages — with timestamps and SRT subtitles. Runs on your device, nothing uploaded.',
  },
  {
    href: '/pdf-to-word/',
    icon: 'file',
    price: '₹2000 lifetime',
    name: 'PDF to Word Converter',
    text: 'Turn any PDF into an editable Word document with fonts, headings and formatting kept.',
  },
  {
    href: '/image-resizer/',
    icon: 'image',
    price: '₹2000 lifetime',
    name: 'Image Resizer',
    text: 'Resize by pixels, percentage or preset, reduce to any KB and bulk convert JPG, PNG & WebP.',
  },
  {
    href: '/qr-code-generator/',
    icon: 'qr',
    price: '₹1000 lifetime',
    name: 'QR Code Generator',
    text: 'QR codes for links, UPI payments, Wi-Fi, WhatsApp and contact cards. PNG & SVG download.',
  },
  {
    href: '/image-to-pdf/',
    icon: 'file',
    price: '₹1500 lifetime',
    name: 'Image to PDF Converter',
    text: 'Combine photos and scans into one PDF. Reorder, rotate, pick A4 or Letter.',
  },
]

export const categories = [
  {
    id: 'audio-tools',
    icon: 'mic',
    title: 'Audio & video to text',
    short: 'Audio to text',
    sub: 'Transcribe recordings, voice notes and videos — and make subtitles — with Whisper AI on your device.',
    tools: [
      { href: '/audio-to-text/', name: 'Audio to Text Converter', text: 'Transcribe any recording to text' },
      ...landings.filter((p) => p.tool === 'audio').map(page),
    ],
  },
  {
    id: 'pdf-tools',
    icon: 'file',
    title: 'PDF & document tools',
    short: 'PDF & documents',
    sub: 'Convert between PDF, Word, Excel, PowerPoint, CSV, HTML and more.',
    tools: [
      { href: '/pdf-to-word/', name: 'PDF to Word Converter', text: 'Editable DOCX from any PDF' },
      { href: '/word-to-pdf/', name: 'Word to PDF Converter', text: 'DOCX to PDF, layout kept' },
      { href: '/image-to-pdf/', name: 'Image to PDF Converter', text: 'Combine photos into one PDF' },
      { href: '/pdf-to-image/', name: 'PDF to Image Converter', text: 'PDF pages to JPG or PNG' },
      ...landings.filter((p) => p.tool === 'file').map(page),
    ],
  },
  {
    id: 'image-converters',
    icon: 'image',
    title: 'Image converters',
    short: 'Image converters',
    sub: 'Change image formats — JPG, PNG, WebP, HEIC, SVG, GIF, BMP and Base64.',
    tools: [
      ...landings.filter((p) => p.tool === 'resizer' && isConverter(p)).map(page),
      { href: '/image-to-base64/', name: 'Image to Base64', text: 'Image to data URI, HTML or CSS' },
      { href: '/base64-to-image/', name: 'Base64 to Image', text: 'Decode Base64 and download' },
    ],
  },
  {
    id: 'resize-images',
    icon: 'gauge',
    title: 'Resize & compress images',
    short: 'Resize & compress',
    sub: 'Exact sizes for forms, passports and social media — or any size in KB.',
    tools: [
      { href: '/image-resizer/', name: 'Image Resizer', text: 'Resize by pixels, % or preset' },
      ...landings.filter((p) => p.tool === 'resizer' && !isConverter(p)).map(page),
    ],
  },
  {
    id: 'qr-codes',
    icon: 'qr',
    title: 'QR code generators',
    short: 'QR codes',
    sub: 'Static QR codes that never expire — for payments, Wi-Fi, WhatsApp and more.',
    tools: [
      { href: '/qr-code-generator/', name: 'QR Code Generator', text: 'Every QR code type in one place' },
      ...landings.filter((p) => p.tool === 'qr').map(page),
    ],
  },
  {
    id: 'apps',
    icon: 'star',
    title: 'Apps',
    short: 'Apps',
    sub: 'Install them on your phone like an app.',
    tools: [
      { href: 'https://wispernotes.netlify.app/', external: true, emoji: '🎙️', name: 'WisperNotes', text: 'Meeting transcripts & Minutes of Meeting (MoM)' },
      { href: 'https://impreminder.netlify.app/', external: true, emoji: '🎂', name: 'Birthday Reminder', text: 'Never miss a birthday or anniversary' },
      { href: 'https://monitorwebsite.netlify.app/', external: true, emoji: '🟢', name: 'Website Monitor', text: 'Get alerted when a site goes down' },
    ],
  },
]

export const toolCount = new Set(categories.flatMap((c) => c.tools.map((t) => t.href))).size

export const SERVICES_URL = 'https://samarthdalela.xyz/services/'

// Every tool once, with absolute URLs — for the page's structured data (ItemList).
export const allTools = [...new Map(categories.flatMap((c) => c.tools).map((t) => [t.href, t])).values()].map((t) => ({
  ...t,
  url: t.external ? t.href : `https://samarthdalela.xyz${t.href}`,
}))

// Shown on the page and used as FAQPage structured data (they must match).
export const servicesFaqs = [
  {
    q: 'Are these online tools really free?',
    a: 'Yes. Every tool is completely free with no sign-up, no watermark, no ads and no daily limits. They are kept free by optional support from people who find them useful.',
  },
  {
    q: 'Are my files uploaded to a server?',
    a: 'No. All conversions — PDF, Word, Excel, PowerPoint, images and QR codes — run entirely in your browser, so your files never leave your device. That makes the tools safe for resumes, bank statements, ID cards and other private documents.',
  },
  {
    q: 'Which file conversions are supported?',
    a: 'PDF to Word, Excel, PowerPoint and images; Word, Excel, PowerPoint, RTF and TXT to PDF; Word to HTML; Excel to CSV and CSV to Excel; ODT to DOCX; JPG, PNG, WebP, HEIC, SVG, GIF and BMP image conversions; image to Base64 and back; and audio or video to text (transcription) with SRT subtitles.',
  },
  {
    q: 'Can I reduce a photo to 20 KB, 50 KB or 100 KB for an online form?',
    a: 'Yes. The image resizer can compress a photo to any target size in KB, and there are ready-made pages for 20 KB, 50 KB and 100 KB and for passport-size photos (35×45 mm).',
  },
  {
    q: 'Do the tools work on mobile phones?',
    a: 'Yes. They work in Chrome, Safari, Edge and Firefox on Android, iPhone, Windows, Mac and Linux. There is nothing to install.',
  },
  {
    q: 'Is there a file size or page limit?',
    a: 'There is no fixed limit, because files are processed on your own device. Very large files depend on your device’s memory — a phone may be slower than a computer for big PDFs or hundreds of photos.',
  },
  {
    q: 'Can you build a tool I need?',
    a: 'Yes — suggest it with the “Suggest a tool” button. I also build custom software such as CMS, LMS and CRM systems for businesses.',
  },
]
