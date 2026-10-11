import ToolPage from './ToolPage'
import QrGenerator from '../components/QrGenerator'
import { QR_URL, qrFaqs, qrSteps, qrTypes } from '../data/qr'
import { moreTools } from '../data/landings'

function QrPage() {
  return (
    <ToolPage
      name="QR Code Generator"
      url={QR_URL}
      summary="Create QR codes online for links, UPI payments, Wi-Fi, WhatsApp, email, phone, SMS and contact cards. Custom colours, high-resolution PNG & SVG download — no sign-up, no watermark, never expires."
      price="₹1000 lifetime"
      badges={['No sign-up', 'No watermark', 'Never expires', 'Private — runs in your browser']}
      tool={<QrGenerator />}
      steps={qrSteps}
      howToTitle="How to create a QR code in 4 steps"
      featuresTitle="Every kind of QR code you need"
      featuresSub="One free QR code maker for business, payments, events and everyday sharing."
      features={qrTypes}
      featureIcon="qr"
      faqTitle="QR code generator — frequently asked questions"
      faqs={qrFaqs}
      more={moreTools('/qr-code-generator/')}
      app={{
        category: 'UtilitiesApplication',
        description:
          'Free online QR code generator for URLs, text, UPI payments, Wi-Fi, WhatsApp, email, phone, SMS and vCard contacts. Custom colours, PNG and SVG download, no sign-up.',
        featureList: qrTypes.map((t) => t.title).join(', '),
      }}
    />
  )
}

export default QrPage
