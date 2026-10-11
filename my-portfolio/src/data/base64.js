// Content for the Image to Base64 and Base64 to Image pages — used for the visible page and its structured data.

export const IMAGE_TO_BASE64_URL = 'https://samarthdalela.xyz/image-to-base64/'
export const BASE64_TO_IMAGE_URL = 'https://samarthdalela.xyz/base64-to-image/'

const shared = [
  { title: 'Both directions', text: 'Switch between Image → Base64 and Base64 → Image with one click.' },
  { title: '100% private — no upload', text: 'Images and strings are processed in your browser and never leave your device.' },
  { title: 'Free, no limits', text: 'No sign-up, no watermark and no limit on how many images you convert.' },
  { title: 'Works on phone and computer', text: 'Use it in any modern browser on Android, iPhone, Windows, Mac or Linux.' },
]

export const encodeSteps = [
  { name: 'Add your image', text: 'Drag and drop an image, click to browse, or paste one with Ctrl+V.' },
  { name: 'Pick the output', text: 'Choose a data URI, plain Base64, an HTML <img> tag, a CSS background or Markdown.' },
  { name: 'Copy the code', text: 'Click Copy and paste it into your HTML, CSS, JSON, email template or API request.' },
  { name: 'Or download it', text: 'Save the encoded text as a .txt file if it is too long to copy comfortably.' },
]

export const encodeFeatures = [
  { title: 'Ready-to-paste formats', text: 'Data URI, raw Base64, HTML <img>, CSS background-image and Markdown — no manual editing.' },
  { title: 'Every image type', text: 'PNG, JPG, WebP, GIF, SVG, ICO, BMP and AVIF, with the right MIME type filled in.' },
  { title: 'See the size', text: 'Compare the original file size with the encoded text, so you know what you are embedding.' },
  ...shared,
]

export const encodeFaqs = [
  {
    q: 'How do I convert an image to Base64?',
    a: 'Add your image above. The Base64 code appears instantly — choose the format you need (for example Data URI or HTML <img>) and click Copy.',
  },
  {
    q: 'What is a Base64 data URI?',
    a: 'A data URI puts the whole image inside a text string such as data:image/png;base64,iVBOR…. You can use it anywhere an image URL goes, like an <img> src or a CSS background, without a separate file.',
  },
  {
    q: 'When should I use Base64 images?',
    a: 'For small icons, logos and images in HTML emails, single-file pages, JSON or APIs. For large photos a normal image file is better, because Base64 is about 33% bigger and cannot be cached separately.',
  },
  {
    q: 'Why is the Base64 bigger than my image?',
    a: 'Base64 uses 4 text characters for every 3 bytes, so the encoded text is about a third larger than the original file.',
  },
  {
    q: 'Is my image uploaded?',
    a: 'No. The conversion happens in your browser, so your image never leaves your device.',
  },
]

export const decodeSteps = [
  { name: 'Paste the Base64', text: 'Paste a data URI (data:image/png;base64,…) or plain Base64 text into the box.' },
  { name: 'See the image', text: 'The image appears instantly with its type, size in pixels and file size.' },
  { name: 'Check the type', text: 'Plain Base64 without a prefix is recognised automatically as PNG, JPG, GIF, WebP, BMP, ICO, SVG or AVIF.' },
  { name: 'Download', text: 'Click Download image to save it with the correct file extension.' },
]

export const decodeFeatures = [
  { title: 'Instant preview', text: 'See the decoded image as soon as you paste — no button to press.' },
  { title: 'Detects the image type', text: 'Works with or without the data:image prefix by reading the file signature.' },
  { title: 'Forgiving input', text: 'Handles line breaks, spaces, missing padding, quotes and URL-safe Base64 (- and _).' },
  ...shared,
]

export const decodeFaqs = [
  {
    q: 'How do I convert Base64 to an image?',
    a: 'Paste your Base64 string or data URI in the box above. The image is shown instantly — click Download image to save it.',
  },
  {
    q: 'Do I need the data:image/png;base64 prefix?',
    a: 'No. Paste just the Base64 text and the tool works out whether it is a PNG, JPG, GIF, WebP, BMP, ICO, SVG or AVIF from its first bytes.',
  },
  {
    q: 'Why does it say my Base64 is invalid?',
    a: 'Base64 only uses letters, numbers, +, / and = (or - and _ in URL-safe Base64). Check that the text was copied completely and nothing else was pasted with it.',
  },
  {
    q: 'Can I decode Base64 from an API or JSON response?',
    a: 'Yes. Copy the Base64 value (with or without its quotes) and paste it here to see and save the image.',
  },
  {
    q: 'Is my data sent anywhere?',
    a: 'No. Decoding happens in your browser, so the Base64 text and the image never leave your device.',
  },
]
