import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import Support from '../components/Support'
import SupportPopup from '../components/SupportPopup'
import { useRevealOnScroll } from '../hooks'
import { profile } from '../data/resume'
import { fileLandings, qrLandings, resizerLandings } from '../data/landings'
import { toolSections } from '../data/tools'

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

const groups = [
  { title: 'Popular QR code generators', icon: 'qr', pages: qrLandings },
  { title: 'Popular image tools', icon: 'image', pages: resizerLandings },
  {
    title: 'Popular PDF & document tools',
    icon: 'file',
    pages: [
      { slug: 'pdf-to-word', name: 'PDF to Word Converter', short: 'Editable DOCX from any PDF' },
      { slug: 'word-to-pdf', name: 'Word to PDF Converter', short: 'DOCX to PDF, layout kept' },
      { slug: 'image-to-pdf', name: 'Image to PDF Converter', short: 'Combine photos into one PDF' },
      { slug: 'pdf-to-image', name: 'PDF to Image Converter', short: 'PDF pages to JPG or PNG' },
      ...fileLandings,
    ],
  },
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
                  href={`https://wa.me/${profile.phone.replace(/D/g, '')}?text=${encodeURIComponent(hireMessage)}`}
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
    </>
  )
}

export default Services
