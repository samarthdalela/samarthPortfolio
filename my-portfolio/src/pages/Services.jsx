import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import Support from '../components/Support'
import SupportPopup from '../components/SupportPopup'
import { useActiveSection, useRevealOnScroll } from '../hooks'
import { profile } from '../data/resume'
import { SERVICES_URL, allTools, categories, featured, servicesFaqs, toolCount } from '../data/tools'

// Custom software offered as a freelancer, shown in the "Hire me" box.
const offerings = [
  'CMS — manage your website content',
  'LMS — online courses & Moodle',
  'CRM — leads, customers & follow-ups',
  'ERP & inventory management',
  'Admin dashboards & reports',
  'Booking & appointment systems',
  'E-commerce & payment integration',
  'PWAs & mobile-friendly web apps',
  'REST APIs & third-party integrations',
  'Business websites & landing pages',
]

const hireMessage = `Hi Samarth, I need custom software.

What I need (CMS / LMS / CRM / website / other):
Main features:
Deadline:
Budget:`

// Structured data for search engines, built from the same catalog and FAQ that the page shows.
const PAGE_DESCRIPTION =
  'Free online PDF, image, QR code and audio to text tools: PDF to Word, Excel and PowerPoint, Word to PDF, image converters, image resizer, QR code generators and audio & video transcription. No sign-up, nothing uploaded.'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${SERVICES_URL}#page`,
      url: SERVICES_URL,
      name: 'Free online PDF, image, QR code & audio to text tools',
      description: PAGE_DESCRIPTION,
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://samarthdalela.xyz/#website' },
      author: { '@id': 'https://samarthdalela.xyz/#person' },
      mainEntity: { '@id': `${SERVICES_URL}#tools` },
      breadcrumb: { '@id': `${SERVICES_URL}#breadcrumb` },
    },
    {
      '@type': 'ItemList',
      '@id': `${SERVICES_URL}#tools`,
      name: 'Free online tools',
      numberOfItems: allTools.length,
      itemListElement: allTools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: t.url, name: t.name })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SERVICES_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Samarth Dalela', item: 'https://samarthdalela.xyz/' },
        { '@type': 'ListItem', position: 2, name: 'Free tools', item: SERVICES_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SERVICES_URL}#faq`,
      mainEntity: servicesFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

const categoryIds = categories.map((c) => c.id)

function Services() {
  useRevealOnScroll()
  const active = useActiveSection(categoryIds)
  // Search filters every category; the page is pre-rendered with all tools listed (good for search engines).
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = categories.map((c) => ({ ...c, shown: c.tools.filter((t) => !q || `${t.name} ${t.text}`.toLowerCase().includes(q)) }))
  const found = visible.reduce((n, c) => n + c.shown.length, 0)
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
            <span className="badge">
              <span className="pulse" /> 100% free · no sign-up · by Samarth Dalela
            </span>
            <h1>
              Free online <span className="gradient-text">PDF, image, QR code &amp; audio to text</span> tools
            </h1>
            <p className="hero-summary">
              Convert PDF to Word, Excel or PowerPoint, turn documents and photos into PDFs, resize images to any KB,
              convert HEIC, WebP and PNG, transcribe audio and video to text, and make UPI or Wi-Fi QR codes. Every tool runs in your browser, so your files
              are never uploaded — free, kept free by support from people like you.
            </p>
            <p className="tools-stats">
              <strong>{toolCount} free tools</strong> · No sign-up · Your files never leave your device
            </p>
            <label className="tools-search">
              <Icon name="search" size={20} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools — e.g. PDF to Word, HEIC, 50 KB, UPI"
                aria-label="Search tools"
              />
            </label>
          </div>
        </section>

        <nav className="tools-nav" aria-label="Tool categories">
          <div className="container tools-nav-inner">
            {visible.map(
              (c) =>
                c.shown.length > 0 && (
                  <a key={c.id} href={`#${c.id}`} className={`filter ${active === c.id ? 'is-active' : ''}`}>
                    {c.short} <span className="tools-nav-count">{c.shown.length}</span>
                  </a>
                ),
            )}
          </div>
        </nav>

        {!q && (
          <section className="section services-section tools-featured" aria-label="Most used tools">
            <div className="container">
              <div className="cat-head">
                <span className="tools-teaser-icon" aria-hidden="true"><Icon name="star" /></span>
                <div>
                  <h2>Most popular free tools</h2>
                  <p className="muted">The favourites — each would normally cost a licence or a subscription. Here they’re free.</p>
                </div>
              </div>
              <div className="featured-grid">
                {featured.map((t) => (
                  <a key={t.href} href={t.href} className={`tool-card card reveal ${t.highlight ? 'tool-card-highlight' : ''}`}>
                    <div className="tool-card-top">
                      <span className="skill-icon"><Icon name={t.icon} /></span>
                      {t.highlight && <span className="tool-card-new">{t.highlight}</span>}
                      <span className="price-tag-inline">
                        <span className="price-old">{t.price}</span> <strong>FREE</strong>
                      </span>
                    </div>
                    <h3>{t.name}</h3>
                    <p className="muted">{t.text}</p>
                    <span className="project-link">
                      Open tool <Icon name="arrow" size={14} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section services-section tools-catalog" aria-label="All tools">
          <div className="container">
            {visible.map(
              (c) =>
                c.shown.length > 0 && (
                  <div key={c.id} id={c.id} className="cat-section">
                    <div className="cat-head">
                      <span className="tools-teaser-icon" aria-hidden="true"><Icon name={c.icon} /></span>
                      <div>
                        <div className="cat-title">
                          <h2>{c.title}</h2>
                          <span className="cat-count" aria-label={`${c.shown.length} tools`}>{c.shown.length}</span>
                        </div>
                        <p className="muted">{c.sub}</p>
                      </div>
                    </div>
                    <div className="tool-tiles">
                      {c.shown.map((t) => (
                        <a key={t.href} href={t.href} className="tool-tile" {...(t.external ? { target: '_blank', rel: 'noopener' } : {})}>
                          <span className="tool-tile-icon" aria-hidden="true">
                            {t.emoji ? t.emoji : <Icon name={c.icon} size={18} />}
                          </span>
                          <span className="tool-tile-text">
                            <strong>{t.name}</strong>
                            <span className="muted">{t.text}</span>
                          </span>
                          <Icon name={t.external ? 'external' : 'arrow'} size={16} />
                        </a>
                      ))}
                    </div>
                  </div>
                ),
            )}

            {found === 0 && (
              <div className="tools-empty card">
                <p>
                  No tool matches “<strong>{query}</strong>” yet.
                </p>
                <a href={`mailto:${profile.email}?subject=${encodeURIComponent(`Tool idea: ${query}`)}`} className="btn btn-ghost">
                  <Icon name="mail" size={18} /> Suggest this tool
                </a>
              </div>
            )}

            <div className="tools-suggest card">
              <span className="skill-icon"><Icon name="star" /></span>
              <div>
                <h3>More tools coming soon</h3>
                <p className="muted">Have an idea for a free tool? Tell me — I may build it next.</p>
              </div>
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent('Free tool idea')}`} className="btn btn-ghost">
                <Icon name="mail" size={18} /> Suggest a tool
              </a>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="faq">
          <div className="container faq-wrap">
            <div className="section-head reveal">
              <span className="eyebrow">FAQ</span>
              <h2>Free online tools — frequently asked questions</h2>
            </div>
            <div className="faq-list">
              {servicesFaqs.map((f) => (
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

        <section className="section section-alt">
          <div className="container">
            <Support />

            <div className="hire card reveal" id="hire">
              <span className="badge">
                <span className="pulse" /> Available for freelance projects
              </span>
              <h2>Need custom software for your business?</h2>
              <p className="muted hire-lead">
                I build CMS, LMS, CRM and other custom software tailored to your needs and budget — from a simple
                website to a complete business system. Share your requirements and I’ll suggest the right solution,
                timeline and cost.
              </p>
              <ul className="hire-list">
                {offerings.map((o) => (
                  <li key={o}>
                    <Icon name="check" size={16} /> {o}
                  </li>
                ))}
              </ul>
              <p className="hire-process muted">
                <strong>How it works:</strong> discuss requirements → clear quote &amp; timeline → regular demos as I
                build → launch, training &amp; support.
              </p>
              <div className="hire-actions">
                <a
                  href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(hireMessage)}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary"
                >
                  <Icon name="chat" size={18} /> Discuss on WhatsApp
                </a>
                <a
                  href={`mailto:${profile.email}?subject=${encodeURIComponent('Custom software project')}&body=${encodeURIComponent(hireMessage)}`}
                  className="btn btn-ghost"
                >
                  <Icon name="mail" size={18} /> Email your requirements
                </a>
                <a href="/#projects" className="btn btn-ghost">
                  <Icon name="briefcase" size={18} /> See my work
                </a>
              </div>
            </div>
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

export default Services
