// Content for the Image Resizer page — used for the visible page and its structured data.

export const RESIZER_URL = 'https://samarthdalela.xyz/image-resizer/'

export const resizerSteps = [
  {
    name: 'Add your images',
    text: 'Drag and drop images, click to browse, or paste with Ctrl+V. You can add many images at once to resize them in bulk.',
  },
  {
    name: 'Choose the new size',
    text: 'Enter a width and height in pixels, scale by percentage, or pick a preset like Instagram post, YouTube thumbnail or passport photo.',
  },
  {
    name: 'Pick format and file size',
    text: 'Save as JPG, PNG or WebP, adjust quality, or enter a target size in KB (for example 50 KB for online forms).',
  },
  {
    name: 'Resize and download',
    text: 'Click Resize, compare the before and after size, then download each image or all of them at once.',
  },
]

export const resizerFeatures = [
  { title: 'Resize by pixels or percentage', text: 'Set an exact width and height, keep the aspect ratio, or scale from 5% to 200%.' },
  { title: 'Reduce image size in KB', text: 'Compress a photo to 20 KB, 50 KB, 100 KB or any target size — ideal for government, exam and job forms.' },
  { title: 'Social media presets', text: 'One-click sizes for Instagram posts and stories, YouTube thumbnails, Facebook covers and LinkedIn banners.' },
  { title: 'Passport photo size', text: 'Resize to the 35×45 mm passport photo size (413×531 px at 300 DPI).' },
  { title: 'Bulk image resizer', text: 'Resize many images in one go with the same settings and download them all together.' },
  { title: 'JPG, PNG & WebP converter', text: 'Convert between JPG, PNG and WebP while resizing, with a background colour for transparent images.' },
  { title: 'Fit, fill or stretch', text: 'Fit the whole image with a background, fill and crop the edges, or stretch to the exact size.' },
  { title: 'Private & offline-friendly', text: 'Images never leave your device — everything is processed in your browser.' },
]

export const resizerFaqs = [
  {
    q: 'Is this image resizer free?',
    a: 'Yes. It is completely free with no sign-up, no watermark and no limit on how many images you resize.',
  },
  {
    q: 'How do I reduce an image to 50 KB or 100 KB?',
    a: 'Choose JPG or WebP, type the size you need (for example 50) in “Target size (KB)” and click Resize. The tool lowers the quality, and if needed the dimensions, until the file fits.',
  },
  {
    q: 'Are my photos uploaded to a server?',
    a: 'No. All resizing happens in your browser on your own device. Your images are never uploaded, stored or seen by anyone.',
  },
  {
    q: 'Can I resize many images at once?',
    a: 'Yes. Drop or select multiple images, choose the settings once, click Resize, then use “Download all”.',
  },
  {
    q: 'Will resizing reduce the image quality?',
    a: 'Making an image smaller keeps it sharp — the tool downsizes in steps for better quality. Making an image much larger than the original can look blurry, because new detail cannot be created.',
  },
  {
    q: 'What size is a passport photo in pixels?',
    a: 'A 35×45 mm passport photo at 300 DPI is 413×531 pixels. Pick the “Passport photo” preset to resize to this size.',
  },
  {
    q: 'Which format should I choose — JPG, PNG or WebP?',
    a: 'JPG is best for photos and the smallest file size on most forms. PNG keeps transparency and sharp edges for logos and screenshots. WebP gives small files for websites.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. It works in any modern browser on Android, iPhone, Windows and Mac.',
  },
]
