import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import QrGenerator from '../components/QrGenerator'
import Support from '../components/Support'
import { useRevealOnScroll } from '../hooks'
import { QR_URL, qrFaqs, qrSteps, qrTypes } from '../data/qr'

// Structured data built from the same content shown on the page.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Free QR Code Generator',
      url: QR_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free online QR code generator for URLs, text, UPI payments, Wi-Fi, WhatsApp, email, phone, SMS and vCard contacts. Custom colours, PNG and SVG download, no sign-up.',
      featureList: qrTypes.map((t) => t.title).join(', '),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      author: { '@type': 'Person', '@id': 'https://samarthdalela.xyz/#person', name: 'Samarth Dalela' },
    },
    {
      '@type': 'HowTo',
      name: 'How to create a QR code for free',
      totalTime: 'PT1M',
      step: qrSteps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text, url: `${QR_URL}#how-to` })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: qrFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Samarth Dalela', item: 'https://samarthdalela.xyz/' },
        { '@type': 'ListItem', position: 2, name: 'Free tools', item: 'https://samarthdalela.xyz/services/' },
        { '@type': 'ListItem', position: 3, name: 'QR Code Generator', item: QR_URL },
      ],
    },
  ],
}

function QrPage() {
  useRevealOnScroll()
  return (
    <>
      <Header page="services" />
      <main>
        <section className="services-hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="grid-lines" />
          </div>
          <div className="container services-hero-inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/services/">Free tools</a>{' '}
              <span aria-hidden="true">›</span> <span aria-current="page">QR Code Generator</span>
            </nav>
            <h1>
              Free <span className="gradient-text">QR Code Generator</span>
            </h1>
            <p className="hero-summary">
              Create QR codes online for links, UPI payments, Wi-Fi, WhatsApp, email, phone, SMS and contact cards.
              Custom colours, high-resolution PNG &amp; SVG download — no sign-up, no watermark, never expires.
            </p>
            <div className="hero-badges">
              <span className="price-tag-inline">
                <span className="price-old">₹1000 lifetime</span> <strong>FREE</strong>
              </span>
              <span className="pill">No sign-up</span>
              <span className="pill">No watermark</span>
              <span className="pill">Never expires</span>
              <span className="pill">Private — runs in your browser</span>
            </div>
          </div>
        </section>

        <section className="section services-section" aria-label="QR code generator tool">
          <div className="container">
            <QrGenerator />
          </div>
        </section>

        <section className="section section-alt" id="how-to">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">How it works</span>
              <h2>How to create a QR code in 4 steps</h2>
            </div>
            <ol className="steps">
              {qrSteps.map((s, i) => (
                <li key={s.name} className="step card reveal" style={{ '--d': `${i * 80}ms` }}>
                  <span className="step-num">{i + 1}</span>
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">Features</span>
              <h2>Every kind of QR code you need</h2>
              <p className="section-sub">One free QR code maker for business, payments, events and everyday sharing.</p>
            </div>
            <div className="skills-grid">
              {qrTypes.map((t, i) => (
                <div key={t.title} className="card feature reveal" style={{ '--d': `${(i % 3) * 80}ms` }}>
                  <span className="skill-icon"><Icon name="qr" /></span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="faq">
          <div className="container faq-wrap">
            <div className="section-head reveal">
              <span className="eyebrow">FAQ</span>
              <h2>QR code generator — frequently asked questions</h2>
            </div>
            <div className="faq-list">
              {qrFaqs.map((f) => (
                <details key={f.q} className="faq card reveal">
                  <summary>
                    <h3>{f.q}</h3>
                    <Icon name="chevron" size={18} />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <Support />
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </>
  )
}

export default QrPage
