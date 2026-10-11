import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'

// Production HTML is pre-rendered (see scripts/prerender.mjs); in dev the root is empty.
export function mount(Page) {
  const root = document.getElementById('root')
  const app = (
    <StrictMode>
      <Page />
    </StrictMode>
  )
  if (root.firstElementChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}
