import ToolPage from './ToolPage'
import QrGenerator from '../components/QrGenerator'
import ImageResizer from '../components/ImageResizer'
import { landings, landingUrl, moreTools } from '../data/landings'

const tools = { qr: QrGenerator, resizer: ImageResizer }

// One SEO landing page per tool feature; all content comes from src/data/landings.js.
function LandingPage({ slug }) {
  const page = landings.find((p) => p.slug === slug)
  const Tool = tools[page.tool]
  return (
    <ToolPage
      {...page}
      url={landingUrl(page)}
      tool={<Tool {...page.toolProps} />}
      featureIcon={page.tool === 'qr' ? 'qr' : 'image'}
      more={moreTools(`/${slug}/`)}
      app={{
        category: page.category,
        description: page.appDescription,
        featureList: page.features.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default LandingPage
