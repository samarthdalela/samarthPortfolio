import ToolPage from './ToolPage'
import PdfToImage from '../components/PdfToImage'
import { PDF_TO_IMAGE_URL, pdfImageFaqs, pdfImageFeatures, pdfImageSteps } from '../data/pdfToImage'

function PdfToImagePage() {
  return (
    <ToolPage
      name="PDF to Image Converter"
      url={PDF_TO_IMAGE_URL}
      summary="Convert PDF to JPG, PNG or WebP images in seconds. Turn every page — or just the pages you pick — into a high-quality image up to 300 DPI. No sign-up, no watermark, nothing uploaded."
      price="₹1500 lifetime"
      badges={['No sign-up', 'No watermark', 'Up to 300 DPI', 'Private — runs in your browser']}
      tool={<PdfToImage />}
      steps={pdfImageSteps}
      howToTitle="How to convert a PDF to images in 4 steps"
      featuresTitle="Everything you need to turn a PDF into images"
      featuresSub="Save PDF pages as pictures for WhatsApp, Instagram, slides, websites and online forms."
      features={pdfImageFeatures}
      featureIcon="image"
      faqTitle="PDF to image — frequently asked questions"
      faqs={pdfImageFaqs}
      related={{
        href: '/image-to-pdf/',
        text: 'Need to go the other way? Turn photos into a PDF with the free Image to PDF Converter',
      }}
      app={{
        category: 'UtilitiesApplication',
        description:
          'Free online PDF to image converter: convert PDF pages to JPG, PNG or WebP at up to 300 DPI, choose which pages to convert, and open password-protected PDFs. Runs in the browser — no upload.',
        featureList: pdfImageFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default PdfToImagePage
