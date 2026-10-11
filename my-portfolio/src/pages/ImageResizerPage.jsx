import ToolPage from './ToolPage'
import ImageResizer from '../components/ImageResizer'
import { RESIZER_URL, resizerFaqs, resizerFeatures, resizerSteps } from '../data/imageResizer'

function ImageResizerPage() {
  return (
    <ToolPage
      name="Image Resizer"
      url={RESIZER_URL}
      summary="Resize images online by pixels, percentage or preset, reduce photo size to any KB, and convert to JPG, PNG or WebP. Bulk resize many images at once — no sign-up, no watermark, nothing uploaded."
      price="₹500 lifetime"
      badges={['No sign-up', 'No watermark', 'Bulk resize', 'Private — runs in your browser']}
      tool={<ImageResizer />}
      steps={resizerSteps}
      howToTitle="How to resize an image in 4 steps"
      featuresTitle="Everything you need to resize photos"
      featuresSub="One free image resizer for forms, social media, websites and printing."
      features={resizerFeatures}
      featureIcon="image"
      faqTitle="Image resizer — frequently asked questions"
      faqs={resizerFaqs}
      app={{
        category: 'MultimediaApplication',
        description:
          'Free online image resizer: resize by pixels, percentage or presets, reduce image size to a target KB, bulk resize and convert between JPG, PNG and WebP. Runs in the browser — no upload.',
        featureList: resizerFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default ImageResizerPage
