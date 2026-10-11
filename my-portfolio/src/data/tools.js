// The tool cards on the free tools page (/services/), grouped into sections.
// To add a tool, add it to the right section; `emoji` replaces the icon, `external` opens in a new tab.

export const toolSections = [
  {
    id: 'qr-image-tools',
    title: 'QR code & image tools',
    tools: [
      {
        href: '/qr-code-generator/',
        icon: 'qr',
        price: '₹1000 lifetime',
        name: 'QR Code Generator',
        text: 'QR codes for links, UPI payments, Wi-Fi, WhatsApp, email, phone, SMS and contact cards. Custom colours, PNG & SVG download.',
      },
      {
        href: '/image-resizer/',
        icon: 'image',
        price: '₹2000 lifetime',
        name: 'Image Resizer',
        text: 'Resize photos by pixels, percentage or preset, reduce size to any KB, bulk resize and convert JPG, PNG & WebP. Nothing is uploaded.',
      },
    ],
  },
  {
    id: 'pdf-tools',
    title: 'PDF tools',
    sub: 'Convert to and from PDF right in your browser — your files never leave your device.',
    tools: [
      {
        href: '/image-to-pdf/',
        icon: 'file',
        price: '₹1500 lifetime',
        name: 'Image to PDF Converter',
        text: 'Convert JPG, PNG & WebP to PDF and combine many photos into one PDF. Reorder, rotate, pick A4 or Letter — nothing is uploaded.',
      },
      {
        href: '/pdf-to-image/',
        icon: 'image',
        price: '₹1500 lifetime',
        name: 'PDF to Image Converter',
        text: 'Convert PDF pages to JPG, PNG or WebP up to 300 DPI. Pick the pages you need, unlock password-protected PDFs — nothing is uploaded.',
      },
      {
        href: '/word-to-pdf/',
        icon: 'file',
        price: '₹1500 lifetime',
        name: 'Word to PDF Converter',
        text: 'Convert Word documents (DOCX) to PDF with layout, images and tables kept. No Microsoft Word needed — nothing is uploaded.',
      },
    ],
  },
  {
    id: 'apps',
    title: 'Apps',
    sub: 'Install them on your phone like an app.',
    tools: [
      {
        href: 'https://impreminder.netlify.app/',
        external: true,
        emoji: '🎂',
        price: '₹500 lifetime',
        name: 'Special Dates — Birthday Reminder',
        text: 'Never miss a birthday, anniversary or special day. Save dates for your family and friends and get reminder notifications.',
        cta: 'Open Birthday Reminder',
      },
      {
        href: 'https://monitorwebsite.netlify.app/',
        external: true,
        emoji: '🟢',
        price: '₹4000 lifetime',
        name: 'Website Monitor — Server Uptime',
        text: 'Check whether your websites and servers are up or down, and get a notification as soon as one goes down.',
        cta: 'Open Website Monitor',
      },
    ],
  },
]
