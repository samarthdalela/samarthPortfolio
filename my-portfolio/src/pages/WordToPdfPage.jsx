import ToolPage from './ToolPage'
import WordToPdf from '../components/WordToPdf'
import { WORD_TO_PDF_URL, wordFaqs, wordFeatures, wordSteps } from '../data/wordToPdf'

function WordToPdfPage() {
  return (
    <ToolPage
      name="Word to PDF Converter"
      url={WORD_TO_PDF_URL}
      summary="Convert Word documents (DOCX) to PDF in seconds — layout, images, tables, headers and footers included. No Microsoft Word needed, no sign-up, no watermark, nothing uploaded."
      price="₹1500 lifetime"
      badges={['No sign-up', 'No watermark', 'No Word needed', 'Private — runs in your browser']}
      tool={<WordToPdf />}
      steps={wordSteps}
      howToTitle="How to convert Word to PDF in 4 steps"
      featuresTitle="Everything you need to turn Word into PDF"
      featuresSub="Make PDFs of resumes, assignments, letters and contracts that open the same everywhere."
      features={wordFeatures}
      featureIcon="file"
      faqTitle="Word to PDF — frequently asked questions"
      faqs={wordFaqs}
      related={{
        href: '/image-to-pdf/',
        text: 'Have photos or scans instead? Use the free Image to PDF Converter',
      }}
      app={{
        category: 'UtilitiesApplication',
        description:
          'Free online Word to PDF converter: convert DOCX documents to PDF with layout, images, tables, headers and footers. No Microsoft Word needed. Runs in the browser — no upload.',
        featureList: wordFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default WordToPdfPage
