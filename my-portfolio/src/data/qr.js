// Content for the QR Code Generator page. Used for both the visible page and its structured data,
// so the two always match (Google requires that).

export const QR_URL = 'https://samarthdalela.xyz/qr-code-generator/'

export const qrSteps = [
  {
    name: 'Choose the QR code type',
    text: 'Pick what the QR code should do: open a website, join Wi-Fi, make a UPI payment, start a WhatsApp chat, send an email or SMS, call a number or save a contact.',
  },
  {
    name: 'Enter your details',
    text: 'Type the link, Wi-Fi name and password, UPI ID and amount, phone number or contact details. The QR code updates live as you type.',
  },
  {
    name: 'Customise the design',
    text: 'Change the colours, size, margin and error-correction level. Keep a dark foreground on a light background so every phone can scan it.',
  },
  {
    name: 'Download or copy',
    text: 'Download the QR code as a PNG for sharing and the web, or as an SVG for print, or copy it straight to your clipboard.',
  },
]

export const qrTypes = [
  { title: 'URL & Text QR code', text: 'Link to your website, Google review page, menu, form or any text.' },
  { title: 'UPI payment QR code', text: 'Accept payments on Google Pay, PhonePe, Paytm and BHIM, with an optional fixed amount.' },
  { title: 'Wi-Fi QR code', text: 'Let guests join your Wi-Fi by scanning — no need to share or type the password.' },
  { title: 'WhatsApp QR code', text: 'Open a WhatsApp chat with your number, with a pre-filled message.' },
  { title: 'Email QR code', text: 'Open a new email with the address, subject and message filled in.' },
  { title: 'Phone & SMS QR code', text: 'Call a number or send a ready-written SMS in one scan.' },
  { title: 'Contact card (vCard) QR code', text: 'Save your name, phone, email, company and website to a phone’s contacts.' },
  { title: 'PNG & SVG download', text: 'High-resolution PNG up to 1024px, or a vector SVG that stays sharp at any print size.' },
]

export const qrFaqs = [
  {
    q: 'Is this QR code generator really free?',
    a: 'Yes. It is completely free with no sign-up, no watermark and no limit on how many QR codes you create.',
  },
  {
    q: 'Do the QR codes expire?',
    a: 'No. These are static QR codes: your link or details are stored inside the code itself, so they keep working forever and do not depend on any server.',
  },
  {
    q: 'How do I create a UPI payment QR code?',
    a: 'Choose “UPI Payment”, enter your UPI ID and name, and optionally an amount and note. Customers can scan it with Google Pay, PhonePe, Paytm, BHIM or any UPI app.',
  },
  {
    q: 'How do I make a Wi-Fi QR code?',
    a: 'Choose “Wi-Fi”, enter your network name (SSID), password and security type (usually WPA). When someone scans it with their phone camera, they can join the network without typing the password.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. The QR code is generated entirely in your browser. Nothing you type is uploaded, stored or tracked.',
  },
  {
    q: 'Should I download PNG or SVG?',
    a: 'Use PNG for WhatsApp, social media and websites. Use SVG for printing on posters, cards or banners, because it stays sharp at any size.',
  },
  {
    q: 'Can I change the colours of my QR code?',
    a: 'Yes. You can set any foreground and background colour. For reliable scanning, keep the foreground dark and the background light with strong contrast.',
  },
  {
    q: 'What is error correction?',
    a: 'Error correction lets a QR code still scan when part of it is dirty, damaged or covered. Higher levels (Q or H) are more robust but make the code denser; Medium suits most uses.',
  },
]
