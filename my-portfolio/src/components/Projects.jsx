import { useState } from 'react'
import Icon from './Icon'
import { SectionHead } from './Sections'
import { categories, projects } from '../data/resume'

function ProjectCard({ project, index }) {
  const [open, setOpen] = useState(false)

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <article
      className={`project card ${project.featured ? 'is-featured' : ''} ${open ? 'is-open' : ''}`}
      onMouseMove={onMove}
    >
      <div className="project-top">
        <span className="project-num">{String(index + 1).padStart(2, '0')}</span>
        {project.featured && <span className="pill pill-accent">Featured</span>}
      </div>
      <h3>{project.title}</h3>
      {project.org && <p className="project-org">{project.org}</p>}
      <p className="project-summary">{project.summary}</p>
      <div className="pills">
        {project.stack.map((s) => (
          <span key={s} className="pill pill-soft">{s}</span>
        ))}
      </div>
      <div className="project-details" aria-hidden={!open}>
        <ul className="checklist">
          {project.points.map((p) => (
            <li key={p}><Icon name="check" size={16} /> {p}</li>
          ))}
        </ul>
      </div>
      <div className="project-footer">
        <button className="project-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show less' : 'Show details'} <Icon name="chevron" size={16} />
        </button>
        <div className="project-links">
          {project.links ? (
            project.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="project-link">
                {l.label} <Icon name="external" size={14} />
              </a>
            ))
          ) : (
            <span className="project-private" title="Not publicly accessible">
              <Icon name="lock" size={14} /> {project.internal || 'Internal system'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function Projects() {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? projects : projects.filter((p) => p.categories.includes(filter))

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHead eyebrow="04 · Projects" title="Things I've shipped">
          {projects.length} projects across AI, full-stack, architecture, DevOps and security. Live sites link out; internal systems are marked with a lock.
        </SectionHead>

        <div className="filters reveal" role="tablist" aria-label="Filter projects">
          {categories.map((c) => {
            const count = c === 'All' ? projects.length : projects.filter((p) => p.categories.includes(c)).length
            return (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                className={`filter ${filter === c ? 'is-active' : ''}`}
                onClick={() => setFilter(c)}
              >
                {c} <span className="filter-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="projects-grid" key={filter}>
          {visible.map((p) => (
            <ProjectCard key={p.title} project={p} index={projects.indexOf(p)} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
