// SEO landing pages: one focused page per tool feature (e.g. /upi-qr-code-generator/, /resize-image-to-50kb/).
// Each page reuses the QR generator or image resizer, preset for that feature, with its own content.
//
// This file is the single source for those pages: scripts/gen-pages.mjs creates <slug>/index.html and the
// sitemap from it, vite.config.js builds every page, and the visible content doubles as structured data.
// Keep it plain JS (no JSX) — it is imported by Node at build time.

export const SITE = 'https://samarthdalela.xyz'

const qrShared = [
  { title: 'Free, no sign-up, no watermark', text: 'Create as many QR codes as you like. No account, no subscription, no logo stamped on your code.' },
  { title: 'Never expires', text: 'A static QR code: the details live inside the code itself, so it keeps working forever without any server.' },
  { title: 'Private — runs in your browser', text: 'Nothing you type is uploaded, stored or tracked. The QR code is generated on your own device.' },
  { title: 'PNG & SVG download', text: 'High-resolution PNG up to 1024px for sharing, or a vector SVG that stays sharp on any print size.' },
  { title: 'Custom colours', text: 'Match your brand with any foreground and background colour. Keep it dark on light so every phone can scan it.' },
]

const resizerShared = [
  { title: 'Private — nothing is uploaded', text: 'Your photos are processed on your own device. They never leave your phone or computer.' },
  { title: 'Free, no sign-up, no watermark', text: 'Resize as many images as you want. No account, no limits, no logo added to your photo.' },
  { title: 'Bulk resize', text: 'Add many images at once and download each one, all with the same settings.' },
  { title: 'Works on phone and computer', text: 'Use it in Chrome, Safari, Edge or Firefox on Android, iPhone, Windows or Mac — no app to install.' },
]

const qr = (page) => ({
  tool: 'qr',
  category: 'UtilitiesApplication',
  badges: ['No sign-up', 'No watermark', 'Never expires', 'Private — runs in your browser'],
  price: '₹1000 lifetime',
  ...page,
  features: [...page.features, ...qrShared],
})

const resizer = (page) => ({
  tool: 'resizer',
  category: 'MultimediaApplication',
  badges: ['No sign-up', 'No watermark', 'Nothing uploaded', 'Bulk resize'],
  price: '₹2000 lifetime',
  ...page,
  features: [...page.features, ...resizerShared],
})

const kbPage = ({ kb, slug, uses, faqs }) =>
  resizer({
    slug,
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/jpeg', targetKB: kb } },
    name: `Image Resizer to ${kb}KB`,
    short: `Compress any photo to under ${kb}KB`,
    title: `Resize Image to ${kb}KB Online Free – Compress Photo to ${kb} KB`,
    description: `Resize and compress any image to ${kb}KB online for free. Reduce JPG, PNG or photo size to under ${kb} KB for ${uses} — no upload, no sign-up, works on phone.`,
    keywords: `resize image to ${kb}kb, compress image to ${kb}kb, reduce image size to ${kb}kb, photo resize ${kb}kb, image ${kb}kb, convert image to ${kb}kb, jpg to ${kb}kb, ${kb}kb photo, compress jpeg to ${kb}kb`,
    summary: `Compress any photo to under ${kb}KB in one click — ideal for ${uses}. Pick your image and the tool finds the best quality that fits within ${kb} KB. Free, no sign-up, nothing uploaded.`,
    howToTitle: `How to resize an image to ${kb}KB`,
    steps: [
      { name: 'Add your photo', text: 'Tap the upload box or drag and drop a JPG, PNG or WebP photo. You can add several at once.' },
      { name: `Keep the target at ${kb} KB`, text: `The “Target size” is already set to ${kb} KB and the format to JPG. Change it if your form asks for a different limit.` },
      { name: 'Resize', text: `Press the Resize button. The tool lowers the quality step by step, and only shrinks the dimensions if needed, to stay under ${kb} KB.` },
      { name: 'Download', text: 'Check the new size shown under each image and download it, ready to upload.' },
    ],
    featuresTitle: `Compress photos to ${kb}KB without losing clarity`,
    featuresSub: `Hit the ${kb} KB limit on the first try, keeping as much quality as possible.`,
    features: [
      { title: `Exact ${kb} KB target`, text: `Set a size limit and the tool searches for the highest quality that still stays under ${kb} KB.` },
      { title: 'Keeps your photo sharp', text: 'Quality is reduced first; the width and height are only lowered when quality alone is not enough.' },
      { title: 'Any target size', text: 'Need 10 KB, 30 KB or 200 KB instead? Just type a different number in “Target size (KB)”.' },
    ],
    faqTitle: `Resize image to ${kb}KB — FAQ`,
    faqs: [
      {
        q: `How do I reduce my photo size to ${kb}KB?`,
        a: `Add your photo above, keep “Target size” at ${kb} KB and the format as JPG, then press the Resize button and download. The tool automatically finds the best quality under ${kb} KB.`,
      },
      ...faqs,
      {
        q: `Why is my image still above ${kb}KB?`,
        a: 'Make sure the format is JPG or WebP. PNG is a lossless format, so the target size cannot be applied to it.',
      },
      {
        q: 'Are my photos uploaded to a server?',
        a: 'No. Everything happens in your browser, so your photos never leave your device.',
      },
    ],
    appDescription: `Free online tool to resize and compress an image to ${kb}KB. Reduces JPG, PNG and WebP photos to under ${kb} KB in the browser, with bulk resize and no upload.`,
  })

export const landings = [
  // ---------- QR code generators ----------
  qr({
    slug: 'wifi-qr-code-generator',
    toolProps: { initialType: 'wifi' },
    name: 'WiFi QR Code Generator',
    short: 'Guests join your Wi-Fi by scanning',
    title: 'Free WiFi QR Code Generator – Share Wi-Fi Without Typing Password',
    description:
      'Free WiFi QR code generator: make a QR code for your Wi-Fi so guests connect by scanning on iPhone & Android — no typing passwords. WPA/WPA2/WPA3, PNG & SVG, no sign-up, never expires.',
    keywords:
      'wifi qr code generator, wi-fi qr code generator, wifi qr code, free wifi qr code generator, qr code for wifi, wifi password qr code, create wifi qr code, share wifi qr code, wifi qr code iphone, wifi qr code android, wifi qr code for restaurant, wifi qr code India',
    summary:
      'Create a Wi-Fi QR code in seconds. Enter your network name and password, and guests can join your Wi-Fi just by scanning with their iPhone or Android camera — no typing passwords. Free, no sign-up, never expires.',
    badges: ['No sign-up', 'iPhone & Android', 'Never expires', 'Password stays on your device'],
    howToTitle: 'How to create a Wi-Fi QR code in 4 steps',
    steps: [
      { name: 'Enter your Wi-Fi name (SSID)', text: 'Type the exact name of your Wi-Fi network as it appears on your phone or router label. It is case-sensitive.' },
      { name: 'Enter the password and security type', text: 'Type the Wi-Fi password and pick the security type. Most home and office routers use WPA/WPA2/WPA3 — choose WPA. Pick “None” for an open network.' },
      { name: 'Customise the QR code', text: 'Optionally change the colours, size and error correction. Keep a dark code on a light background so every phone camera can scan it.' },
      { name: 'Download, print and share', text: 'Download the Wi-Fi QR code as PNG or SVG and print it on a table card, poster or fridge sticker. Guests scan it and connect instantly.' },
    ],
    featuresTitle: 'Why use this Wi-Fi QR code generator',
    featuresSub: 'Share your Wi-Fi with family, guests and customers without ever saying the password out loud.',
    features: [
      { title: 'Connect without typing the password', text: 'Guests scan with their phone camera and join your Wi-Fi in one tap — no spelling out long passwords.' },
      { title: 'Works on iPhone and Android', text: 'Uses the standard WIFI: QR format read by the built-in camera on iPhone (iOS 11+) and Android (10+), and by Google Lens.' },
      { title: 'WPA, WPA2, WPA3, WEP & open networks', text: 'Supports every common security type, plus hidden networks that do not broadcast their name.' },
      { title: 'For homes, cafés, offices & Airbnbs', text: 'Perfect for restaurants, hotels, PGs, hostels, clinics, salons, co-working spaces, events and guest rooms.' },
    ],
    faqTitle: 'Wi-Fi QR code — frequently asked questions',
    faqs: [
      { q: 'How do I create a QR code for my Wi-Fi?', a: 'Enter your Wi-Fi network name (SSID), your password and the security type (usually WPA) in the generator above. The QR code appears instantly — download it as PNG or SVG and print or share it.' },
      { q: 'Is this Wi-Fi QR code generator free?', a: 'Yes. It is completely free with no sign-up, no watermark, no limits and no expiry.' },
      { q: 'How do I scan a Wi-Fi QR code on iPhone?', a: 'Open the Camera app and point it at the QR code. Tap the “Join network” notification that appears. This works on iPhone with iOS 11 or later.' },
      { q: 'How do I scan a Wi-Fi QR code on Android?', a: 'Open the Camera app or Google Lens and point it at the QR code, then tap “Connect”. On many phones you can also go to Settings → Wi-Fi and tap the QR scan icon next to “Add network”.' },
      { q: 'Is it safe to put my Wi-Fi password in a QR code?', a: 'The QR code is generated entirely in your browser, so your password is never sent to any server. Anyone who scans the printed code can join your network, so for visitors consider using a separate guest network.' },
      { q: 'Does a Wi-Fi QR code expire?', a: 'No. It is a static QR code with the network details stored inside it, so it works forever. If you change your Wi-Fi name or password, simply generate and print a new code.' },
      { q: 'Which security type should I choose — WPA, WEP or None?', a: 'Choose WPA for WPA, WPA2 and WPA3 networks, which covers almost all modern routers. Choose WEP only for very old routers, and None for open networks without a password.' },
      { q: 'Can I make a QR code for a hidden Wi-Fi network?', a: 'Yes. Set “Hidden network” to Yes so phones know to look for a network that does not broadcast its name.' },
      { q: 'Where can I find my Wi-Fi name and password?', a: 'They are usually printed on a sticker on your router. On a connected Android phone, go to Settings → Wi-Fi → your network → Share to see the password. On iPhone (iOS 16+), go to Settings → Wi-Fi, tap the ⓘ next to your network and tap Password.' },
    ],
    appDescription:
      'Free Wi-Fi QR code generator. Create a QR code that lets guests join your Wi-Fi network by scanning, on iPhone and Android. Supports WPA/WPA2/WPA3, WEP, open and hidden networks. PNG and SVG download, no sign-up.',
  }),
  qr({
    slug: 'upi-qr-code-generator',
    toolProps: { initialType: 'upi' },
    name: 'UPI QR Code Generator',
    short: 'Payment QR for GPay, PhonePe, Paytm',
    title: 'Free UPI QR Code Generator – Payment QR for GPay, PhonePe, Paytm',
    description:
      'Free UPI QR code generator: create a payment QR code from your UPI ID, with an optional fixed amount. Works with Google Pay, PhonePe, Paytm, BHIM & all UPI apps. No sign-up, no fees, never expires.',
    keywords:
      'upi qr code generator, upi payment qr code generator, payment qr code generator, create upi qr code, upi qr code generator free, qr code for upi payment, upi id to qr code, gpay qr code generator, phonepe qr code generator, paytm qr code generator, bhim upi qr code, upi qr code with amount, shop payment qr code India',
    summary:
      'Turn your UPI ID into a payment QR code in seconds. Customers scan it with Google Pay, PhonePe, Paytm, BHIM or any UPI app and pay straight into your bank account — set a fixed amount if you like. Free, no fees, no sign-up.',
    badges: ['No sign-up', '0% fees', 'All UPI apps', 'Never expires'],
    howToTitle: 'How to create a UPI payment QR code',
    steps: [
      { name: 'Enter your UPI ID', text: 'Type your UPI ID (VPA), for example name@okaxis or 9876543210@ybl. You will find it in your UPI app under your profile.' },
      { name: 'Add your name', text: 'Enter the name customers should see when they pay — your own name or your shop’s name.' },
      { name: 'Set an amount (optional)', text: 'Leave the amount empty so customers type it, or enter a fixed amount and a note such as an order number for exact payments.' },
      { name: 'Download and display', text: 'Download the QR code as PNG or SVG and print it for your counter, add it to invoices or share it on WhatsApp.' },
    ],
    featuresTitle: 'Accept UPI payments with one QR code',
    featuresSub: 'For shops, freelancers, tutors, events, donations and splitting bills.',
    features: [
      { title: 'Works with every UPI app', text: 'Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, Cred and all bank apps can scan and pay.' },
      { title: 'Money goes straight to your bank', text: 'The QR code holds your own UPI ID, so payments go directly to your account. No middleman and no commission.' },
      { title: 'Fixed or open amount', text: 'Ask for an exact amount with a note, or let the payer enter any amount — perfect for counters and donations.' },
      { title: 'Print-ready for your shop', text: 'Download a crisp SVG for counter standees, stickers and posters, or PNG for invoices and WhatsApp.' },
    ],
    faqTitle: 'UPI QR code — frequently asked questions',
    faqs: [
      { q: 'How do I create a UPI QR code for my shop?', a: 'Enter your UPI ID and shop name above, leave the amount empty, then download the QR code and print it for your counter. Customers scan it with any UPI app and enter the amount.' },
      { q: 'Is there any fee or commission?', a: 'No. This tool is free and payments go directly from the customer’s UPI app to your bank account. We never touch the money.' },
      { q: 'Can I make a UPI QR code with a fixed amount?', a: 'Yes. Enter the amount (in ₹) and an optional note. When scanned, the UPI app opens with that amount already filled in.' },
      { q: 'Which apps can scan this QR code?', a: 'Every UPI app — Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, Cred, WhatsApp Pay and bank apps.' },
      { q: 'Where do I find my UPI ID?', a: 'Open your UPI app and tap your profile picture. Your UPI ID looks like name@okhdfcbank, 9876543210@ybl or name@paytm.' },
      { q: 'Is it safe?', a: 'Yes. The QR code only contains your UPI ID, name and optional amount — the same details you share to receive money. It is made in your browser and nothing is stored. A UPI QR code can only receive money, never take it.' },
    ],
    appDescription:
      'Free UPI QR code generator for India. Create a payment QR code from a UPI ID with optional fixed amount and note, scannable by Google Pay, PhonePe, Paytm, BHIM and all UPI apps. PNG and SVG download, no sign-up, no fees.',
  }),
  qr({
    slug: 'whatsapp-qr-code-generator',
    toolProps: { initialType: 'whatsapp' },
    name: 'WhatsApp QR Code Generator',
    short: 'Open a WhatsApp chat in one scan',
    title: 'Free WhatsApp QR Code Generator – Chat QR with Pre-filled Message',
    description:
      'Free WhatsApp QR code generator: create a QR code that opens a WhatsApp chat with your number and a pre-filled message. Great for shops, businesses & visiting cards. No sign-up, never expires.',
    keywords:
      'whatsapp qr code generator, whatsapp qr code, qr code for whatsapp, whatsapp chat qr code, whatsapp business qr code, create whatsapp qr code, whatsapp number qr code, whatsapp link qr code, wa.me qr code, free whatsapp qr code generator',
    summary:
      'Let customers message you on WhatsApp in one scan. Enter your number and an optional message, and the QR code opens a chat with you — no saving your number first. Free, no sign-up, never expires.',
    howToTitle: 'How to create a WhatsApp QR code',
    steps: [
      { name: 'Enter your WhatsApp number', text: 'Type your number with the country code and no + or spaces, for example 919876543210 for India.' },
      { name: 'Add a message (optional)', text: 'Write the message the customer will send, e.g. “Hi, I want to order”. They can edit it before sending.' },
      { name: 'Customise the design', text: 'Pick colours that match your brand and choose the size and error-correction level.' },
      { name: 'Download and share', text: 'Download the QR code as PNG or SVG and add it to your shop, packaging, menu, visiting card or social posts.' },
    ],
    featuresTitle: 'Get more WhatsApp chats from customers',
    featuresSub: 'For shops, restaurants, service providers, creators and anyone who sells on WhatsApp.',
    features: [
      { title: 'No need to save your number', text: 'Scanning opens a chat with you straight away — customers do not have to add you as a contact first.' },
      { title: 'Pre-filled message', text: 'Start every chat with the right context, like “I want to book an appointment” or “Send me the menu”.' },
      { title: 'Works with WhatsApp & WhatsApp Business', text: 'Uses the official wa.me click-to-chat link that works on Android, iPhone and WhatsApp Web.' },
    ],
    faqTitle: 'WhatsApp QR code — frequently asked questions',
    faqs: [
      { q: 'How do I create a QR code for my WhatsApp number?', a: 'Enter your number with country code (e.g. 919876543210) above, add an optional message, then download the QR code. Anyone who scans it can start a chat with you.' },
      { q: 'Does it work with WhatsApp Business?', a: 'Yes. It uses WhatsApp’s official click-to-chat link (wa.me), which works for both WhatsApp and WhatsApp Business numbers.' },
      { q: 'Why should I not include + or 0 in the number?', a: 'WhatsApp’s link format needs the full international number with digits only. Write the country code followed by the number, e.g. 91 then your 10-digit mobile number.' },
      { q: 'Can people edit the pre-filled message?', a: 'Yes. The message appears in the chat box and the customer can change it before tapping send.' },
      { q: 'Does the WhatsApp QR code expire?', a: 'No. It is a static QR code, so it works forever as long as the number is on WhatsApp.' },
    ],
    appDescription:
      'Free WhatsApp QR code generator. Create a QR code that opens a WhatsApp or WhatsApp Business chat with a pre-filled message using the official wa.me link. PNG and SVG download, no sign-up.',
  }),
  qr({
    slug: 'vcard-qr-code-generator',
    toolProps: { initialType: 'vcard' },
    name: 'vCard QR Code Generator',
    short: 'Business card QR that saves your contact',
    title: 'Free vCard QR Code Generator – Business Card QR Code | No Sign-up',
    description:
      'Free vCard QR code generator: create a contact QR code for your visiting card. One scan saves your name, phone, email, company and website to the phone’s contacts. No sign-up, never expires.',
    keywords:
      'vcard qr code generator, business card qr code, contact qr code generator, visiting card qr code, qr code for contact details, digital business card qr code, vcard qr code free, save contact qr code, qr code for phone contact',
    summary:
      'Put a QR code on your visiting card that saves your contact in one scan. Add your name, phone, email, company and website — people scan it and tap “Save contact”. No typing, no typos. Free, no sign-up.',
    howToTitle: 'How to create a contact (vCard) QR code',
    steps: [
      { name: 'Enter your name', text: 'Type your first and last name as you want them to appear in people’s contacts.' },
      { name: 'Add your contact details', text: 'Add your phone number and email, plus your company and website if you like.' },
      { name: 'Customise the design', text: 'Choose colours to match your visiting card. Use error-correction Q or H if the card will be handled a lot.' },
      { name: 'Download and print', text: 'Download as SVG for print-quality visiting cards, or PNG for email signatures and presentations.' },
    ],
    featuresTitle: 'A smarter visiting card',
    featuresSub: 'Networking, conferences, shop counters, email signatures and résumés.',
    features: [
      { title: 'Saves straight to contacts', text: 'Uses the standard vCard 3.0 format that iPhone and Android open as a ready-to-save contact.' },
      { title: 'No typing, no typos', text: 'Your phone number and email are saved exactly right, every time.' },
      { title: 'Name, phone, email, company, website', text: 'Everything a visiting card needs, in a single scan.' },
    ],
    faqTitle: 'vCard QR code — frequently asked questions',
    faqs: [
      { q: 'What is a vCard QR code?', a: 'A vCard QR code holds your contact details in the standard vCard format. When someone scans it, their phone offers to save you as a new contact.' },
      { q: 'How do I add a QR code to my visiting card?', a: 'Fill in your details above, download the QR code as SVG and place it on your card design. Print it at least 2 × 2 cm so it scans easily.' },
      { q: 'Does it work on iPhone and Android?', a: 'Yes. The built-in camera on iPhone and Android (and Google Lens) can read vCard QR codes and save the contact.' },
      { q: 'What if my phone number changes?', a: 'A static QR code cannot be edited, so create a new one with your updated details and reprint your cards.' },
      { q: 'Is my contact information stored anywhere?', a: 'No. The QR code is made in your browser and your details are not uploaded or saved.' },
    ],
    appDescription:
      'Free vCard QR code generator for business and visiting cards. Creates a contact QR code with name, phone, email, company and website that saves to iPhone and Android contacts. PNG and SVG download.',
  }),
  qr({
    slug: 'email-qr-code-generator',
    toolProps: { initialType: 'email' },
    name: 'Email QR Code Generator',
    short: 'Opens an email with subject & message',
    title: 'Free Email QR Code Generator – QR Code for Email Address',
    description:
      'Free email QR code generator: create a QR code that opens a new email with the address, subject and message already filled in. For feedback, support and enquiries. No sign-up, never expires.',
    keywords:
      'email qr code generator, qr code for email, email address qr code, mailto qr code, create email qr code, qr code to send email, free email qr code generator',
    summary:
      'Create a QR code that opens a ready-to-send email. Add the address, subject and message — people scan it and just tap send. Perfect for feedback, support and enquiries. Free, no sign-up.',
    howToTitle: 'How to create an email QR code',
    steps: [
      { name: 'Enter the email address', text: 'Type the address the email should go to, for example support@yourshop.com.' },
      { name: 'Add a subject and message', text: 'Optionally pre-fill the subject and body, such as “Feedback” or “I’d like a quote for…”.' },
      { name: 'Customise the design', text: 'Change the colours, size and error correction to suit where you will print it.' },
      { name: 'Download and share', text: 'Download as PNG or SVG for posters, flyers, product packaging or presentations.' },
    ],
    featuresTitle: 'Make it easy to email you',
    featuresSub: 'Collect feedback, support requests, RSVPs and enquiries with one scan.',
    features: [
      { title: 'Pre-filled subject and message', text: 'Every email arrives with the right subject line, so it is easy to sort and reply to.' },
      { title: 'Opens any mail app', text: 'Uses the standard mailto: format that opens Gmail, Outlook, Apple Mail and other email apps.' },
    ],
    faqTitle: 'Email QR code — frequently asked questions',
    faqs: [
      { q: 'How does an email QR code work?', a: 'It contains a mailto: link. When scanned, the phone opens its email app with the address, subject and message already filled in, ready to send.' },
      { q: 'Does the email send automatically?', a: 'No. The person scanning always sees the email first and chooses whether to send it.' },
      { q: 'Which email apps are supported?', a: 'Any email app set as default on the phone — Gmail, Outlook, Apple Mail, Yahoo Mail and others.' },
      { q: 'Is it free?', a: 'Yes. It is free with no sign-up, no watermark and no expiry.' },
    ],
    appDescription:
      'Free email QR code generator. Create a mailto QR code that opens a new email with address, subject and message pre-filled. PNG and SVG download, no sign-up.',
  }),
  qr({
    slug: 'sms-qr-code-generator',
    toolProps: { initialType: 'sms' },
    name: 'SMS QR Code Generator',
    short: 'Send a ready-written text message',
    title: 'Free SMS QR Code Generator – QR Code to Send a Text Message',
    description:
      'Free SMS QR code generator: create a QR code that opens a text message to your number with the message already written. For opt-ins, bookings and feedback. No sign-up, never expires.',
    keywords:
      'sms qr code generator, qr code for sms, text message qr code, sms qr code, create sms qr code, qr code to send text, free sms qr code generator',
    summary:
      'Create a QR code that opens a ready-written text message to your number. People scan it and tap send — great for bookings, opt-ins, contests and feedback. Free, no sign-up.',
    howToTitle: 'How to create an SMS QR code',
    steps: [
      { name: 'Enter the phone number', text: 'Type the number that should receive the SMS, ideally with the country code (e.g. +91 98765 43210).' },
      { name: 'Write the message', text: 'Add the text that will be pre-filled, such as “BOOK table for 2” or “YES to updates”.' },
      { name: 'Customise the design', text: 'Choose colours, size and error correction.' },
      { name: 'Download and share', text: 'Download as PNG or SVG and add it to posters, packaging or flyers.' },
    ],
    featuresTitle: 'Get text messages in one scan',
    featuresSub: 'Works without internet on the scanner’s side — just a normal SMS.',
    features: [
      { title: 'Ready-written message', text: 'The number and message are filled in automatically; the person only taps send.' },
      { title: 'Works on any phone', text: 'Uses the standard SMSTO format that iPhone and Android cameras understand.' },
    ],
    faqTitle: 'SMS QR code — frequently asked questions',
    faqs: [
      { q: 'How does an SMS QR code work?', a: 'When scanned, the phone opens its Messages app with your number and message already filled in. The person taps send.' },
      { q: 'Is the SMS sent automatically?', a: 'No. The person always sees the message first and decides whether to send it. Normal SMS charges from their mobile plan may apply.' },
      { q: 'Should I include the country code?', a: 'Yes, it is best to include it (e.g. +91 for India) so the message reaches you from any country.' },
      { q: 'Is it free?', a: 'Yes. It is free with no sign-up, no watermark and no expiry.' },
    ],
    appDescription:
      'Free SMS QR code generator. Create a QR code that opens a pre-written text message to a phone number on iPhone and Android. PNG and SVG download, no sign-up.',
  }),

  // ---------- Image resizer ----------
  resizer({
    slug: 'reduce-image-size-in-kb',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/jpeg', targetKB: 100 } },
    name: 'Image Size Reducer (KB)',
    short: 'Compress a photo to any size in KB',
    title: 'Reduce Image Size in KB Online Free – Compress JPG to 20KB, 50KB, 100KB',
    description:
      'Reduce image size in KB online for free. Compress JPG, PNG or any photo to an exact size like 20KB, 50KB, 100KB or 200KB for forms and uploads. No upload, no sign-up, works on phone.',
    keywords:
      'reduce image size in kb, compress image to kb, image size reducer, reduce photo size, compress jpeg, reduce image size online, photo size reducer in kb, image compressor kb, compress photo for form, reduce jpg size, image kb converter',
    summary:
      'Reduce any photo to an exact size in KB — 20KB, 50KB, 100KB or whatever your form asks for. Type the target size and the tool keeps as much quality as possible. Free, no sign-up, nothing uploaded.',
    howToTitle: 'How to reduce image size in KB',
    steps: [
      { name: 'Add your image', text: 'Choose or drag and drop one or more JPG, PNG or WebP images.' },
      { name: 'Type your target size', text: 'Enter the size limit in KB from your form or website, for example 20, 50 or 200. The format is set to JPG for the smallest files.' },
      { name: 'Resize', text: 'Press the Resize button. The tool finds the highest quality that fits, and only reduces the dimensions if it must.' },
      { name: 'Download', text: 'Check the new file size under each image and download it.' },
    ],
    featuresTitle: 'Hit any file-size limit in one go',
    featuresSub: 'For job applications, exam forms, government portals, email attachments and websites.',
    features: [
      { title: 'Exact KB target', text: 'Type any size in KB and the tool automatically gets the image under it — no trial and error.' },
      { title: 'Best quality that fits', text: 'Quality is lowered first; width and height are only reduced when needed, so photos stay as clear as possible.' },
      { title: 'JPG, PNG & WebP input', text: 'Open any common image format and save as JPG or WebP for the smallest size.' },
    ],
    faqTitle: 'Reduce image size in KB — FAQ',
    faqs: [
      { q: 'How do I reduce image size to a specific KB?', a: 'Add your image above, type the size you need in “Target size (KB)”, keep the format as JPG, then press the Resize button and download.' },
      { q: 'Will reducing the KB size lower the quality?', a: 'Some compression is needed to make a file smaller, but the tool keeps the highest quality that fits your limit. Moderate targets (50 KB and up) usually look almost identical.' },
      { q: 'Why can’t I set a target size for PNG?', a: 'PNG is lossless, so its size cannot be tuned with quality. Choose JPG or WebP to use a target size.' },
      { q: 'Can I reduce the size of many photos at once?', a: 'Yes. Add several images and they will all be resized to the same target size.' },
      { q: 'Are my images uploaded?', a: 'No. Everything is processed in your browser. Your photos never leave your device.' },
    ],
    appDescription:
      'Free online image size reducer. Compress JPG, PNG and WebP images to an exact target size in KB in the browser, with bulk support and no upload.',
  }),
  kbPage({
    kb: 20,
    slug: 'resize-image-to-20kb',
    uses: 'signatures and photos in SSC, UPSC, bank and other online exam forms',
    faqs: [
      { q: 'How do I resize my signature to 20KB?', a: 'Scan or photograph your signature on white paper, crop it, then add it above and press the Resize button. The 20 KB target is already set.' },
      { q: 'Which forms need a 20KB photo or signature?', a: 'Many Indian exam and job portals (SSC, banking, railways, state recruitment) ask for photos or signatures between 10 KB and 50 KB. Always check the exact limits and dimensions in your form’s instructions.' },
      { q: 'My form also needs exact pixel dimensions. Can I do both?', a: 'Yes. Switch to the “By pixels” tab, enter the width and height from your form, and keep the 20 KB target size.' },
    ],
  }),
  kbPage({
    kb: 50,
    slug: 'resize-image-to-50kb',
    uses: 'passport photos, exam forms, job applications and government portals',
    faqs: [
      { q: 'Which uploads need a 50KB photo?', a: 'Many exam, scholarship, job and government portals ask for a photo under 50 KB. Check your form for the exact size and dimensions.' },
      { q: 'Can I resize to 50KB and specific dimensions at once?', a: 'Yes. Switch to the “By pixels” tab, enter the width and height your form needs, and keep the 50 KB target size.' },
      { q: 'Will my face still look clear at 50KB?', a: 'Yes, for a typical passport-style photo 50 KB is enough to stay sharp. The tool keeps the highest quality that fits.' },
    ],
  }),
  kbPage({
    kb: 100,
    slug: 'resize-image-to-100kb',
    uses: 'documents, ID proofs, job portals, email and websites',
    faqs: [
      { q: 'Which uploads need an image under 100KB?', a: 'Scanned documents, ID proofs, certificates and profile photos on many job, college and government portals have a 100 KB limit.' },
      { q: 'Can I compress a scanned document to 100KB?', a: 'Yes. Add the scan as a JPG or PNG image and press the Resize button. Text stays readable because the tool keeps the best quality that fits.' },
      { q: 'Can I resize many images to 100KB at once?', a: 'Yes. Add all your images and they are each compressed to under 100 KB.' },
    ],
  }),
  resizer({
    slug: 'passport-size-photo-resizer',
    toolProps: { initial: { mode: 'preset', preset: 'passport', fit: 'cover', format: 'image/jpeg', targetKB: 50 } },
    name: 'Passport Size Photo Resizer',
    short: 'Make a 35×45 mm passport photo',
    title: 'Passport Size Photo Resizer Online Free – 35×45 mm Photo Under 50KB',
    description:
      'Free passport size photo resizer: turn any photo into a 35×45 mm (413×531 px) passport-size photo under 50KB for online forms and visa applications. No upload, no sign-up, works on phone.',
    keywords:
      'passport size photo resizer, passport size photo online, passport photo maker, resize photo to passport size, 35x45 photo, passport size photo 50kb, passport photo for online form, photo resizer for exam form, passport size photo converter',
    summary:
      'Make a passport-size photo from any picture in seconds. The tool crops it to 35×45 mm (413×531 pixels) and compresses it under 50 KB — ready for online forms and applications. Free, nothing uploaded.',
    howToTitle: 'How to resize a photo to passport size',
    steps: [
      { name: 'Add a clear front-facing photo', text: 'Use a well-lit photo of your face against a plain, light background.' },
      { name: 'Keep the passport preset', text: 'The “Passport photo (35×45 mm)” preset is selected, with “Fill and crop edges” so the photo fills the frame without stretching.' },
      { name: 'Check the size limit', text: 'The target size is 50 KB. Change it if your form asks for something different, e.g. 20 KB or 100 KB.' },
      { name: 'Resize and download', text: 'Press the Resize button and download your passport-size photo, ready to upload or print.' },
    ],
    featuresTitle: 'Passport photos ready for any form',
    featuresSub: 'For exam forms, job applications, visa forms, ID cards and admit cards.',
    features: [
      { title: '35×45 mm at 300 DPI', text: 'Outputs 413×531 pixels — the common 35×45 mm passport size at print quality.' },
      { title: 'Under 50 KB by default', text: 'Compressed to fit typical online form limits, with the size adjustable to anything you need.' },
      { title: 'Custom sizes too', text: 'Need 2×2 inch (600×600 px) or another size? Switch to the “By pixels” tab and enter the exact dimensions.' },
    ],
    faqTitle: 'Passport size photo — FAQ',
    faqs: [
      { q: 'What is passport size in pixels?', a: 'A 35×45 mm passport photo at 300 DPI is 413×531 pixels, which is what this preset uses. A 2×2 inch photo is 600×600 pixels at 300 DPI.' },
      { q: 'How do I make a passport photo under 50KB?', a: 'Add your photo above, keep the passport preset and the 50 KB target, press the Resize button and download.' },
      { q: 'Will my photo be stretched?', a: 'No. “Fill and crop edges” keeps your proportions and trims the edges to fit the 35×45 shape. Keep your face centred in the original photo.' },
      { q: 'Does this check government photo rules?', a: 'No. It sets the size and file size only. Follow your form’s rules on background colour, face size and expression, and check its exact dimensions.' },
      { q: 'Is my photo uploaded anywhere?', a: 'No. It is resized in your browser and never leaves your device.' },
    ],
    appDescription:
      'Free passport size photo resizer. Crops and resizes any photo to 35×45 mm (413×531 px) and compresses it under a target KB size for online forms, in the browser with no upload.',
  }),
  resizer({
    slug: 'jpg-to-png-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/png' } },
    name: 'JPG to PNG Converter',
    short: 'Convert JPG photos to PNG',
    title: 'JPG to PNG Converter Online Free – Convert JPEG to PNG, Bulk',
    description:
      'Free JPG to PNG converter: convert JPG/JPEG images to PNG online in bulk, at full resolution. No upload, no sign-up, no watermark — works on phone and computer.',
    keywords: 'jpg to png, jpg to png converter, jpeg to png, convert jpg to png, jpg to png online free, change jpg to png, image to png converter, bulk jpg to png',
    summary:
      'Convert JPG and JPEG images to PNG in seconds, keeping the full resolution. Add one photo or many at once. Free, no sign-up, and nothing is uploaded.',
    howToTitle: 'How to convert JPG to PNG',
    steps: [
      { name: 'Add your JPG images', text: 'Choose or drag and drop one or more JPG/JPEG files.' },
      { name: 'Keep the format as PNG', text: 'The output format is already PNG and the scale is 100%, so the size stays the same.' },
      { name: 'Convert', text: 'Press the Resize button to convert every image to PNG.' },
      { name: 'Download', text: 'Download each PNG file.' },
    ],
    featuresTitle: 'Convert JPG to PNG at full quality',
    featuresSub: 'For editing, design work, documents and websites that need PNG.',
    features: [
      { title: 'Full resolution', text: 'Images keep their original width and height at 100% scale — or resize while converting.' },
      { title: 'Lossless PNG output', text: 'PNG saves without further compression, so no extra quality is lost after conversion.' },
    ],
    faqTitle: 'JPG to PNG — FAQ',
    faqs: [
      { q: 'How do I convert JPG to PNG?', a: 'Add your JPG images above, keep the format as PNG and press the Resize button, then download the PNG files.' },
      { q: 'Will converting to PNG improve quality?', a: 'No. Converting cannot restore detail lost in the JPG, but PNG will not lose any more quality when you edit and save again.' },
      { q: 'Why is the PNG bigger than the JPG?', a: 'PNG is lossless, so photos usually take more space as PNG. Use JPG or WebP if you need a smaller file.' },
      { q: 'Can I convert many JPGs at once?', a: 'Yes. Add several images and they will all be converted to PNG.' },
    ],
    appDescription: 'Free online JPG to PNG converter. Converts JPG/JPEG images to PNG in bulk at full resolution, in the browser with no upload.',
  }),
  resizer({
    slug: 'png-to-jpg-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/jpeg', quality: 0.92 } },
    name: 'PNG to JPG Converter',
    short: 'Convert PNG to smaller JPG files',
    title: 'PNG to JPG Converter Online Free – Convert PNG to JPEG, Bulk',
    description:
      'Free PNG to JPG converter: convert PNG images and screenshots to smaller JPG/JPEG files online in bulk. Choose the quality or a target KB size. No upload, no sign-up.',
    keywords: 'png to jpg, png to jpg converter, png to jpeg, convert png to jpg, png to jpg online free, change png to jpg, screenshot to jpg, bulk png to jpg',
    summary:
      'Convert PNG images and screenshots to JPG to make them much smaller. Pick the quality or a target size in KB, and choose the background colour for transparent areas. Free, nothing uploaded.',
    howToTitle: 'How to convert PNG to JPG',
    steps: [
      { name: 'Add your PNG images', text: 'Choose or drag and drop one or more PNG files.' },
      { name: 'Check quality and background', text: 'The format is JPG at 92% quality. JPG has no transparency, so transparent areas get the background colour (white by default).' },
      { name: 'Convert', text: 'Press the Resize button to convert every image to JPG.' },
      { name: 'Download', text: 'Download each JPG file.' },
    ],
    featuresTitle: 'Smaller files, same look',
    featuresSub: 'For sharing, email, forms and websites that only accept JPG.',
    features: [
      { title: 'Much smaller files', text: 'Photos and screenshots are often 5–10× smaller as JPG than as PNG.' },
      { title: 'Choose the background', text: 'Pick the colour used for transparent areas, so logos and cut-outs look right.' },
      { title: 'Quality or target KB', text: 'Set the JPG quality yourself, or type a target size in KB.' },
    ],
    faqTitle: 'PNG to JPG — FAQ',
    faqs: [
      { q: 'How do I convert PNG to JPG?', a: 'Add your PNG images above, keep the format as JPG and press the Resize button, then download the JPG files.' },
      { q: 'What happens to transparent backgrounds?', a: 'JPG does not support transparency, so transparent areas are filled with the background colour you choose (white by default).' },
      { q: 'Will I lose quality?', a: 'At 90%+ quality the difference is very hard to see, while the file gets much smaller.' },
      { q: 'Can I convert many PNGs at once?', a: 'Yes. Add several images and they will all be converted.' },
    ],
    appDescription: 'Free online PNG to JPG converter. Converts PNG images to JPG/JPEG in bulk with adjustable quality, target KB size and background colour, in the browser with no upload.',
  }),
  resizer({
    slug: 'convert-image-to-webp',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/webp', quality: 0.85 } },
    name: 'WebP Converter',
    short: 'Convert JPG & PNG to WebP',
    title: 'Convert Image to WebP Online Free – JPG & PNG to WebP Converter',
    description:
      'Free WebP converter: convert JPG and PNG images to WebP online in bulk for a faster website. Smaller files, transparency kept, adjustable quality. No upload, no sign-up.',
    keywords: 'convert to webp, jpg to webp, png to webp, webp converter, image to webp, convert image to webp online free, webp converter bulk, compress images for website',
    summary:
      'Convert JPG and PNG images to WebP to make your website load faster. WebP files are much smaller at the same quality and keep transparency. Free, bulk, and nothing is uploaded.',
    howToTitle: 'How to convert images to WebP',
    steps: [
      { name: 'Add your images', text: 'Choose or drag and drop JPG or PNG images — as many as you like.' },
      { name: 'Keep the format as WebP', text: 'The format is WebP at 85% quality, a good balance of size and sharpness for the web.' },
      { name: 'Convert', text: 'Press the Resize button to convert. Resize at the same time if your images are larger than needed.' },
      { name: 'Download', text: 'Download the WebP files and use them on your website.' },
    ],
    featuresTitle: 'Faster websites with WebP',
    featuresSub: 'Better Core Web Vitals and page speed scores.',
    features: [
      { title: 'Much smaller than JPG and PNG', text: 'WebP images are typically 25–35% smaller than JPG at similar quality, and far smaller than PNG.' },
      { title: 'Keeps transparency', text: 'Transparent PNGs stay transparent when converted to WebP.' },
      { title: 'Resize while converting', text: 'Scale down large photos to the size your site actually needs.' },
    ],
    faqTitle: 'WebP converter — FAQ',
    faqs: [
      { q: 'What is WebP?', a: 'WebP is a modern image format by Google that makes images smaller than JPG and PNG at similar quality. It is supported by all modern browsers.' },
      { q: 'How do I convert JPG or PNG to WebP?', a: 'Add your images above, keep the format as WebP and press the Resize button, then download the WebP files.' },
      { q: 'Does WebP keep transparency?', a: 'Yes. Transparent areas in PNG images stay transparent in WebP.' },
      { q: 'Will WebP improve my website speed?', a: 'Yes. Smaller images load faster, which improves page speed and Core Web Vitals like Largest Contentful Paint.' },
    ],
    appDescription: 'Free online WebP converter. Converts JPG and PNG images to WebP in bulk with adjustable quality and transparency preserved, in the browser with no upload.',
  }),
  resizer({
    slug: 'jpg-to-webp-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/webp', quality: 0.85 }, action: 'Convert' },
    name: 'JPG to WebP Converter',
    short: 'Convert JPG photos to WebP',
    title: 'JPG to WebP Converter Online Free – Convert JPEG to WebP, Bulk',
    description:
      'Free JPG to WebP converter: convert JPG/JPEG photos to WebP online in bulk for faster websites. Smaller files at the same quality. No upload, no sign-up, no watermark.',
    keywords: 'jpg to webp, jpg to webp converter, jpeg to webp, convert jpg to webp, jpg to webp online free, bulk jpg to webp, photo to webp, compress jpg for website',
    summary:
      'Convert JPG and JPEG photos to WebP to make them up to a third smaller at the same quality — perfect for websites and online stores. Bulk convert, free, nothing uploaded.',
    howToTitle: 'How to convert JPG to WebP',
    steps: [
      { name: 'Add your JPG photos', text: 'Choose or drag and drop one or more JPG/JPEG files.' },
      { name: 'Keep the format as WebP', text: 'The format is WebP at 85% quality, a good balance of size and sharpness.' },
      { name: 'Convert', text: 'Press the Convert button. Every photo is converted at its full size.' },
      { name: 'Download', text: 'Download each WebP file and upload it to your website.' },
    ],
    featuresTitle: 'Smaller JPGs for a faster website',
    featuresSub: 'Better page speed and Core Web Vitals with modern images.',
    features: [
      { title: '25–35% smaller than JPG', text: 'WebP keeps the same visual quality as JPG in a noticeably smaller file.' },
      { title: 'Adjustable quality', text: 'Turn the quality up for product photos or down for thumbnails, or set a target size in KB.' },
      { title: 'Resize while converting', text: 'Scale large camera photos down to the size your site needs in the same step.' },
    ],
    faqTitle: 'JPG to WebP — FAQ',
    faqs: [
      { q: 'How do I convert JPG to WebP?', a: 'Add your JPG photos above, keep the format as WebP and press the Convert button, then download the WebP files.' },
      { q: 'Is WebP better than JPG?', a: 'For websites, usually yes: WebP files are smaller at the same quality, so pages load faster. JPG is still the most compatible format for sharing and printing.' },
      { q: 'Do all browsers support WebP?', a: 'Yes. Chrome, Edge, Firefox, Safari (14+) and all modern mobile browsers display WebP images.' },
      { q: 'Can I convert many JPGs at once?', a: 'Yes. Add as many photos as you like and they are all converted with the same settings.' },
    ],
    appDescription: 'Free online JPG to WebP converter. Converts JPG/JPEG photos to WebP in bulk with adjustable quality, in the browser with no upload.',
  }),
  resizer({
    slug: 'webp-to-png-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/png' }, action: 'Convert' },
    name: 'WebP to PNG Converter',
    short: 'Convert WebP images to PNG',
    title: 'WebP to PNG Converter Online Free – Convert WebP to PNG, Bulk',
    description:
      'Free WebP to PNG converter: convert WebP images to PNG online in bulk, with transparency kept. Open WebP files in any app. No upload, no sign-up, no watermark.',
    keywords: 'webp to png, webp to png converter, convert webp to png, webp to png online free, webp to png transparent, save webp as png, bulk webp to png, webp file to png',
    summary:
      'Convert WebP images to PNG so they open in every app, editor and older software — with transparency kept and at full resolution. Bulk convert, free, nothing uploaded.',
    howToTitle: 'How to convert WebP to PNG',
    steps: [
      { name: 'Add your WebP images', text: 'Choose or drag and drop one or more .webp files, or paste an image with Ctrl+V.' },
      { name: 'Keep the format as PNG', text: 'The output format is already PNG at 100% scale, so the size stays the same.' },
      { name: 'Convert', text: 'Press the Convert button to turn every WebP image into a PNG.' },
      { name: 'Download', text: 'Download each PNG file.' },
    ],
    featuresTitle: 'Open WebP images anywhere',
    featuresSub: 'For editing apps, documents, presentations and older software that do not read WebP.',
    features: [
      { title: 'Transparency kept', text: 'Transparent WebP images stay transparent as PNG — ideal for logos, stickers and cut-outs.' },
      { title: 'Lossless PNG output', text: 'PNG adds no further compression, so the image looks exactly like the WebP.' },
      { title: 'Full resolution', text: 'Images keep their original width and height, or resize while converting.' },
    ],
    faqTitle: 'WebP to PNG — FAQ',
    faqs: [
      { q: 'How do I convert WebP to PNG?', a: 'Add your WebP images above, keep the format as PNG and press the Convert button, then download the PNG files.' },
      { q: 'Does it keep the transparent background?', a: 'Yes. PNG supports transparency, so transparent areas in your WebP stay transparent.' },
      { q: 'Why can’t I open a WebP file?', a: 'Some older apps and editors do not support WebP. Converting it to PNG (or JPG) lets you open it anywhere.' },
      { q: 'Does it work with animated WebP?', a: 'Animated WebP files are converted using their first frame, as PNG is a still-image format.' },
    ],
    appDescription: 'Free online WebP to PNG converter. Converts WebP images to PNG in bulk with transparency preserved and at full resolution, in the browser with no upload.',
  }),
  resizer({
    slug: 'svg-to-png-converter',
    toolProps: { initial: { mode: 'pixels', width: 1024, height: '', lock: true, format: 'image/png' }, action: 'Convert' },
    name: 'SVG to PNG Converter',
    short: 'Turn SVG vectors into sharp PNGs',
    title: 'SVG to PNG Converter Online Free – Any Size, Transparent, Bulk',
    description:
      'Free SVG to PNG converter: convert SVG logos and icons to sharp PNG images at any size, with a transparent background. Bulk convert, no upload, no sign-up.',
    keywords: 'svg to png, svg to png converter, convert svg to png, svg to png online free, svg to png transparent, svg to png high resolution, svg to image, logo svg to png, icon svg to png',
    summary:
      'Convert SVG logos, icons and illustrations to PNG at exactly the size you need — 64 px icons or 4000 px prints stay perfectly sharp, with a transparent background. Free, nothing uploaded.',
    howToTitle: 'How to convert SVG to PNG',
    steps: [
      { name: 'Add your SVG files', text: 'Choose or drag and drop one or more .svg files.' },
      { name: 'Pick the PNG size', text: 'The width is set to 1024 px and the height follows the SVG’s shape. Type any width — SVGs stay sharp at every size.' },
      { name: 'Convert', text: 'Press the Convert button to render each SVG as a PNG.' },
      { name: 'Download', text: 'Download your PNG files, ready for apps, slides, documents and social media.' },
    ],
    featuresTitle: 'Sharp PNGs from any SVG',
    featuresSub: 'For logos, icons, diagrams and illustrations that need to be a regular image.',
    features: [
      { title: 'Any size, always sharp', text: 'SVG is a vector format, so it is drawn fresh at the size you pick — no blurry upscaling.' },
      { title: 'Transparent background', text: 'Areas outside your design stay transparent in the PNG. Choose JPG instead for a solid background.' },
      { title: 'Works with icon SVGs', text: 'SVGs that only have a viewBox (common for icons) are sized automatically from their shape.' },
    ],
    faqTitle: 'SVG to PNG — FAQ',
    faqs: [
      { q: 'How do I convert SVG to PNG?', a: 'Add your SVG files above, set the width you want in pixels and press the Convert button, then download the PNG files.' },
      { q: 'How do I get a high-resolution PNG from an SVG?', a: 'Type a large width such as 2000 or 4000 px. Because SVG is a vector format, the PNG is drawn sharply at that size.' },
      { q: 'Does the PNG keep a transparent background?', a: 'Yes. Anything not drawn in your SVG stays transparent in the PNG.' },
      { q: 'Why does my SVG look different?', a: 'SVGs that use web fonts or link to external images may not include them when drawn as an image. Convert text to outlines in your design app for an exact result.' },
    ],
    appDescription: 'Free online SVG to PNG converter. Renders SVG logos, icons and illustrations to sharp PNG images at any pixel size with a transparent background, in the browser with no upload.',
  }),
  resizer({
    slug: 'heic-to-jpg-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/jpeg', quality: 0.92 }, action: 'Convert' },
    name: 'HEIC to JPG Converter',
    short: 'Convert iPhone photos to JPG',
    title: 'HEIC to JPG Converter Online Free – iPhone Photos to JPG, Bulk',
    description:
      'Free HEIC to JPG converter: convert iPhone HEIC/HEIF photos to JPG online in bulk, at full quality. Works on Windows, Android and Mac. No upload, no sign-up, no watermark.',
    keywords: 'heic to jpg, heic to jpg converter, convert heic to jpg, heic to jpeg, iphone photo to jpg, heic to jpg online free, heif to jpg, bulk heic to jpg, open heic on windows',
    summary:
      'Convert iPhone HEIC photos to JPG so they open on Windows, Android and every website or form. Convert many photos at once at full quality — free, and your photos never leave your device.',
    howToTitle: 'How to convert HEIC to JPG',
    steps: [
      { name: 'Add your HEIC photos', text: 'Choose or drag and drop .heic or .heif photos from your iPhone — as many as you like.' },
      { name: 'Keep the format as JPG', text: 'The format is JPG at 92% quality and the size stays at 100%. Set a target size in KB if a form needs a smaller file.' },
      { name: 'Convert', text: 'Press the Convert button. The first HEIC photo can take a few seconds while the decoder loads.' },
      { name: 'Download', text: 'Download each JPG and use it anywhere.' },
    ],
    featuresTitle: 'Open iPhone photos anywhere',
    featuresSub: 'For Windows PCs, Android phones, websites and forms that do not accept HEIC.',
    features: [
      { title: 'Full-quality JPG', text: 'Photos keep their full resolution at 92% JPG quality — or reduce them to any size in KB.' },
      { title: 'Private by design', text: 'Personal photos are decoded on your own device. Nothing is uploaded, unlike most HEIC converters.' },
      { title: 'HEIC & HEIF', text: 'Works with photos from iPhone and iPad (iOS 11 and later) and other HEIF cameras.' },
    ],
    faqTitle: 'HEIC to JPG — FAQ',
    faqs: [
      { q: 'How do I convert HEIC to JPG?', a: 'Add your HEIC photos above, keep the format as JPG and press the Convert button, then download the JPG files.' },
      { q: 'What is a HEIC file?', a: 'HEIC is the photo format iPhones use by default since iOS 11. It saves space, but many Windows apps, Android phones and websites cannot open it.' },
      { q: 'Are my photos uploaded?', a: 'No. They are converted in your browser on your own device and never sent anywhere.' },
      { q: 'How do I stop my iPhone saving HEIC?', a: 'On your iPhone, go to Settings → Camera → Formats and choose “Most Compatible”. New photos are then saved as JPG.' },
    ],
    appDescription: 'Free online HEIC to JPG converter. Converts iPhone HEIC/HEIF photos to JPG in bulk at full quality, decoded in the browser with no upload.',
  }),
  resizer({
    slug: 'gif-to-webp-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/webp', quality: 0.85 }, action: 'Convert' },
    name: 'GIF to WebP Converter',
    short: 'Convert GIF images to WebP',
    title: 'GIF to WebP Converter Online Free – Smaller Images, Bulk',
    description:
      'Free GIF to WebP converter: convert GIF images to much smaller WebP files online in bulk, with transparency kept. No upload, no sign-up, no watermark.',
    keywords: 'gif to webp, gif to webp converter, convert gif to webp, gif to webp online free, bulk gif to webp, compress gif, gif to webp transparent',
    summary:
      'Convert GIF images to WebP to make them dramatically smaller for your website, with transparency kept. Bulk convert, free, and nothing is uploaded.',
    howToTitle: 'How to convert GIF to WebP',
    steps: [
      { name: 'Add your GIF images', text: 'Choose or drag and drop one or more .gif files.' },
      { name: 'Keep the format as WebP', text: 'The format is WebP at 85% quality. Raise it for crisp graphics and text.' },
      { name: 'Convert', text: 'Press the Convert button to convert every GIF.' },
      { name: 'Download', text: 'Download the WebP files.' },
    ],
    featuresTitle: 'Lighter images than GIF',
    featuresSub: 'For logos, graphics, banners and still GIFs on websites.',
    features: [
      { title: 'Much smaller files', text: 'WebP uses modern compression with millions of colours, so files are far smaller than 256-colour GIFs.' },
      { title: 'Transparency kept', text: 'Transparent GIFs stay transparent as WebP.' },
      { title: 'Still images', text: 'Animated GIFs are converted to a still WebP of the first frame.' },
    ],
    faqTitle: 'GIF to WebP — FAQ',
    faqs: [
      { q: 'How do I convert GIF to WebP?', a: 'Add your GIF files above, keep the format as WebP and press the Convert button, then download the WebP files.' },
      { q: 'Does it keep the animation?', a: 'No — this converter makes a still WebP image from the first frame of an animated GIF. It is ideal for logos, icons and still GIFs.' },
      { q: 'Does it keep transparency?', a: 'Yes. Transparent parts of the GIF stay transparent in the WebP.' },
      { q: 'Why convert GIF to WebP?', a: 'WebP files are much smaller and support full colour, so your pages load faster and graphics look smoother.' },
    ],
    appDescription: 'Free online GIF to WebP converter. Converts GIF images to smaller WebP files in bulk with transparency preserved, in the browser with no upload.',
  }),
  resizer({
    slug: 'bmp-to-jpg-converter',
    toolProps: { initial: { mode: 'percent', percent: 100, format: 'image/jpeg', quality: 0.92 }, action: 'Convert' },
    name: 'BMP to JPG Converter',
    short: 'Convert large BMP files to JPG',
    title: 'BMP to JPG Converter Online Free – Convert Bitmap to JPEG, Bulk',
    description:
      'Free BMP to JPG converter: convert large BMP bitmap images to small JPG files online in bulk. Choose quality or a target KB size. No upload, no sign-up, no watermark.',
    keywords: 'bmp to jpg, bmp to jpg converter, bmp to jpeg, convert bmp to jpg, bitmap to jpg, bmp to jpg online free, bulk bmp to jpg, reduce bmp size',
    summary:
      'Convert BMP bitmap images to JPG to make them up to 10× smaller and accepted everywhere — email, websites and forms. Bulk convert, free, nothing uploaded.',
    howToTitle: 'How to convert BMP to JPG',
    steps: [
      { name: 'Add your BMP images', text: 'Choose or drag and drop one or more .bmp files.' },
      { name: 'Keep the format as JPG', text: 'The format is JPG at 92% quality at full size. Set a target size in KB if you need a smaller file.' },
      { name: 'Convert', text: 'Press the Convert button to convert every BMP.' },
      { name: 'Download', text: 'Download the JPG files.' },
    ],
    featuresTitle: 'Tiny JPGs from huge bitmaps',
    featuresSub: 'For scans, screenshots and old Windows images saved as BMP.',
    features: [
      { title: 'Up to 10× smaller', text: 'BMP stores every pixel uncompressed. JPG compresses it into a fraction of the size with no visible difference.' },
      { title: 'Quality or target KB', text: 'Keep high quality, or reduce the file to a size limit like 100 KB for online forms.' },
      { title: 'Accepted everywhere', text: 'JPG works in every app, browser, email and upload form — unlike BMP.' },
    ],
    faqTitle: 'BMP to JPG — FAQ',
    faqs: [
      { q: 'How do I convert BMP to JPG?', a: 'Add your BMP images above, keep the format as JPG and press the Convert button, then download the JPG files.' },
      { q: 'Why are BMP files so big?', a: 'BMP saves every pixel without compression. A JPG of the same picture is usually 5–10 times smaller.' },
      { q: 'Will I lose quality?', a: 'At 90%+ JPG quality the difference is very hard to see. Choose PNG instead if you need a lossless copy.' },
      { q: 'Can I convert many BMP files at once?', a: 'Yes. Add as many as you like and they are all converted together.' },
    ],
    appDescription: 'Free online BMP to JPG converter. Converts BMP bitmap images to JPG/JPEG in bulk with adjustable quality and target KB size, in the browser with no upload.',
  }),
  resizer({
    slug: 'bulk-image-resizer',
    toolProps: { initial: { mode: 'pixels', width: 1080, lock: true } },
    name: 'Bulk Image Resizer',
    short: 'Resize many photos at once',
    title: 'Bulk Image Resizer Online Free – Resize Multiple Images at Once',
    description:
      'Free bulk image resizer: resize multiple images at once by width, percentage or preset, compress to a target KB and convert to JPG, PNG or WebP. No upload, no sign-up, no limits.',
    keywords: 'bulk image resizer, batch image resizer, resize multiple images, resize multiple photos at once, bulk photo resizer, batch resize images online, bulk image compressor, resize images in bulk free',
    summary:
      'Resize dozens of images in one go. Set a width, percentage or preset once, and every photo is resized with the same settings — then compress or convert them too. Free, no limits, nothing uploaded.',
    howToTitle: 'How to resize multiple images at once',
    steps: [
      { name: 'Add all your images', text: 'Select many images at once or drag in a whole batch of JPG, PNG or WebP files.' },
      { name: 'Choose one setting for all', text: 'Set a width (height follows automatically), a percentage, or a preset like Instagram post.' },
      { name: 'Pick format and size', text: 'Optionally convert to JPG, PNG or WebP and set a target size in KB.' },
      { name: 'Resize and download', text: 'Press the Resize button and download each resized image.' },
    ],
    featuresTitle: 'Resize a whole batch in seconds',
    featuresSub: 'For product photos, blog images, real-estate listings, events and albums.',
    features: [
      { title: 'One setting for every image', text: 'Each photo keeps its own proportions when you set a width — no squashed images.' },
      { title: 'No file limits', text: 'Because everything runs on your device, there is no upload cap or daily limit.' },
      { title: 'Resize, compress and convert together', text: 'Change the size, format and file size in a single pass.' },
    ],
    faqTitle: 'Bulk image resizer — FAQ',
    faqs: [
      { q: 'How many images can I resize at once?', a: 'There is no fixed limit. Very large batches depend on your device’s memory, so for hundreds of big photos work in groups.' },
      { q: 'Will each image keep its proportions?', a: 'Yes, with “Keep aspect ratio” on, only the width is fixed and each image’s height is calculated from its own shape.' },
      { q: 'Can I compress all images to a target KB?', a: 'Yes. Set a target size in KB and every image is compressed to fit.' },
      { q: 'Are my images uploaded?', a: 'No. All resizing happens in your browser.' },
    ],
    appDescription: 'Free online bulk image resizer. Resize, compress and convert multiple JPG, PNG and WebP images at once by width, percentage or preset, in the browser with no upload.',
  }),
  resizer({
    slug: 'resize-image-for-instagram',
    toolProps: { initial: { mode: 'preset', preset: 'ig-post', fit: 'contain', format: 'image/jpeg' } },
    name: 'Instagram Photo Resizer',
    short: 'Fit photos for posts & stories',
    title: 'Resize Image for Instagram Free – Post 1080×1080 & Story 1080×1920',
    description:
      'Free Instagram photo resizer: resize photos for Instagram posts (1080×1080) and stories/reels (1080×1920) without cropping — add a white or coloured background. No upload, no sign-up.',
    keywords: 'resize image for instagram, instagram photo resizer, instagram post size, instagram story size, fit photo for instagram without cropping, 1080x1080 resize, 1080x1920 resize, no crop instagram, whatsapp story size',
    summary:
      'Post full photos on Instagram without awkward cropping. Resize to a 1080×1080 post or 1080×1920 story/reel, with a white or coloured border to fill the space — or crop to fill. Free, nothing uploaded.',
    howToTitle: 'How to resize a photo for Instagram',
    steps: [
      { name: 'Add your photos', text: 'Choose or drag in one or more photos.' },
      { name: 'Pick post or story', text: 'Choose “Instagram post” (1080×1080) or “Instagram / WhatsApp story” (1080×1920) from the presets.' },
      { name: 'Fit or fill', text: '“Fit whole image” keeps the whole photo and adds a border in your background colour; “Fill and crop edges” fills the frame.' },
      { name: 'Resize and download', text: 'Press the Resize button, download and upload to Instagram.' },
    ],
    featuresTitle: 'Perfect sizes for Instagram and more',
    featuresSub: 'Also includes YouTube thumbnail, Facebook cover, LinkedIn banner and profile picture sizes.',
    features: [
      { title: 'No-crop posting', text: 'Fit the entire photo into a square or story frame with a background colour of your choice.' },
      { title: 'All social sizes', text: 'Instagram post and story, WhatsApp status and DP, YouTube thumbnail, Facebook cover and LinkedIn banner presets.' },
    ],
    faqTitle: 'Instagram photo resizer — FAQ',
    faqs: [
      { q: 'What size is an Instagram post?', a: 'A square post is 1080×1080 pixels. Stories and reels are 1080×1920 pixels (9:16).' },
      { q: 'How do I post a full photo on Instagram without cropping?', a: 'Choose the Instagram post preset with “Fit whole image (add background)”, pick a background colour and press the Resize button. Your whole photo fits in the square with a border.' },
      { q: 'Can I use it for WhatsApp status too?', a: 'Yes. The 1080×1920 story preset works for WhatsApp status, Instagram stories and reels.' },
      { q: 'Are my photos uploaded?', a: 'No. Everything is processed in your browser.' },
    ],
    appDescription: 'Free Instagram photo resizer. Resize photos to Instagram post (1080×1080) and story (1080×1920) sizes with fit-with-background or crop-to-fill, plus other social media presets, in the browser.',
  }),
]

export const landingUrl = (p) => `${SITE}/${p.slug}/`
export const qrLandings = landings.filter((p) => p.tool === 'qr')
export const resizerLandings = landings.filter((p) => p.tool === 'resizer')

// Links to every tool page, for the "More free tools" section (internal links help each page rank).
const hubs = [
  { href: '/qr-code-generator/', icon: 'qr', name: 'QR Code Generator', text: 'Every QR code type in one place' },
  { href: '/image-resizer/', icon: 'image', name: 'Image Resizer', text: 'Resize by pixels, % or preset' },
  { href: '/image-to-pdf/', icon: 'file', name: 'Image to PDF', text: 'Combine photos into one PDF' },
  { href: '/pdf-to-image/', icon: 'image', name: 'PDF to Image', text: 'Save PDF pages as JPG or PNG' },
  { href: '/word-to-pdf/', icon: 'file', name: 'Word to PDF', text: 'Convert DOCX files to PDF' },
  { href: '/pdf-to-word/', icon: 'file', name: 'PDF to Word', text: 'Turn a PDF into editable DOCX' },
  { href: '/image-to-base64/', icon: 'code', name: 'Image to Base64', text: 'Image to data URI, HTML or CSS' },
  { href: '/base64-to-image/', icon: 'code', name: 'Base64 to Image', text: 'Decode Base64 and download' },
]

export function moreTools(currentPath) {
  const links = [
    ...hubs,
    ...landings.map((p) => ({ href: `/${p.slug}/`, icon: p.tool === 'qr' ? 'qr' : 'image', name: p.name, text: p.short })),
  ]
  return { title: 'More free QR code & image tools', links: links.filter((l) => l.href !== currentPath) }
}
