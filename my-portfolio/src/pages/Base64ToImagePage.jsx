import ToolPage from './ToolPage'
import Base64Tool from '../components/Base64Tool'
import { BASE64_TO_IMAGE_URL, decodeFaqs, decodeFeatures, decodeSteps } from '../data/base64'

function Base64ToImagePage() {
  return (
    <ToolPage
      name="Base64 to Image Converter"
      url={BASE64_TO_IMAGE_URL}
      summary="Paste a Base64 string or data URI and see the image instantly. The image type is detected automatically — download it as PNG, JPG, GIF, WebP, SVG and more. Free, nothing uploaded."
      price="₹500 lifetime"
      badges={['No sign-up', 'Instant preview', 'Auto-detects type', 'Private — runs in your browser']}
      tool={<Base64Tool initialMode="decode" />}
      steps={decodeSteps}
      howToTitle="How to convert Base64 to an image"
      featuresTitle="Decode Base64 images in a second"
      featuresSub="For developers debugging APIs, JSON, emails and data URIs."
      features={decodeFeatures}
      featureIcon="code"
      faqTitle="Base64 to image — frequently asked questions"
      faqs={decodeFaqs}
      related={{ href: '/image-to-base64/', text: 'Need the opposite? Convert an image to Base64 with Image to Base64' }}
      app={{
        category: 'DeveloperApplication',
        description:
          'Free online Base64 to image converter. Decodes Base64 strings and data URIs to images with automatic type detection (PNG, JPG, GIF, WebP, BMP, ICO, SVG, AVIF) and download. Runs in the browser — no upload.',
        featureList: decodeFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default Base64ToImagePage
