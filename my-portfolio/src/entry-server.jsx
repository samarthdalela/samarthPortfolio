import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import Services from './pages/Services.jsx'
import QrPage from './pages/QrPage.jsx'
import ImageResizerPage from './pages/ImageResizerPage.jsx'

// Used at build time by scripts/prerender.mjs to bake each page into its HTML file.
const pages = { home: App, services: Services, qr: QrPage, resizer: ImageResizerPage }

export function render(page) {
  const Page = pages[page]
  return renderToString(
    <StrictMode>
      <Page />
      <ChatWidget />
    </StrictMode>,
  )
}
