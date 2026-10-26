import Header from './Header'
import Footer from './Footer'
import Icon from '../components/Icon'
import { useRevealOnScroll } from '../hooks'
import { profile } from '../data/resume'
import { CHANNEL_URL, VIDEOS_URL, videoFaqs, videos } from '../data/videos'

const PAGE_DESCRIPTION =
  'Free video lectures and tutorial series by Samarth Dalela: React, Blender, Adobe Animate and Adobe Audition explained simply, step by step, for beginners.'

// Structured data for search engines, built from the same list of videos that the page shows.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${VIDEOS_URL}#page`,
      url: VIDEOS_URL,
      name: 'Video lectures by Samarth Dalela',
      description: PAGE_DESCRIPTION,
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://samarthdalela.xyz/#website' },
      author: { '@id': 'https://samarthdalela.xyz/#person' },
      breadcrumb: { '@id': `${VIDEOS_URL}#breadcrumb` },
    },
    ...videos.map((v) => ({
      '@type': 'VideoObject',
      '@id': `${VIDEOS_URL}#${v.id}`,
      name: v.title,
      description: v.description,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      uploadDate: v.uploadDate,
      duration: v.duration,
      embedUrl: `https://www.youtube.com/embed/${v.id}`,
      contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
      author: { '@id': 'https://samarthdalela.xyz/#person' },
    })),
    {
      '@type': 'BreadcrumbList',
      '@id': `${VIDEOS_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Samarth Dalela', item: 'https://samarthdalela.xyz/' },
        { '@type': 'ListItem', position: 2, name: 'Video lectures', item: VIDEOS_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${VIDEOS_URL}#faq`,
      mainEntity: videoFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

function Videos() {
  useRevealOnScroll()
  return (
    <>
      <Header page="videos" />
      <main>
        <section className="services-hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="grid-lines" />
          </div>
          <div className="container services-hero-inner">
            <span className="badge">
              <span className="pulse" /> Free lectures · new videos regularly · by Samarth Dalela
            </span>
            <h1>
              Concepts explained <span className="gradient-text">in my own simple language</span>
            </h1>
            <p className="hero-summary">
              React, Blender, Adobe Animate and Adobe Audition, broken down the way I wish someone had explained them to me — short, clear
              and beginner friendly. I hope these lectures help you understand the concept, not just memorise it.
            </p>
            <div className="hero-badges">
              <a href={CHANNEL_URL} target="_blank" rel="noopener" className="btn btn-primary">
                <Icon name="play" size={18} /> Subscribe on YouTube
              </a>
              <a href="#lectures" className="btn btn-ghost">
                Watch the lectures <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section services-section" id="lectures" aria-label="Video lectures">
          <div className="container">
            <div className="cat-head">
              <span className="tools-teaser-icon" aria-hidden="true"><Icon name="play" /></span>
              <div>
                <div className="cat-title">
                  <h2>All video lectures</h2>
                  <span className="cat-count" aria-label={`${videos.length} videos`}>{videos.length}</span>
                </div>
                <p className="muted">More videos like these are on the way — subscribe so you don’t miss the next one.</p>
              </div>
            </div>

            <div className="video-list">
              {videos.map((v) => (
                <article key={v.id} id={v.id} className="video-card card reveal">
                  <div className="video-frame">
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}${v.playlist ? `?list=${v.playlist}` : ''}`}
                      title={v.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <div className="video-body">
                    <div className="video-meta">
                      <span className="video-topic">{v.topic}</span>
                      {v.playlist && <span className="video-topic video-series">Full series</span>}
                      <span className="muted">{v.playlist ? `Part 1 · ${v.length}` : v.length} min</span>
                    </div>
                    <h3>{v.title}</h3>
                    <p className="muted">{v.description}</p>
                    {v.points?.length > 0 && (
                      <ul className="hire-list video-points">
                        {v.points.map((p) => (
                          <li key={p}>
                            <Icon name="check" size={16} /> {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    {v.playlist ? (
                      <a href={`https://www.youtube.com/playlist?list=${v.playlist}`} target="_blank" rel="noopener" className="project-link">
                        View the full playlist <Icon name="external" size={14} />
                      </a>
                    ) : (
                      <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener" className="project-link">
                        Watch on YouTube <Icon name="external" size={14} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="tools-suggest card">
              <span className="skill-icon"><Icon name="star" /></span>
              <div>
                <h3>More videos coming soon</h3>
                <p className="muted">Stuck on a concept? Tell me — I may explain it in the next lecture.</p>
              </div>
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent('Video lecture request')}`} className="btn btn-ghost">
                <Icon name="mail" size={18} /> Request a topic
              </a>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="faq">
          <div className="container faq-wrap">
            <div className="section-head reveal">
              <span className="eyebrow">FAQ</span>
              <h2>Video lectures — frequently asked questions</h2>
            </div>
            <div className="faq-list">
              {videoFaqs.map((f) => (
                <details key={f.q} className="faq card reveal">
                  <summary>
                    <h3>{f.q}</h3>
                    <Icon name="chevron" size={18} />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </>
  )
}

export default Videos
