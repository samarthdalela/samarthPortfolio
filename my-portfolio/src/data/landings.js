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

const fileShared = [
  { title: 'Private — nothing is uploaded', text: 'Your file is converted on your own device and never sent to a server. Safe for personal and business documents.' },
  { title: 'Free, no sign-up, no watermark', text: 'Convert as many files as you like. No account, no limits, no logo added.' },
  { title: 'Works on phone and computer', text: 'Use it in Chrome, Safari, Edge or Firefox on Android, iPhone, Windows or Mac — no software to install.' },
]

// Document and file converters (src/convert/), shown on the shared FileConverter screen.
const file = (page) => ({
  tool: 'file',
  category: 'UtilitiesApplication',
  badges: ['No sign-up', 'No watermark', 'Nothing uploaded', 'Works on mobile'],
  price: '₹1500 lifetime',
  ...page,
  features: [...page.features, ...fileShared],
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
  file({
    slug: 'pdf-to-excel',
    toolProps: { converter: 'pdf-to-excel' },
    name: 'PDF to Excel Converter',
    short: 'Extract PDF tables into Excel',
    title: 'PDF to Excel Converter Online Free – Convert PDF Tables to XLSX',
    description:
      'Free PDF to Excel converter: extract tables from PDF bank statements, invoices and reports into an editable Excel (XLSX) file with real numbers. No upload, no sign-up.',
    keywords: 'pdf to excel, pdf to excel converter, pdf to xlsx, convert pdf to excel, bank statement pdf to excel, pdf table to excel, pdf to excel free, pdf to excel online, extract table from pdf',
    summary:
      'Turn tables in a PDF — bank statements, invoices, price lists and reports — into an Excel sheet you can sort, filter and total. Numbers become real numbers. Free, and the PDF never leaves your device.',
    howToTitle: 'How to convert PDF to Excel',
    steps: [
      { name: 'Add your PDF', text: 'Drag and drop the PDF or click to browse. Enter the password if it is protected.' },
      { name: 'Choose the layout', text: 'Put all pages in one sheet (best for long statements) or give each page its own sheet.' },
      { name: 'Convert', text: 'Rows and columns are rebuilt from the position of the text on each page.' },
      { name: 'Download the XLSX', text: 'Open it in Excel, Google Sheets or LibreOffice and check the columns.' },
    ],
    featuresTitle: 'Get your PDF data into a spreadsheet',
    featuresSub: 'Stop retyping numbers from PDFs.',
    features: [
      { title: 'Columns detected automatically', text: 'Text is grouped into rows and columns from where it sits on the page.' },
      { title: 'Real numbers', text: 'Amounts like 1,23,456.00, (45.00) and 12% become numbers you can add up — IDs with leading zeros stay as text.' },
      { title: 'Bank statements & invoices', text: 'Works with PDFs that have selectable text, like statements downloaded from net banking.' },
    ],
    faqTitle: 'PDF to Excel — FAQ',
    faqs: [
      { q: 'How do I convert a PDF to Excel?', a: 'Add your PDF above, keep “All pages in one sheet” and press Convert to Excel, then download the XLSX file.' },
      { q: 'Can I convert a bank statement PDF to Excel?', a: 'Yes. Statements downloaded from net banking have selectable text, so their tables convert well. Enter the PDF password if your bank protects the file.' },
      { q: 'Does it work with scanned PDFs?', a: 'No. Scanned pages are pictures of text, and text recognition (OCR) is not supported. The PDF needs selectable text.' },
      { q: 'Why are some columns merged or split?', a: 'Columns are worked out from the spacing of the text. Very tightly spaced or unusual layouts may need a quick tidy-up in Excel.' },
    ],
    appDescription: 'Free online PDF to Excel converter. Extracts tables from PDFs with selectable text into XLSX with numbers detected, in the browser with no upload.',
  }),
  file({
    slug: 'excel-to-pdf',
    toolProps: { converter: 'excel-to-pdf' },
    name: 'Excel to PDF Converter',
    short: 'Turn spreadsheets into PDFs',
    title: 'Excel to PDF Converter Online Free – XLSX, XLS & ODS to PDF',
    description:
      'Free Excel to PDF converter: convert XLSX, XLS, ODS and CSV spreadsheets to PDF with every sheet, gridlines and fit-to-width pages. No Excel needed, no upload, no sign-up.',
    keywords: 'excel to pdf, excel to pdf converter, xlsx to pdf, xls to pdf, convert excel to pdf, spreadsheet to pdf, excel to pdf free, excel to pdf online, ods to pdf, csv to pdf',
    summary:
      'Convert Excel spreadsheets to neat PDF pages — every sheet, with gridlines, header rows repeated on each page and wide sheets shrunk to fit. No Excel needed, and nothing is uploaded.',
    howToTitle: 'How to convert Excel to PDF',
    steps: [
      { name: 'Add your spreadsheet', text: 'Drag and drop an XLSX, XLS, ODS or CSV file, or click to browse.' },
      { name: 'Pick sheets and layout', text: 'Convert all sheets or just the first. Orientation switches to landscape automatically for wide sheets.' },
      { name: 'Convert', text: 'Each sheet is laid out on pages, splitting long tables between rows.' },
      { name: 'Download the PDF', text: 'Share or print it — it looks the same on every device.' },
    ],
    featuresTitle: 'Print-ready PDFs from spreadsheets',
    featuresSub: 'For invoices, price lists, timetables, reports and data to share.',
    features: [
      { title: 'Fits the page width', text: 'Wide sheets are scaled down to fit, so no columns are cut off.' },
      { title: 'Header row on every page', text: 'Long tables split between rows and repeat the first row at the top of each page.' },
      { title: 'All sheets, one PDF', text: 'Every sheet starts on a new page with its name as a heading.' },
    ],
    faqTitle: 'Excel to PDF — FAQ',
    faqs: [
      { q: 'How do I convert Excel to PDF?', a: 'Add your spreadsheet above. It converts automatically — then click Download PDF.' },
      { q: 'Do I need Microsoft Excel?', a: 'No. The spreadsheet is read in your browser, so you can convert on any phone or computer.' },
      { q: 'Are formulas and charts included?', a: 'Formula results are shown as values. Charts, images and cell colours are not included — the PDF shows the data and gridlines.' },
      { q: 'Can I select text in the PDF?', a: 'The downloaded PDF stores pages as high-quality images. For selectable text, use “Print → Save as PDF” after converting.' },
    ],
    appDescription: 'Free online Excel to PDF converter. Converts XLSX, XLS, ODS and CSV sheets to PDF with gridlines, repeated header rows and fit-to-width scaling, in the browser with no upload.',
  }),
  file({
    slug: 'pdf-to-powerpoint',
    toolProps: { converter: 'pdf-to-powerpoint' },
    name: 'PDF to PowerPoint Converter',
    short: 'Turn PDF pages into PPTX slides',
    title: 'PDF to PowerPoint Converter Online Free – PDF to Editable PPTX',
    description:
      'Free PDF to PowerPoint converter: turn every PDF page into a PPTX slide with editable text on the original background, or as exact pictures. No upload, no sign-up.',
    keywords: 'pdf to ppt, pdf to powerpoint, pdf to pptx, convert pdf to ppt, pdf to powerpoint converter, pdf to ppt free, pdf to editable ppt, pdf to slides, pdf to ppt online',
    summary:
      'Convert a PDF into a PowerPoint presentation — one slide per page, with the text as editable text boxes placed over the original design. Free, no sign-up, and the PDF never leaves your device.',
    howToTitle: 'How to convert PDF to PowerPoint',
    steps: [
      { name: 'Add your PDF', text: 'Drag and drop the PDF or click to browse.' },
      { name: 'Choose editable or exact', text: '“Editable text” lets you change the words; “Exact look” keeps each page as a picture.' },
      { name: 'Convert', text: 'Every page becomes a slide the same shape as the page.' },
      { name: 'Download the PPTX', text: 'Open it in PowerPoint, Google Slides or Keynote and present or edit.' },
    ],
    featuresTitle: 'Present any PDF as slides',
    featuresSub: 'For lecture notes, reports, brochures and exported presentations.',
    features: [
      { title: 'Editable text', text: 'Text becomes real text boxes in the original font, size, style and colour, on top of the page background.' },
      { title: 'Keeps the design', text: 'Backgrounds, images and shapes stay in place as the slide background.' },
      { title: 'Slide size matches the page', text: 'A4 pages, 16:9 exports and other sizes keep their shape.' },
    ],
    faqTitle: 'PDF to PowerPoint — FAQ',
    faqs: [
      { q: 'How do I convert a PDF to PowerPoint?', a: 'Add your PDF above, keep “Editable text” and press Convert to PowerPoint, then download the PPTX file.' },
      { q: 'Can I edit the text in the slides?', a: 'Yes, in “Editable text” mode each line of text is a text box you can change. Pictures and shapes stay as the slide background.' },
      { q: 'Does it work with Google Slides?', a: 'Yes. Upload the PPTX to Google Drive and open it with Google Slides.' },
      { q: 'What about scanned PDFs?', a: 'Scanned pages have no real text, so they are added as pictures. Text recognition (OCR) is not supported.' },
    ],
    appDescription: 'Free online PDF to PowerPoint converter. Turns PDF pages into PPTX slides with editable text over the original background, or as exact pictures, in the browser with no upload.',
  }),
  file({
    slug: 'powerpoint-to-pdf',
    toolProps: { converter: 'powerpoint-to-pdf' },
    name: 'PowerPoint to PDF Converter',
    short: 'Save PPTX slides as a PDF',
    title: 'PowerPoint to PDF Converter Online Free – PPTX to PDF',
    description:
      'Free PowerPoint to PDF converter: convert PPTX presentations to PDF, one slide per page, without PowerPoint. No upload, no sign-up, no watermark.',
    keywords: 'ppt to pdf, powerpoint to pdf, pptx to pdf, convert ppt to pdf, powerpoint to pdf converter, ppt to pdf free, ppt to pdf online, slides to pdf, presentation to pdf',
    summary:
      'Convert PowerPoint presentations to PDF so anyone can open them — one slide per page, at the slide’s own size. No PowerPoint needed, and your file is never uploaded.',
    howToTitle: 'How to convert PowerPoint to PDF',
    steps: [
      { name: 'Add your presentation', text: 'Drag and drop a .pptx file or click to browse.' },
      { name: 'Pick the quality', text: 'Balanced suits sharing; print quality gives sharper slides for printing.' },
      { name: 'Convert', text: 'Each slide is drawn and saved as a PDF page.' },
      { name: 'Download the PDF', text: 'Email, share or print your slides as a PDF.' },
    ],
    featuresTitle: 'Share slides as a PDF',
    featuresSub: 'For handouts, assignments, submissions and email attachments.',
    features: [
      { title: 'One slide per page', text: 'Pages keep the slide shape — 16:9, 4:3 or custom.' },
      { title: 'No PowerPoint needed', text: 'Works on any phone or computer in a modern browser.' },
      { title: 'Text, shapes and images', text: 'Slide text, pictures, shapes, tables and backgrounds are included.' },
    ],
    faqTitle: 'PowerPoint to PDF — FAQ',
    faqs: [
      { q: 'How do I convert PowerPoint to PDF?', a: 'Add your .pptx file above. It converts automatically — then click Download PDF.' },
      { q: 'Does it work with .ppt files?', a: 'Only the modern .pptx format is supported. Open an old .ppt file in PowerPoint or Google Slides and save it as .pptx first.' },
      { q: 'Are animations and videos kept?', a: 'No. A PDF shows each slide as it looks when fully built; animations, transitions and videos are not included.' },
      { q: 'Why does a slide look slightly different?', a: 'Fonts not installed on your device are replaced with similar ones, and some advanced effects (3D, SmartArt, special charts) may look simpler.' },
    ],
    appDescription: 'Free online PowerPoint to PDF converter. Converts PPTX presentations to PDF with one slide per page at the slide size, in the browser with no upload.',
  }),
  file({
    slug: 'word-to-html',
    toolProps: { converter: 'word-to-html' },
    name: 'Word to HTML Converter',
    short: 'Clean HTML from DOCX files',
    title: 'Word to HTML Converter Online Free – DOCX to Clean HTML',
    description:
      'Free Word to HTML converter: convert DOCX documents to clean, semantic HTML with headings, lists, tables, links and images. Copy the code or download an HTML file. No upload.',
    keywords: 'word to html, docx to html, word to html converter, convert word to html, word to html clean, doc to html, word to html online, word document to web page, docx to html free',
    summary:
      'Turn a Word document into clean HTML for your website, blog or CMS — real headings, lists, tables, links and images, without Word’s messy styling. Copy the code or download a web page.',
    howToTitle: 'How to convert Word to HTML',
    steps: [
      { name: 'Add your Word file', text: 'Drag and drop a .docx document or click to browse.' },
      { name: 'Choose the output', text: 'A full web page with simple styling, or just the HTML to paste into a CMS.' },
      { name: 'Check the preview', text: 'See the page rendered next to the code.' },
      { name: 'Copy or download', text: 'Copy the HTML in one click or download it as an .html file.' },
    ],
    featuresTitle: 'Clean HTML, not Word soup',
    featuresSub: 'For blogs, WordPress, website content, emails and documentation.',
    features: [
      { title: 'Semantic markup', text: 'Word headings become h1–h6, lists become ul/ol, and tables stay tables.' },
      { title: 'Images included', text: 'Pictures are embedded in the HTML, or left out if you prefer to upload them separately.' },
      { title: 'Live preview', text: 'See exactly how the HTML looks before you copy it.' },
    ],
    faqTitle: 'Word to HTML — FAQ',
    faqs: [
      { q: 'How do I convert Word to HTML?', a: 'Add your .docx file above. The HTML appears instantly — copy it or download the .html file.' },
      { q: 'Is the HTML clean?', a: 'Yes. It uses simple semantic tags (headings, paragraphs, lists, tables, links, bold and italic) without Word’s inline styles, so it fits into any website design.' },
      { q: 'Can I paste it into WordPress?', a: 'Yes. Choose “HTML fragment only”, copy the code and paste it into the code/HTML editor of WordPress or your CMS.' },
      { q: 'Are fonts and colours kept?', a: 'No — on purpose. Clean HTML keeps the structure and lets your website’s own styles decide the look.' },
    ],
    appDescription: 'Free online Word to HTML converter. Converts DOCX documents to clean semantic HTML with headings, lists, tables, links and embedded images, with live preview, in the browser with no upload.',
  }),
  file({
    slug: 'excel-to-csv',
    toolProps: { converter: 'excel-to-csv' },
    name: 'Excel to CSV Converter',
    short: 'Export every sheet as CSV',
    title: 'Excel to CSV Converter Online Free – XLSX & XLS to CSV',
    description:
      'Free Excel to CSV converter: convert XLSX, XLS and ODS sheets to CSV with comma, semicolon or tab separators and Excel-friendly UTF-8. One CSV per sheet. No upload.',
    keywords: 'excel to csv, xlsx to csv, xls to csv, convert excel to csv, excel to csv converter, excel to csv utf-8, ods to csv, excel to tsv, spreadsheet to csv',
    summary:
      'Convert Excel workbooks to CSV — every sheet becomes its own file, with the separator and encoding you need for imports, databases and other apps. Free, and nothing is uploaded.',
    howToTitle: 'How to convert Excel to CSV',
    steps: [
      { name: 'Add your workbook', text: 'Drag and drop an XLSX, XLS or ODS file, or click to browse.' },
      { name: 'Pick the separator', text: 'Comma for most apps, semicolon for European Excel, or tab for TSV.' },
      { name: 'Check the preview', text: 'See the first rows of your data before downloading.' },
      { name: 'Download', text: 'Download one sheet or all of them as CSV files.' },
    ],
    featuresTitle: 'CSV files that import cleanly',
    featuresSub: 'For CRMs, e-commerce stores, databases, mail merges and code.',
    features: [
      { title: 'Every sheet', text: 'Each sheet in the workbook becomes a separate CSV file.' },
      { title: 'UTF-8 that Excel reads', text: 'Accents, ₹ and non-English text open correctly, thanks to the optional BOM.' },
      { title: 'Shown or raw values', text: 'Keep numbers and dates as formatted in Excel, or export the raw values.' },
    ],
    faqTitle: 'Excel to CSV — FAQ',
    faqs: [
      { q: 'How do I convert Excel to CSV?', a: 'Add your workbook above. It converts instantly — download each sheet as a CSV.' },
      { q: 'Why do accented letters look wrong in my CSV?', a: 'Choose “UTF-8 for Excel (with BOM)”. The BOM tells Excel the file is UTF-8 so special characters show correctly.' },
      { q: 'Should I use comma or semicolon?', a: 'Use comma for most apps and websites. Use semicolon if your Excel uses a comma as the decimal separator (common in Europe).' },
      { q: 'Are formulas kept?', a: 'CSV stores values only, so formulas are exported as their results.' },
    ],
    appDescription: 'Free online Excel to CSV converter. Exports each sheet of XLSX, XLS or ODS workbooks to CSV or TSV with a choice of separator and UTF-8 encoding, in the browser with no upload.',
  }),
  file({
    slug: 'csv-to-excel',
    toolProps: { converter: 'csv-to-excel' },
    name: 'CSV to Excel Converter',
    short: 'Turn CSV files into XLSX',
    title: 'CSV to Excel Converter Online Free – CSV to XLSX, Multiple Files',
    description:
      'Free CSV to Excel converter: convert CSV files to XLSX, XLS or ODS with numbers and dates detected and column widths set. Combine several CSVs into one workbook. No upload.',
    keywords: 'csv to excel, csv to xlsx, convert csv to excel, csv to excel converter, csv to xls, combine csv files into excel, csv to excel online, csv to excel free, tsv to excel',
    summary:
      'Convert CSV files into proper Excel workbooks — numbers and dates detected, columns sized, and several CSVs combined into one file with a sheet each. Free, and nothing is uploaded.',
    howToTitle: 'How to convert CSV to Excel',
    steps: [
      { name: 'Add CSV files', text: 'Drag and drop one or more CSV files, or paste CSV text.' },
      { name: 'Check the separator', text: 'The separator is detected automatically — comma, semicolon, tab or pipe.' },
      { name: 'Choose the format', text: 'Save as XLSX, the older XLS, or OpenDocument ODS.' },
      { name: 'Download', text: 'Open the workbook in Excel, Google Sheets or LibreOffice.' },
    ],
    featuresTitle: 'From raw CSV to a ready spreadsheet',
    featuresSub: 'For exports from banks, stores, CRMs, forms and databases.',
    features: [
      { title: 'Several CSVs, one workbook', text: 'Each CSV becomes its own sheet named after the file.' },
      { title: 'Numbers and dates detected', text: 'Values become real numbers and dates — or keep everything as text to protect IDs and phone numbers.' },
      { title: 'Readable columns', text: 'Column widths are set from your data, so nothing is hidden.' },
    ],
    faqTitle: 'CSV to Excel — FAQ',
    faqs: [
      { q: 'How do I convert CSV to Excel?', a: 'Add your CSV file above. It converts instantly — click Download Excel file.' },
      { q: 'Can I combine multiple CSV files into one Excel file?', a: 'Yes. Add several CSV files at once and each becomes a separate sheet in one workbook.' },
      { q: 'Why did my phone numbers lose their leading zero?', a: 'Choose “Keep everything as text” under Values. Then IDs, phone numbers and PIN codes stay exactly as written.' },
      { q: 'Does it handle semicolon-separated files?', a: 'Yes. The separator is detected automatically, or you can pick comma, semicolon, tab or pipe yourself.' },
    ],
    appDescription: 'Free online CSV to Excel converter. Converts one or more CSV/TSV files to XLSX, XLS or ODS with automatic separator, number and date detection, in the browser with no upload.',
  }),
  file({
    slug: 'odt-to-docx',
    toolProps: { converter: 'odt-to-docx' },
    name: 'ODT to DOCX Converter',
    short: 'Open LibreOffice files in Word',
    title: 'ODT to DOCX Converter Online Free – OpenDocument to Word',
    description:
      'Free ODT to DOCX converter: convert LibreOffice and OpenOffice documents to Word with headings, formatting, lists, tables and images kept. No upload, no sign-up.',
    keywords: 'odt to docx, odt to word, convert odt to docx, odt to docx converter, libreoffice to word, openoffice to word, opendocument to docx, odt to doc, odt file to word',
    summary:
      'Convert OpenDocument Text (.odt) files from LibreOffice, OpenOffice or Google Docs into Word documents — with headings, fonts, bold and italic, lists, tables, images and page setup. Free, nothing uploaded.',
    howToTitle: 'How to convert ODT to DOCX',
    steps: [
      { name: 'Add your ODT file', text: 'Drag and drop an .odt document or click to browse.' },
      { name: 'Convert', text: 'Paragraphs, headings, formatting, lists, tables and images are rebuilt as Word content.' },
      { name: 'Download the DOCX', text: 'Save the Word file to your device.' },
      { name: 'Open in Word', text: 'Edit it in Microsoft Word, Google Docs, WPS or Pages.' },
    ],
    featuresTitle: 'Share LibreOffice documents with Word users',
    featuresSub: 'For assignments, office documents and forms that must be submitted as .docx.',
    features: [
      { title: 'Real Word headings', text: 'ODT headings become Word Heading 1–6, so the navigation pane and table of contents work.' },
      { title: 'Lists and tables', text: 'Bulleted and numbered lists, tables with merged cells and header rows are carried over.' },
      { title: 'Page setup kept', text: 'Paper size and margins match the original document.' },
    ],
    faqTitle: 'ODT to DOCX — FAQ',
    faqs: [
      { q: 'How do I convert ODT to DOCX?', a: 'Add your .odt file above. It converts automatically — then click Download Word file.' },
      { q: 'What is an ODT file?', a: 'ODT (OpenDocument Text) is the standard document format of LibreOffice Writer and OpenOffice, and Google Docs can export it too.' },
      { q: 'Is all formatting kept?', a: 'Text formatting, headings, lists, tables, images and page setup are kept. Headers/footers, footnotes, comments and text boxes are not carried over.' },
      { q: 'Is my document uploaded?', a: 'No. It is converted in your browser and never leaves your device.' },
    ],
    appDescription: 'Free online ODT to DOCX converter. Converts OpenDocument Text files to Word with headings, character formatting, lists, tables, images and page setup, in the browser with no upload.',
  }),
  file({
    slug: 'rtf-to-pdf',
    toolProps: { converter: 'rtf-to-pdf' },
    name: 'RTF to PDF Converter',
    short: 'Convert rich text files to PDF',
    title: 'RTF to PDF Converter Online Free – Rich Text to PDF',
    description:
      'Free RTF to PDF converter: convert Rich Text Format files from WordPad, TextEdit or Word to PDF with fonts, formatting, tables and pictures. No upload, no sign-up.',
    keywords: 'rtf to pdf, rtf to pdf converter, convert rtf to pdf, rich text to pdf, wordpad to pdf, textedit to pdf, rtf file to pdf, rtf to pdf online, rtf to pdf free',
    summary:
      'Convert RTF documents to PDF — fonts, sizes, bold and italic, colours, alignment, tables and pictures are kept. Works with files from WordPad, TextEdit and Word. Free, nothing uploaded.',
    howToTitle: 'How to convert RTF to PDF',
    steps: [
      { name: 'Add your RTF file', text: 'Drag and drop an .rtf file or click to browse.' },
      { name: 'Choose the page', text: 'Pick A4 or Letter, orientation and margins.' },
      { name: 'Convert', text: 'The text is laid out on pages with its formatting.' },
      { name: 'Download the PDF', text: 'Share or print the PDF.' },
    ],
    featuresTitle: 'Rich text, ready to share',
    featuresSub: 'For notes, letters and documents saved in WordPad or TextEdit.',
    features: [
      { title: 'Formatting kept', text: 'Fonts, sizes, bold, italic, underline, colours, alignment and indents.' },
      { title: 'Tables and pictures', text: 'Simple tables and PNG/JPEG pictures in the RTF are included.' },
      { title: 'Page breaks respected', text: 'Manual page breaks start a new PDF page.' },
    ],
    faqTitle: 'RTF to PDF — FAQ',
    faqs: [
      { q: 'How do I convert RTF to PDF?', a: 'Add your RTF file above. It converts automatically — then click Download PDF.' },
      { q: 'What is an RTF file?', a: 'RTF (Rich Text Format) is a simple document format made by WordPad, TextEdit and Word that stores text with basic formatting.' },
      { q: 'Can I select text in the PDF?', a: 'The downloaded PDF stores pages as images. For selectable text, use “Print → Save as PDF” after converting.' },
      { q: 'Is my file uploaded?', a: 'No. It is converted in your browser.' },
    ],
    appDescription: 'Free online RTF to PDF converter. Converts Rich Text Format documents to PDF with fonts, formatting, colours, tables and pictures, in the browser with no upload.',
  }),
  file({
    slug: 'txt-to-pdf',
    toolProps: { converter: 'txt-to-pdf' },
    name: 'TXT to PDF Converter',
    short: 'Turn text files into PDFs',
    title: 'TXT to PDF Converter Online Free – Text File to PDF',
    description:
      'Free TXT to PDF converter: convert text files or pasted text to PDF with your choice of font, size, page size and margins. Works with code and logs. No upload, no sign-up.',
    keywords: 'txt to pdf, text to pdf, txt to pdf converter, convert txt to pdf, text file to pdf, notepad to pdf, txt to pdf online, txt to pdf free, code to pdf, log to pdf',
    summary:
      'Convert a text file — or text you paste — into a clean PDF. Choose the font (including monospace for code), size, page and margins. Long lines wrap and pages break between lines. Free, nothing uploaded.',
    howToTitle: 'How to convert TXT to PDF',
    steps: [
      { name: 'Add text', text: 'Drag and drop a .txt file, or paste text into the box.' },
      { name: 'Choose the look', text: 'Pick a font, font size, page size, orientation and margins.' },
      { name: 'Convert', text: 'The text is laid out on pages, keeping blank lines and indentation.' },
      { name: 'Download the PDF', text: 'Save, share or print it.' },
    ],
    featuresTitle: 'Plain text, neat pages',
    featuresSub: 'For notes, logs, code, lyrics, transcripts and Notepad files.',
    features: [
      { title: 'Paste or upload', text: 'Use a .txt file or just paste text — no file needed.' },
      { title: 'Monospace for code', text: 'A code font keeps columns, indentation and ASCII tables aligned.' },
      { title: 'Any language', text: 'UTF-8, UTF-16 and older Windows text files open correctly, including Indian languages.' },
    ],
    faqTitle: 'TXT to PDF — FAQ',
    faqs: [
      { q: 'How do I convert a text file to PDF?', a: 'Add your .txt file above (or paste text), then press Convert to PDF and download the file.' },
      { q: 'Are blank lines and spaces kept?', a: 'Yes. Line breaks, blank lines, tabs and indentation are kept exactly as in the text.' },
      { q: 'Can I convert code or log files?', a: 'Yes. Choose the Monospace font so columns and indentation stay aligned.' },
      { q: 'Can I select text in the PDF?', a: 'The downloaded PDF stores pages as images. For selectable text, use “Print → Save as PDF” after converting.' },
    ],
    appDescription: 'Free online TXT to PDF converter. Converts plain-text files or pasted text to PDF with a choice of font, size, page size and margins, in the browser with no upload.',
  }),
]

export const landingUrl = (p) => `${SITE}/${p.slug}/`
export const qrLandings = landings.filter((p) => p.tool === 'qr')
export const resizerLandings = landings.filter((p) => p.tool === 'resizer')
export const fileLandings = landings.filter((p) => p.tool === 'file')

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
    ...landings.map((p) => ({ href: `/${p.slug}/`, icon: { qr: 'qr', file: 'file' }[p.tool] || 'image', name: p.name, text: p.short })),
  ]
  return { title: 'More free tools', links: links.filter((l) => l.href !== currentPath) }
}
