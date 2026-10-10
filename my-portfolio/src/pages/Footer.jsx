import Icon from '../components/Icon'
import { profile } from '../data/resume'

const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {year} {profile.name}. Built with React &amp; Vite.
        </p>
        <a href="#home" className="icon-btn" aria-label="Back to top">
          <Icon name="arrowUp" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
