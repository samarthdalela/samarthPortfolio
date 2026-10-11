import { mount } from './mount.jsx'
import LandingPage from './pages/LandingPage.jsx'

// Shared entry for every SEO landing page; the page's slug is set on #root by scripts/gen-pages.mjs.
const slug = document.getElementById('root').dataset.page

mount(() => <LandingPage slug={slug} />)
