import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Download, Mail, Menu, X } from 'lucide-react'
import { portfolio } from './data/portfolio.js'
import { SkillsPool } from './skills/SkillsPool.jsx'
import { WaterBlob } from './hero/WaterBlob.jsx'
import { DiveWaves } from './hero/DiveWaves.jsx'
import { ProjectCarousel } from './components/ProjectCarousel.jsx'
import './components/ProjectCarousel.css'

const isReadyLink = (value) => Boolean(value && !value.startsWith('['))
const projectPath = (slug) => `/projects/${slug}`

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

function useReveals(reduced) {
  useEffect(() => {
    if (reduced || !('IntersectionObserver' in window)) return undefined
    const targets = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08 })
    targets.forEach((target) => observer.observe(target))
    document.documentElement.classList.add('motion-ready')
    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('motion-ready')
    }
  }, [reduced])
}

function Header({ isProject = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const prefix = isProject ? '/' : ''

  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <a className="brand" href="/" aria-label={`${portfolio.name}'s portfolio, home`}>Portfolio</a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav id="primary-nav" className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {portfolio.copy.navigation.map(({ label, anchor }) => <a key={anchor} href={`${prefix}#${anchor}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
      </div>
    </header>
  )
}

function WaveDivider({ className = '' }) {
  return (
    <svg className={`wave-divider ${className}`} viewBox="0 0 1440 72" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 36C195 12 335 70 535 43C773 9 899 51 1110 32C1249 19 1358 29 1440 39V72H0Z" />
    </svg>
  )
}

function HeroScene({ reduced, contentRef, layoutRef }) {
  const holderRef = useRef(null)
  const [nudgeSignal, setNudgeSignal] = useState(0)

  useEffect(() => {
    const content = contentRef.current
    const layout = layoutRef.current
    const holder = holderRef.current
    if (!content || !layout || !holder) return undefined
    const measure = () => {
      const contentRect = content.getBoundingClientRect()
      const layoutRect = layout.getBoundingClientRect()
      // Measure the fixed resting path, so animation cannot alter layout.
      const restingBounds = holder.querySelector('[data-blob-rest]')?.getBBox()
      const outerHeight = contentRect.height * 1.04 * 600 / (restingBounds?.height || 480)
      holder.style.setProperty('--blob-width', `${(outerHeight * 5 / 6).toFixed(2)}px`)
      holder.style.setProperty('--blob-top', `${(contentRect.top - layoutRect.top - outerHeight * (restingBounds?.y || 65) / 600).toFixed(2)}px`)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    observer.observe(layout)
    window.addEventListener('resize', measure)
    measure()
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [contentRef, layoutRef])

  return (
    <div ref={holderRef} className="water-blob-holder">
      <div className="portrait-orbs" aria-hidden="true"><span /><span /><span /><span /></div>
      <WaterBlob name={portfolio.name} role={portfolio.role} reduced={reduced} nudgeSignal={nudgeSignal} />
    </div>
  )
}

function ResumeAction() {
  // TODO: Show this action only after an actual resume PDF path is provided.
  if (!isReadyLink(portfolio.resumePath)) return null
  return <a className="button button-outline" href={portfolio.resumePath} download><Download size={17} /> {portfolio.copy.downloadResume}</a>
}

function Hero({ reduced }) {
  const contentRef = useRef(null)
  const layoutRef = useRef(null)
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-heading">
      <div ref={layoutRef} className="wrap hero-layout">
        <div ref={contentRef} className="hero-copy">
          <p className="availability"><span className="availability-dot" />{portfolio.availability}</p>
          <h1 id="hero-heading">{portfolio.name}</h1>
          <p className="hero-value">{portfolio.tagline}</p>
          <ul className="hero-tech" aria-label="Core technologies">
            {['React', 'Flutter', 'Laravel', 'Firebase'].map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
          <div className="hero-actions">
            <a className="button button-solid" href="#projects">{portfolio.copy.viewProjects} <ArrowRight size={18} /></a>
            <a className="button button-outline" href="#contact">Contact me</a>
            <ResumeAction />
          </div>
        </div>
        <HeroScene reduced={reduced} contentRef={contentRef} layoutRef={layoutRef} />
      </div>
      <a className="scroll-cue" href="#about">{portfolio.copy.scrollCue} <ArrowDown size={17} /></a>
    </section>
  )
}

function HeroTransition({ reduced }) {
  const transitionRef = useRef(null)
  const stageRef = useRef(null)

  return (
    <div ref={transitionRef} className="hero-transition">
      <div ref={stageRef} className="hero-sticky-stage">
        <Header />
        <Hero reduced={reduced} />
        <DiveWaves transitionRef={transitionRef} stageRef={stageRef} reduced={reduced} />
      </div>
    </div>
  )
}

function About() {
  return (
    <section id="about" className="about-section section-light" aria-labelledby="about-heading">
      <span className="depth-orb" aria-hidden="true" />
      <div className="wrap about-layout">
        <div><p className="section-kicker">{portfolio.copy.aboutKicker}</p><h2 id="about-heading">{portfolio.copy.aboutHeading}</h2></div>
        <div className="about-body">
          <p className="lead">{portfolio.about.lead}</p>
          {portfolio.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  )
}

function MockPreview({ project, large = false }) {
  if (project.previewImage) {
    return (
      <div className={`mock-preview mock-image-preview ${large ? 'mock-large' : ''}`}>
        <img src={project.previewImage} alt={project.preview} loading={large ? 'eager' : 'lazy'} />
        <span className="mock-caption">{project.preview}</span>
      </div>
    )
  }

  return (
    <div className={`mock-preview mock-${project.previewType} ${large ? 'mock-large' : ''}`} role="img" aria-label={project.preview}>
      <div className="mock-window">
        <div className="mock-topbar"><i /><i /><i /><span /></div>
        <div className="mock-content">
          <div className="mock-sidebar"><b /><b /><b /><b /></div>
          <div className="mock-main">
            <div className="mock-heading" />
            <div className="mock-chart"><span /><span /><span /><span /><span /></div>
            <div className="mock-rows"><i /><i /><i /></div>
          </div>
        </div>
      </div>
      <span className="mock-caption">{project.preview}</span>
    </div>
  )
}

function Projects({ reduced }) {
  return (
    <section id="projects" className="projects-section section-light" aria-labelledby="projects-heading">
      <div className="wrap">
        <div className="section-intro" data-reveal>
          <div><p className="section-kicker">{portfolio.copy.projectsKicker}</p><h2 id="projects-heading">{portfolio.copy.projectsHeading}</h2></div>
          <p>{portfolio.copy.projectsIntro}</p>
        </div>
        <div className="project-list">
          {portfolio.projects.map((project, index) => (
            <article className="project-row" key={project.slug} data-reveal>
              {project.gallery?.length
                ? <div className="project-media"><ProjectCarousel project={project} reduced={reduced} /></div>
                : <a className="project-preview-link" href={projectPath(project.slug)} aria-label={`Read the ${project.name} case study`}><MockPreview project={project} /></a>}
              <div className="project-copy">
                <span className="project-index">0{index + 1} / 0{portfolio.projects.length}</span>
                <p className="project-category">{project.category} · {project.year}</p>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
                <p className="project-role">My role: {project.role}</p>
                <a className="text-link" href={projectPath(project.slug)}>Explore case study <ArrowUpRight size={18} /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Expertise({ reduced }) {
  return (
    <section id="expertise" className="expertise-section section-dark" aria-labelledby="expertise-heading">
      <div className="wrap">
        <div className="section-intro dark-intro" data-reveal>
          <div><p className="section-kicker">{portfolio.copy.expertiseKicker}</p><h2 id="expertise-heading">{portfolio.copy.expertiseHeading}</h2></div>
          <p>{portfolio.copy.expertiseIntro}</p>
        </div>
        <SkillsPool reduced={reduced} />
        <div className="skill-groups" aria-label="Complete expertise list" data-reveal>
          {portfolio.expertise.map(({ group, skills }) => (
            <div className="skill-group" key={group}>
              <h3>{group}</h3>
              <ul>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Journey() {
  return (
    <section id="journey" className="journey-section section-dark" aria-labelledby="journey-heading">
      <div className="wrap journey-layout">
        <div className="journey-heading" data-reveal><p className="section-kicker">{portfolio.copy.journeyKicker}</p><h2 id="journey-heading">{portfolio.copy.journeyHeading}</h2></div>
        <div>
          <ol className="timeline">
            {portfolio.timeline.map((item) => (
              <li key={`${item.period}-${item.title}`} data-reveal>
                <span className="timeline-dot" aria-hidden="true" />
                <div className="timeline-meta"><span>{item.type}</span><span>{item.period}</span></div>
                <h3>{item.title}</h3>
                <p>{item.place}</p>
                {item.detail && <p className="timeline-detail">{item.detail}</p>}
              </li>
            ))}
          </ol>
          <div className="recognition" data-reveal>
            <h3>Selected recognition</h3>
            <ul>{portfolio.recognition.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Seminar() {
  return (
    <section className="seminar-section section-dark" aria-labelledby="seminar-heading">
      <div className="wrap seminar-layout" data-reveal>
        <div><p className="section-kicker">{portfolio.copy.seminarKicker}</p><h2 id="seminar-heading">{portfolio.copy.seminarHeading}</h2></div>
        <div className="seminar-detail"><span>2026</span><h3>{portfolio.seminar.title}</h3><p>{portfolio.seminar.organizer}</p></div>
      </div>
    </section>
  )
}

function ContactLink({ label, href, icon: Icon }) {
  if (!isReadyLink(href)) return <span className="contact-link pending-link"><Icon size={20} /><span>{label}</span><small>{href}</small></span>
  return <a className="contact-link" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}><Icon size={20} /><span>{label}</span><ArrowUpRight size={18} /></a>
}

function Contact() {
  return (
    <section id="contact" className="contact-section section-dark" aria-labelledby="contact-heading">
      <div className="wrap contact-layout" data-reveal>
        <div><p className="section-kicker">{portfolio.copy.contactKicker}</p><h2 id="contact-heading">{portfolio.copy.contactHeading}</h2><p>{portfolio.copy.contactIntro}</p></div>
        <div className="contact-links">
          <ContactLink label="Email" href={isReadyLink(portfolio.email) ? `mailto:${portfolio.email}` : portfolio.email} icon={Mail} />
          <ContactLink label="GitHub" href={portfolio.githubUrl} icon={ArrowUpRight} />
          <ContactLink label="LinkedIn" href={portfolio.linkedinUrl} icon={ArrowUpRight} />
        </div>
      </div>
      <footer className="site-footer wrap"><span>{portfolio.name}</span><span>{portfolio.copy.footerNote}</span><a href="#top">{portfolio.copy.backToSurface} ↑</a></footer>
    </section>
  )
}

function Home() {
  const reduced = useReducedMotion()
  useReveals(reduced)

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <main id="main">
        <HeroTransition reduced={reduced} />
        <About />
        <Projects reduced={reduced} />
        <WaveDivider className="to-dark" />
        <Expertise reduced={reduced} />
        <Journey />
        <Seminar />
        <Contact />
      </main>
    </>
  )
}

function CaseLink({ value, label }) {
  return isReadyLink(value)
    ? <a className="button button-outline-dark" href={value} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={17} /></a>
    : <span className="button button-outline-dark button-pending">{label} <small>Link pending</small></span>
}

function CaseStudy({ project }) {
  const reduced = useReducedMotion()
  useReveals(reduced)

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header isProject />
      <main id="main" className="case-page">
        <section className="case-hero section-light">
          <div className="wrap">
            <a className="back-link" href="/#projects"><ArrowLeft size={18} /> {portfolio.copy.caseBack}</a>
            <p className="section-kicker">{project.category} · {project.year}</p>
            <h1>{project.name}</h1>
            <p className="case-summary">{project.summary}</p>
            <div className="case-facts"><div><span>Status</span><strong>{project.status}</strong></div><div><span>My role</span><strong>{project.role}</strong></div></div>
            {project.gallery?.length ? <ProjectCarousel project={project} large reduced={reduced} /> : <MockPreview project={project} large />}
          </div>
        </section>
        {project.teaserOnly ? <section className="case-body section-light"><div className="wrap case-teaser"><h2>More to come.</h2><p>Recurra is still in development. I will share the full case study when the project is ready.</p></div></section> : <section className="case-body section-light">
          <div className="wrap case-layout">
            <aside className="case-sidebar"><p className="section-kicker">{portfolio.copy.caseOverview}</p><h2>{portfolio.copy.caseOverviewHeading}</h2><div className="stack-list"><h3>{portfolio.copy.caseStack}</h3><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></div></aside>
            <div className="case-sections">
              <section><h3>{portfolio.copy.caseProblem}</h3><p>{project.problem}</p></section>
              <section><h3>{portfolio.copy.caseApproach}</h3><ul>{project.approach.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section><h3>{portfolio.copy.caseChallenges}</h3><p>{project.challenges}</p></section>
              <section><h3>{portfolio.copy.caseOutcome}</h3><p>{project.outcome}</p></section>
              <section><h3>{portfolio.copy.caseRetrospective}</h3><p>{project.retrospective}</p></section>
              {project.screenshots && <p className="case-note">{portfolio.copy.caseScreenshots}: {project.screenshots}. {portfolio.copy.caseMockNote}</p>}
              {(project.liveUrl || project.repoUrl) && <div className="case-links">{project.liveUrl && <CaseLink value={project.liveUrl} label={project.liveLabel || portfolio.copy.caseLive} />}{project.repoUrl && <CaseLink value={project.repoUrl} label={portfolio.copy.caseRepo} />}</div>}
            </div>
          </div>
        </section>}
        <section className="case-next section-dark"><div className="wrap"><p className="section-kicker">{portfolio.copy.caseNextKicker}</p><a href="/#projects">{portfolio.copy.caseNext} <ArrowRight size={22} /></a></div></section>
      </main>
      <footer className="case-footer"><div className="wrap"><span>{portfolio.name}</span><a href="/#contact">Contact me <ArrowUpRight size={16} /></a></div></footer>
    </>
  )
}

export function App() {
  const path = window.location.pathname.replace(/\/$/, '')
  const project = portfolio.projects.find(({ slug }) => path === projectPath(slug))
  return project ? <CaseStudy project={project} /> : <Home />
}
