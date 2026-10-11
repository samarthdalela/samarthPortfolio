import ToolPage from './ToolPage'
import Base64Tool from '../components/Base64Tool'
import { IMAGE_TO_BASE64_URL, encodeFaqs, encodeFeatures, encodeSteps } from '../data/base64'

function ImageToBase64Page() {
  return (
    <ToolPage
      name="Image to Base64 Converter"
      url={IMAGE_TO_BASE64_URL}
      summary="Convert any image to Base64 in one click — as a data URI, plain Base64, HTML <img> tag, CSS background or Markdown, ready to copy. Free, no sign-up, nothing uploaded."
      price="₹500 lifetime"
      badges={['No sign-up', 'Copy-ready code', 'PNG, JPG, SVG & more', 'Private — runs in your browser']}
      tool={<Base64Tool initialMode="encode" />}
      steps={encodeSteps}
      howToTitle="How to convert an image to Base64"
      featuresTitle="Embed images anywhere as text"
      featuresSub="For HTML emails, CSS, JSON, APIs and single-file web pages."
      features={encodeFeatures}
      featureIcon="code"
      faqTitle="Image to Base64 — frequently asked questions"
      faqs={encodeFaqs}
      related={{ href: '/base64-to-image/', text: 'Have a Base64 string? Turn it back into an image with Base64 to Image' }}
      app={{
        category: 'DeveloperApplication',
        description:
          'Free online image to Base64 converter. Encodes PNG, JPG, WebP, GIF, SVG and other images as a data URI, raw Base64, HTML img tag, CSS background or Markdown. Runs in the browser — no upload.',
        featureList: encodeFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default ImageToBase64Page
