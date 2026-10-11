import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import Services from './pages/Services.jsx'
import QrPage from './pages/QrPage.jsx'

// Used at build time by scripts/prerender.mjs to bake each page into its HTML file.
const pages = { home: App, services: Services, qr: QrPage }

export function render(page) {
  const Page = pages[page]
  return renderToString(
    <StrictMode>
      <Page />
    </StrictMode>,
  )
}
