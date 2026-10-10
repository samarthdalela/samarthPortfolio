import Icon from './Icon'
import { useCountUp, useTypewriter } from '../hooks'
import { profile, stats } from '../data/resume'
import Terminal from './Terminal'

function Stat({ value, suffix, label, decimals = 0 }) {
  const [ref, current] = useCountUp(value, decimals)
  return (
    <div className="stat" ref={ref}>
      <span className="stat-value">
        {current.toFixed(decimals)}
        <span className="accent">{suffix}</span>
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function Hero() {
  const typed = useTypewriter(profile.roles)

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section id="home" className="hero" onMouseMove={onMove}>
      <div className="hero-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-lines" />
        <div className="spotlight" />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="badge">
            <span className="pulse" /> Open to new opportunities
          </span>
          <h1>
            Hi, I'm <span className="gradient-text">{profile.name}</span>
          </h1>
          <p className="hero-role">
            <span className="muted">I'm a</span> <span className="typed" aria-hidden="true">{typed}</span>
            <span className="caret" />
            <span className="sr-only">{profile.roles.join(', ')}</span>
          </p>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-ctas">
            <a href="#projects" className="btn btn-primary">
              View my work <Icon name="arrow" size={18} />
            </a>
            <a href={profile.resume} download className="btn btn-ghost">
              <Icon name="download" size={18} /> Download resume
            </a>
          </div>
          <div className="hero-meta">
            <span><Icon name="pin" size={16} /> {profile.location}</span>
            <span><Icon name="mail" size={16} /> {profile.email}</span>
          </div>
        </div>

        <div className="hero-visual">
          <Terminal />
          <div className="floating-chip chip-1">⚡ Kafka</div>
          <div className="floating-chip chip-2">🛡️ OWASP</div>
          <div className="floating-chip chip-3">🐬 MySQL</div>
        </div>
      </div>

      <div className="container">
        <div className="stats">
          {stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
