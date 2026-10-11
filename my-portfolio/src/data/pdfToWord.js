// Content for the PDF to Word Converter page — used for the visible page and its structured data.

export const PDF_TO_WORD_URL = 'https://samarthdalela.xyz/pdf-to-word/'

export const pdfWordSteps = [
  {
    name: 'Add your PDF',
    text: 'Drag and drop a PDF or click to browse. If it is password-protected, enter the password to unlock it.',
  },
  {
    name: 'Choose how to convert',
    text: 'Pick “Editable text” to edit the content in Word, or “Exact layout” to keep every page looking identical.',
  },
  {
    name: 'Convert to Word',
    text: 'Click Convert. Paragraphs, fonts, bold and italic text, sizes, indents and alignment are rebuilt as a Word document.',
  },
  {
    name: 'Download and edit',
    text: 'Download the .docx file and open it in Microsoft Word, Google Docs, WPS or LibreOffice.',
  },
]

export const pdfWordFeatures = [
  { title: 'PDF to editable Word (DOCX)', text: 'Get a real Word document with editable paragraphs — not a picture of your PDF.' },
  { title: 'Keeps fonts and formatting', text: 'Font, size, bold, italic, headings, indents, centred and justified text are carried over.' },
  { title: 'Exact layout option', text: 'Need it to look identical? Put each page into Word as a high-quality picture instead.' },
  { title: 'Scanned pages included', text: 'Pages without selectable text are added as pictures, so nothing from your PDF goes missing.' },
  { title: '100% private — no upload', text: 'The PDF is converted in your browser and never leaves your device. Safe for resumes and contracts.' },
  { title: 'Password-protected PDFs', text: 'Unlock a protected PDF with its password — the password is only used on your device.' },
  { title: 'Free, no watermark', text: 'No sign-up, no watermark, no page limit and no daily limit. Free forever.' },
  { title: 'Works with Word & Google Docs', text: 'The .docx file opens in Microsoft Word, Google Docs, WPS Office, Pages and LibreOffice.' },
]

export const pdfWordFaqs = [
  {
    q: 'How do I convert a PDF to Word?',
    a: 'Add your PDF using the box above, keep “Editable text” selected and click Convert to Word. Then download the .docx file and open it in Word or Google Docs.',
  },
  {
    q: 'Is this PDF to Word converter free?',
    a: 'Yes. It is completely free with no sign-up, no watermark and no limit on the number of files or pages.',
  },
  {
    q: 'Is my PDF uploaded to a server?',
    a: 'No. The PDF is read and converted entirely in your browser, so it never leaves your device. This makes it safe for resumes, bank statements and contracts.',
  },
  {
    q: 'Can I edit the text after converting?',
    a: 'Yes. With “Editable text” the content becomes normal Word paragraphs you can type into, restyle and reflow. Check the layout after converting — complex designs may need small touch-ups.',
  },
  {
    q: 'Will the Word file look exactly like my PDF?',
    a: 'Simple documents like letters, resumes, reports and assignments convert closely. Tables, multi-column layouts, text boxes and pictures inside text pages are not rebuilt in editable mode — choose “Exact layout” if the look matters more than editing.',
  },
  {
    q: 'Can it convert scanned PDFs?',
    a: 'Scanned pages have no real text (only a photo of the text), so they are added to the Word file as pictures. Text recognition (OCR) is not supported.',
  },
  {
    q: 'Can I convert a password-protected PDF?',
    a: 'Yes, if you know the password. Enter it when asked and the PDF is unlocked on your device only.',
  },
  {
    q: 'Does it work with Google Docs?',
    a: 'Yes. Upload the downloaded .docx file to Google Drive and open it with Google Docs, or use it in WPS Office, Apple Pages or LibreOffice.',
  },
  {
    q: 'Can I convert PDF to Word on my phone?',
    a: 'Yes. Open this page on Android or iPhone, tap the box to pick a PDF from your files, then convert and download the Word file.',
  },
]
