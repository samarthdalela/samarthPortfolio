import Icon from '../components/Icon'
import { profile } from '../data/resume'

const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-name">
            {profile.name} — {profile.role}, {profile.location}
          </p>
          <p className="muted">
            © {year} Samarth Dalela · <a href={`mailto:${profile.email}`}>{profile.email}</a> ·{' '}
            <a href={profile.resume} download>Resume (PDF)</a> ·{' '}
            <a href="/qr-code-generator/">Free QR Code Generator</a> ·{' '}
            <a href="/wifi-qr-code-generator/">WiFi QR Code Generator</a> ·{' '}
            <a href="/image-resizer/">Free Image Resizer</a> ·{' '}
            <a href="/image-to-pdf/">Image to PDF Converter</a> ·{' '}
            <a href="/pdf-to-image/">PDF to Image Converter</a> ·{' '}
            <a href="/word-to-pdf/">Word to PDF Converter</a> ·{' '}
            <a href="/pdf-to-word/">PDF to Word Converter</a> ·{' '}
            <a href="/videos/">Video Lectures</a> ·{' '}
            <a href="/image-to-base64/">Image to Base64</a>
          </p>
        </div>
        <a href="#top" className="icon-btn" aria-label="Back to top">
          <Icon name="arrowUp" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
