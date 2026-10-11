import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import Support from '../components/Support'
import SupportPopup from '../components/SupportPopup'
import { useRevealOnScroll } from '../hooks'
import { profile } from '../data/resume'

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
            <div className="tools-grid">
              <a href="/qr-code-generator/" className="tool-card card reveal">
                <div className="tool-card-top">
                  <span className="skill-icon"><Icon name="qr" /></span>
                  <span className="price-tag-inline">
                    <span className="price-old">₹1000 lifetime</span> <strong>FREE</strong>
                  </span>
                </div>
                <h2>QR Code Generator</h2>
                <p className="muted">
                  QR codes for links, UPI payments, Wi-Fi, WhatsApp, email, phone, SMS and contact cards. Custom
                  colours, PNG &amp; SVG download.
                </p>
                <span className="project-link">
                  Open QR Code Generator <Icon name="arrow" size={14} />
                </span>
              </a>
              <a href="/image-resizer/" className="tool-card card reveal">
                <div className="tool-card-top">
                  <span className="skill-icon"><Icon name="image" /></span>
                  <span className="price-tag-inline">
                    <span className="price-old">₹2000 lifetime</span> <strong>FREE</strong>
                  </span>
                </div>
                <h2>Image Resizer</h2>
                <p className="muted">
                  Resize photos by pixels, percentage or preset, reduce size to any KB, bulk resize and convert JPG, PNG
                  &amp; WebP. Nothing is uploaded.
                </p>
                <span className="project-link">
                  Open Image Resizer <Icon name="arrow" size={14} />
                </span>
              </a>
              <a
                href="https://impreminder.netlify.app/"
                target="_blank"
                rel="noopener"
                className="tool-card card reveal"
              >
                <div className="tool-card-top">
                  <span className="skill-icon"><span aria-hidden="true">🎂</span></span>
                  <span className="price-tag-inline">
                    <span className="price-old">₹500 lifetime</span> <strong>FREE</strong>
                  </span>
                </div>
                <h2>Special Dates — Birthday Reminder</h2>
                <p className="muted">
                  Never miss a birthday, anniversary or special day. Save dates for your family and friends and get
                  reminder notifications. Install it on your phone like an app.
                </p>
                <span className="project-link">
                  Open Birthday Reminder <Icon name="external" size={14} />
                </span>
              </a>
              <a
                href="https://monitorwebsite.netlify.app/"
                target="_blank"
                rel="noopener"
                className="tool-card card reveal"
              >
                <div className="tool-card-top">
                  <span className="skill-icon"><span aria-hidden="true">🟢</span></span>
                  <span className="price-tag-inline">
                    <span className="price-old">₹4000 lifetime</span> <strong>FREE</strong>
                  </span>
                </div>
                <h2>Website Monitor — Server Uptime</h2>
                <p className="muted">
                  Check whether your websites and servers are up or down, and get a notification as soon as one goes
                  down. Install it on your phone like an app.
                </p>
                <span className="project-link">
                  Open Website Monitor <Icon name="external" size={14} />
                </span>
              </a>
              <div className="tool-card tool-card-soon card reveal">
                <span className="skill-icon"><Icon name="star" /></span>
                <h2>More tools coming soon</h2>
                <p className="muted">I'm building more free tools. Have an idea? Email me and I may build it next.</p>
              </div>
            </div>
          </div>
        </section>

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
