import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { useActiveSection, useTheme } from '../hooks'
import { profile } from '../data/resume'

const links = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]
const sectionIds = ['home', ...links.map((l) => l.id)]

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [, toggleTheme] = useTheme()
  const active = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(window.scrollY > 20)
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <div className="container header-inner">
        <a href="#home" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">{profile.initials}</span>
          <span className="logo-text">{profile.name.split(' ')[0]}<span className="accent">.dev</span></span>
        </a>

        <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="Main">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a href={profile.resume} download className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            <Icon name="download" size={16} /> Resume
          </a>
        </nav>

        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle colour theme">
            {/* Both icons render; CSS shows the one for the current theme (keeps pre-rendered HTML identical). */}
            <Icon name="sun" className="when-dark" />
            <Icon name="moon" className="when-light" />
          </button>
          <button
            className="icon-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
