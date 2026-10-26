import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import Support from '../components/Support'
import SupportPopup from '../components/SupportPopup'
import { useRevealOnScroll } from '../hooks'

// Shared layout for every free-tool page: hero, the tool, how-to, features, FAQ, support.
// The structured data is built from the same content shown on the page (Google requires they match).
function buildStructuredData({ name, url, app, steps, howToTitle, faqs }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: `Free ${name}`,
        url,
        applicationCategory: app.category,
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript',
        description: app.description,
        featureList: app.featureList,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        author: { '@type': 'Person', '@id': 'https://samarthdalela.xyz/#person', name: 'Samarth Dalela' },
      },
      {
        '@type': 'HowTo',
        name: howToTitle,
        totalTime: 'PT1M',
        step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text, url: `${url}#how-to` })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Samarth Dalela', item: 'https://samarthdalela.xyz/' },
          { '@type': 'ListItem', position: 2, name: 'Free tools', item: 'https://samarthdalela.xyz/services/' },
          { '@type': 'ListItem', position: 3, name, item: url },
        ],
      },
    ],
  }
}

function ToolPage(props) {
  const {
    name,
    summary,
    price,
    badges,
    tool,
    steps,
    howToTitle,
    featuresTitle,
    featuresSub,
    features,
    featureIcon,
    faqTitle,
    faqs,
    related,
    more,
  } = props
  useRevealOnScroll()
  const structuredData = buildStructuredData(props)

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
              <span aria-hidden="true">›</span> <span aria-current="page">{name}</span>
            </nav>
            <h1>
              Free <span className="gradient-text">{name}</span>
            </h1>
            <p className="hero-summary">{summary}</p>
            <div className="hero-badges">
              <span className="price-tag-inline">
                {price && <span className="price-old">{price}</span>} <strong>FREE</strong>
              </span>
              {badges.map((b) => (
                <span key={b} className="pill">{b}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section services-section" aria-label={`${name} tool`}>
          <div className="container">
            {tool}
            {related && (
              <p className="tool-related">
                <a href={related.href}>
                  {related.text} <Icon name="arrow" size={14} />
                </a>
              </p>
            )}
          </div>
        </section>

        <section className="section section-alt" id="how-to">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">How it works</span>
              <h2>{howToTitle}</h2>
            </div>
            <ol className="steps">
              {steps.map((s, i) => (
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
              <h2>{featuresTitle}</h2>
              <p className="section-sub">{featuresSub}</p>
            </div>
            <div className="skills-grid">
              {features.map((t, i) => (
                <div key={t.title} className="card feature reveal" style={{ '--d': `${(i % 3) * 80}ms` }}>
                  <span className="skill-icon"><Icon name={featureIcon} /></span>
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
              <h2>{faqTitle}</h2>
            </div>
            <div className="faq-list">
              {faqs.map((f) => (
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

        {more && (
          <section className="section" id="more-tools">
            <div className="container">
              <div className="section-head reveal">
                <span className="eyebrow">More free tools</span>
                <h2>{more.title}</h2>
              </div>
              <div className="tools-teaser-list more-tools-list">
                {more.links.map((m) => (
                  <a key={m.href} href={m.href} className="tools-teaser-item">
                    <span className="tools-teaser-icon" aria-hidden="true"><Icon name={m.icon} /></span>
                    <span>
                      <strong>{m.name}</strong>
                      <span className="muted">{m.text}</span>
                    </span>
                    <Icon name="arrow" size={16} />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <Support />
          </div>
        </section>
      </main>
      <Footer />
      <SupportPopup />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </>
  )
}

export default ToolPage
