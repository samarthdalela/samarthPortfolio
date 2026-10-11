import Icon from './Icon'
import photo from '../assets/samarth.jpg'
import {
  academicProjects,
  achievements,
  certifications,
  education,
  experience,
  interests,
  internships,
  profile,
  skills,
} from '../data/resume'

export function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="section-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p className="section-sub">{children}</p>}
    </div>
  )
}

export function About() {
  const facts = [
    { icon: 'briefcase', label: 'Current role', value: 'Software Developer, NIELIT HQ' },
    { icon: 'cap', label: 'Education', value: 'B.Tech CSE (Hons), 87.9%' },
    { icon: 'pin', label: 'Based in', value: profile.location },
    { icon: 'code', label: 'Focus', value: 'Full-stack, microservices, DevOps' },
  ]
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHead eyebrow="01 · About" title="Building software that stays up, fast and secure" />
        <div className="about-grid">
          <div className="portrait reveal">
            <div className="portrait-frame">
              <img
                src={photo}
                alt="Samarth Dalela, software developer at NIELIT HQ, New Delhi"
                width="480"
                height="600"
                loading="lazy"
              />
            </div>
            <div className="portrait-tag">
              <span className="pulse" />
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.role} · NIELIT HQ</span>
              </div>
            </div>
          </div>
          <div className="about-copy reveal">
            {profile.about.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <div className="interests">
              <span className="muted">When I'm not coding:</span>
              {interests.map((i) => (
                <span key={i} className="pill pill-soft">{i}</span>
              ))}
            </div>
          </div>
          <div className="about-facts">
            {facts.map((f, i) => (
              <div key={f.label} className="fact card reveal" style={{ '--d': `${i * 80}ms` }}>
                <span className="fact-icon"><Icon name={f.icon} /></span>
                <div>
                  <span className="fact-label">{f.label}</span>
                  <span className="fact-value">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Skills() {
  return (
    <section id="skills" className="section section-alt">
      <div className="container">
        <SectionHead eyebrow="02 · Skills" title="Tech I work with every day">
          From the database to the browser to the server it all runs on.
        </SectionHead>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <div key={s.group} className="skill-card card reveal" style={{ '--d': `${(i % 3) * 80}ms` }}>
              <div className="skill-head">
                <span className="skill-icon"><Icon name={s.icon} /></span>
                <h3>{s.group}</h3>
              </div>
              <div className="pills">
                {s.items.map((item) => (
                  <span key={item} className="pill">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHead eyebrow="03 · Experience" title="Where I've been building" />
        <div className="timeline">
          {experience.map((job) => (
            <div key={job.org} className="timeline-item reveal">
              <span className="timeline-dot" />
              <div className="card exp-card">
                <div className="exp-top">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="exp-org">{job.org}</p>
                    <p className="muted">{job.place}</p>
                  </div>
                  <span className="pill pill-accent">{job.duration}</span>
                </div>
                <ul className="checklist">
                  {job.highlights.map((h) => (
                    <li key={h}><Icon name="check" size={18} /> {h}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          <div className="timeline-item reveal">
            <span className="timeline-dot dot-muted" />
            <div className="card exp-card">
              <div className="exp-top">
                <div>
                  <h3>Internships</h3>
                  <p className="muted">MERN, data science, web development &amp; cyber security</p>
                </div>
                <span className="pill">{internships.length} programs</span>
              </div>
              <div className="mini-grid">
                {internships.map((i) => (
                  <div key={i.name + i.org} className="mini">
                    <strong>{i.name}</strong>
                    <span>{i.org}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Education() {
  return (
    <section id="education" className="section section-alt">
      <div className="container">
        <SectionHead eyebrow="05 · Education" title="Education, awards & certifications" />

        <div className="edu-grid">
          {education.map((e, i) => (
            <div key={e.degree} className="edu-card card reveal" style={{ '--d': `${i * 80}ms` }}>
              <div className="edu-score">{e.score}</div>
              <h3>{e.degree}</h3>
              <p>{e.school}</p>
              <p className="muted">{e.board} · {e.year}</p>
            </div>
          ))}
        </div>

        <div className="achieve-row">
          {achievements.map((a) => (
            <div key={a.title} className="achieve card reveal">
              <span className="achieve-icon"><Icon name="trophy" size={26} /></span>
              <div>
                <h3>{a.title}</h3>
                <p className="muted">{a.detail} · {a.year}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="card reveal">
            <h3 className="list-title"><Icon name="award" /> Certifications</h3>
            <ul className="plain-list">
              {certifications.map((c) => (
                <li key={c.name + c.org}><span>{c.name}</span><span className="muted">{c.org}</span></li>
              ))}
            </ul>
          </div>
          <div className="card reveal">
            <h3 className="list-title"><Icon name="star" /> Academic projects</h3>
            <div className="pills">
              {academicProjects.map((p) => (
                <span key={p} className="pill">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const freeTools = [
  { icon: 'qr', name: 'QR Code Generator', text: 'Links, UPI, Wi-Fi, WhatsApp', href: '/qr-code-generator/' },
  { icon: 'image', name: 'Image Resizer', text: 'Resize photos, reduce KB', href: '/image-resizer/' },
  { icon: '🎂', name: 'Birthday Reminder', text: 'Never miss a special day', href: 'https://impreminder.netlify.app/', external: true },
  { icon: '🟢', name: 'Website Monitor', text: 'Know when a site goes down', href: 'https://monitorwebsite.netlify.app/', external: true },
]

export function ToolsTeaser() {
  return (
    <section className="tools-teaser-section" aria-label="Free tools">
      <div className="container">
        <div className="tools-teaser card reveal">
          <div className="tools-teaser-head">
            <div>
              <span className="eyebrow">Free tools · for the community</span>
              <h3>Explore my free tools</h3>
              <p className="muted">
                Built to help everyone — 100% free, no sign-up, no ads. Use them as much as you like.
              </p>
            </div>
            <a href="/services/" className="btn btn-primary">
              Explore all free tools <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="tools-teaser-list">
            {freeTools.map((t) => (
              <a
                key={t.name}
                href={t.href}
                className="tools-teaser-item"
                {...(t.external ? { target: '_blank', rel: 'noopener' } : {})}
              >
                <span className="tools-teaser-icon" aria-hidden="true">
                  {t.icon === 'qr' || t.icon === 'image' ? <Icon name={t.icon} /> : t.icon}
                </span>
                <span>
                  <strong>{t.name}</strong>
                  <span className="muted">{t.text}</span>
                </span>
                <Icon name={t.external ? 'external' : 'arrow'} size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
