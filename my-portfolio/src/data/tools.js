// Catalog of every free tool for the free tools page (/services/): a few featured cards, then one section per
// category. Landing pages from landings.js are added to their category automatically, so a new page needs no
// change here. Each tool appears once per section.

import { landings } from './landings'

const page = (p) => ({ href: `/${p.slug}/`, name: p.name, text: p.short })
const isConverter = (p) => p.slug.endsWith('-converter') || p.slug.startsWith('convert-')

// Shown first, as large cards with their price.
export const featured = [
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
      { href: 'https://impreminder.netlify.app/', external: true, emoji: '🎂', name: 'Birthday Reminder', text: 'Never miss a birthday or anniversary' },
      { href: 'https://monitorwebsite.netlify.app/', external: true, emoji: '🟢', name: 'Website Monitor', text: 'Get alerted when a site goes down' },
    ],
  },
]

export const toolCount = new Set(categories.flatMap((c) => c.tools.map((t) => t.href))).size
