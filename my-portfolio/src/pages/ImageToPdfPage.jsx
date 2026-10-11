import ToolPage from './ToolPage'
import ImageToPdf from '../components/ImageToPdf'
import { IMAGE_TO_PDF_URL, pdfFaqs, pdfFeatures, pdfSteps } from '../data/imageToPdf'

function ImageToPdfPage() {
  return (
    <ToolPage
      name="Image to PDF Converter"
      url={IMAGE_TO_PDF_URL}
      summary="Convert JPG, PNG and other images to PDF in seconds. Combine many photos into one PDF, reorder and rotate pages, and pick A4 or Letter size — no sign-up, no watermark, nothing uploaded."
      price="₹1500 lifetime"
      badges={['No sign-up', 'No watermark', 'Merge many images', 'Private — runs in your browser']}
      tool={<ImageToPdf />}
      steps={pdfSteps}
      howToTitle="How to convert images to PDF in 4 steps"
      featuresTitle="Everything you need to turn photos into a PDF"
      featuresSub="Make PDFs from photos, scans and screenshots for forms, assignments, email and printing."
      features={pdfFeatures}
      featureIcon="file"
      faqTitle="Image to PDF — frequently asked questions"
      faqs={pdfFaqs}
      related={{
        href: '/image-resizer/',
        text: 'Need to resize a photo or reduce it to a certain KB first? Use the free Image Resizer',
      }}
      app={{
        category: 'UtilitiesApplication',
        description:
          'Free online image to PDF converter: convert JPG, PNG, WebP and other images to PDF, combine multiple images into one PDF, reorder and rotate pages, choose A4, Letter or custom page size. Runs in the browser — no upload.',
        featureList: pdfFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default ImageToPdfPage
