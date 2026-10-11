import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import Services from './pages/Services.jsx'
import QrPage from './pages/QrPage.jsx'
import ImageResizerPage from './pages/ImageResizerPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ImageToPdfPage from './pages/ImageToPdfPage.jsx'
import PdfToImagePage from './pages/PdfToImagePage.jsx'
import WordToPdfPage from './pages/WordToPdfPage.jsx'

// Used at build time by scripts/prerender.mjs to bake each page into its HTML file.
const pages = {
  home: App,
  services: Services,
  qr: QrPage,
  resizer: ImageResizerPage,
  imageToPdf: ImageToPdfPage,
  pdfToImage: PdfToImagePage,
  wordToPdf: WordToPdfPage,
}

export { landings } from './data/landings.js'

export function renderLanding(slug) {
  return renderToString(
    <StrictMode>
      <LandingPage slug={slug} />
    </StrictMode>,
  )
}

export function render(page) {
  const Page = pages[page]
  return renderToString(
    <StrictMode>
      <Page />
    </StrictMode>,
  )
}
