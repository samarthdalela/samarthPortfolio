import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import Services from './pages/Services.jsx'
import Videos from './pages/Videos.jsx'
import QrPage from './pages/QrPage.jsx'
import ImageResizerPage from './pages/ImageResizerPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ImageToPdfPage from './pages/ImageToPdfPage.jsx'
import PdfToImagePage from './pages/PdfToImagePage.jsx'
import WordToPdfPage from './pages/WordToPdfPage.jsx'
import PdfToWordPage from './pages/PdfToWordPage.jsx'
import ImageToBase64Page from './pages/ImageToBase64Page.jsx'
import Base64ToImagePage from './pages/Base64ToImagePage.jsx'
import AudioToTextPage from './pages/AudioToTextPage.jsx'

// Used at build time by scripts/prerender.mjs to bake each page into its HTML file.
const pages = {
  home: App,
  services: Services,
  videos: Videos,
  qr: QrPage,
  resizer: ImageResizerPage,
  imageToPdf: ImageToPdfPage,
  pdfToImage: PdfToImagePage,
  wordToPdf: WordToPdfPage,
  pdfToWord: PdfToWordPage,
  imageToBase64: ImageToBase64Page,
  base64ToImage: Base64ToImagePage,
  audioToText: AudioToTextPage,
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
