import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import Support from '../components/Support'
import SupportPopup from '../components/SupportPopup'
import { useRevealOnScroll } from '../hooks'
import { profile } from '../data/resume'
import { qrLandings, resizerLandings } from '../data/landings'
import { toolSections } from '../data/tools'

const groups = [
  { title: 'Popular QR code generators', icon: 'qr', pages: qrLandings },
  { title: 'Popular image tools', icon: 'image', pages: resizerLandings },
]

function Services() {
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
            <span className="badge">
              <span className="pulse" /> 100% free · no sign-up
            </span>
            <h1>
              Free tools by <span className="gradient-text">Samarth Dalela</span>
            </h1>
            <p className="hero-summary">
              Handy, privacy-friendly tools that run entirely in your browser. Use them as much as you like — free of
              cost, kept free by support from people like you.
            </p>
          </div>
        </section>

        <section className="section services-section" aria-label="Tools">
          <div className="container">
            {toolSections.map((section, si) => (
              <div key={section.id} id={section.id} className="tool-group">
                <div className="tool-group-head reveal">
                  <h2>{section.title}</h2>
                  {section.sub && <p className="muted">{section.sub}</p>}
                </div>
                <div className="tools-grid">
                  {section.tools.map((t) => (
                    <a
                      key={t.href}
                      href={t.href}
                      className="tool-card card reveal"
                      {...(t.external ? { target: '_blank', rel: 'noopener' } : {})}
                    >
                      <div className="tool-card-top">
                        <span className="skill-icon">
                          {t.emoji ? <span aria-hidden="true">{t.emoji}</span> : <Icon name={t.icon} />}
                        </span>
                        <span className="price-tag-inline">
                          <span className="price-old">{t.price}</span> <strong>FREE</strong>
                        </span>
                      </div>
                      <h3>{t.name}</h3>
                      <p className="muted">{t.text}</p>
                      <span className="project-link">
                        {t.cta || `Open ${t.name}`} <Icon name={t.external ? 'external' : 'arrow'} size={14} />
                      </span>
                    </a>
                  ))}
                  {si === toolSections.length - 1 && (
                    <div className="tool-card tool-card-soon card reveal">
                      <span className="skill-icon"><Icon name="star" /></span>
                      <h3>More tools coming soon</h3>
                      <p className="muted">I'm building more free tools. Have an idea? Email me and I may build it next.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {groups.map((g) => (
          <section key={g.title} className="section services-section" aria-label={g.title}>
            <div className="container">
              <div className="section-head reveal">
                <h2>{g.title}</h2>
              </div>
              <div className="tools-teaser-list more-tools-list">
                {g.pages.map((p) => (
                  <a key={p.slug} href={`/${p.slug}/`} className="tools-teaser-item">
                    <span className="tools-teaser-icon" aria-hidden="true"><Icon name={g.icon} /></span>
                    <span>
                      <strong>{p.name}</strong>
                      <span className="muted">{p.short}</span>
                    </span>
                    <Icon name="arrow" size={16} />
                  </a>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="section section-alt">
          <div className="container">
            <Support />

            <div className="custom-cta card reveal">
              <div>
                <h3>Need a custom tool or website?</h3>
                <p className="muted">
                  I build web apps, PWAs, CMSs and APIs. Tell me what you need.
                </p>
              </div>
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent('Custom tool request')}`} className="btn btn-ghost">
                <Icon name="mail" size={18} /> Get in touch
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <SupportPopup />
    </>
  )
}

export default Services
