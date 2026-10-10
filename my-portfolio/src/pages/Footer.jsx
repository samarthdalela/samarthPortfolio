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
            <a href={profile.resume} download>Resume (PDF)</a>
          </p>
        </div>
        <a href="#home" className="icon-btn" aria-label="Back to top">
          <Icon name="arrowUp" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
