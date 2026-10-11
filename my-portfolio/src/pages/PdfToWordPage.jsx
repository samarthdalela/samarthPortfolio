import ToolPage from './ToolPage'
import PdfToWord from '../components/PdfToWord'
import { PDF_TO_WORD_URL, pdfWordFaqs, pdfWordFeatures, pdfWordSteps } from '../data/pdfToWord'

function PdfToWordPage() {
  return (
    <ToolPage
      name="PDF to Word Converter"
      url={PDF_TO_WORD_URL}
      summary="Convert PDF to an editable Word document (DOCX) in seconds. Paragraphs, fonts, bold and italic text, headings and alignment are rebuilt so you can edit them — no sign-up, no watermark, nothing uploaded."
      price="₹2000 lifetime"
      badges={['No sign-up', 'No watermark', 'Editable DOCX', 'Private — runs in your browser']}
      tool={<PdfToWord />}
      steps={pdfWordSteps}
      howToTitle="How to convert a PDF to Word in 4 steps"
      featuresTitle="Everything you need to turn a PDF into Word"
      featuresSub="Edit resumes, letters, reports and forms that you only have as a PDF."
      features={pdfWordFeatures}
      featureIcon="file"
      faqTitle="PDF to Word — frequently asked questions"
      faqs={pdfWordFaqs}
      related={{
        href: '/word-to-pdf/',
        text: 'Done editing? Turn it back into a PDF with the free Word to PDF Converter',
      }}
      app={{
        category: 'UtilitiesApplication',
        description:
          'Free online PDF to Word converter: convert PDF to editable DOCX with fonts, bold/italic, headings and alignment, or keep the exact layout with pages as pictures. Supports password-protected PDFs. Runs in the browser — no upload.',
        featureList: pdfWordFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default PdfToWordPage
