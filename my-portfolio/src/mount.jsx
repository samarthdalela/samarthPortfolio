import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import ChatWidget from './components/ChatWidget.jsx'

// Production HTML is pre-rendered (see scripts/prerender.mjs); in dev the root is empty.
// The chat widget is added to every page here and in entry-server.jsx.
export function mount(Page) {
  const root = document.getElementById('root')
  const app = (
    <StrictMode>
      <Page />
      <ChatWidget />
    </StrictMode>
  )
  if (root.firstElementChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}
