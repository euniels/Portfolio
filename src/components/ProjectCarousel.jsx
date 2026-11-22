import { useEffect, useRef, useState } from 'react'

const SLIDE_INTERVAL_MS = 4800
const SWIPE_THRESHOLD_PX = 42

export function ProjectCarousel({ project, large = false, reduced = false }) {
  const images = project.gallery
  const hasMultiple = images.length > 1
  const slides = hasMultiple ? [images[images.length - 1], ...images, images[0]] : images
  const rootRef = useRef(null)
  const viewportRef = useRef(null)
  const pointerRef = useRef(null)
  const [trackIndex, setTrackIndex] = useState(hasMultiple ? 1 : 0)
  const [animate, setAnimate] = useState(true)
  const [drag, setDrag] = useState(0)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)

  const current = hasMultiple ? (trackIndex - 1 + images.length) % images.length : 0

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 })
    observer.observe(rootRef.current)
    const onVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!hasMultiple || !visible || !pageVisible || active || reduced || pointerRef.current) return undefined
    const timer = window.setInterval(() => setTrackIndex((index) => index + 1), SLIDE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [hasMultiple, visible, pageVisible, active, reduced])

  const finishLoop = () => {
    if (!hasMultiple || (trackIndex !== 0 && trackIndex !== images.length + 1)) return
    setAnimate(false)
    setTrackIndex(trackIndex === 0 ? images.length : 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
  }

  const goTo = (index) => {
    setAnimate(true)
    setTrackIndex(hasMultiple ? index + 1 : 0)
  }

  const onPointerDown = (event) => {
    if (!hasMultiple || event.button !== 0 || pointerRef.current) return
    pointerRef.current = { id: event.pointerId, start: event.clientX, width: viewportRef.current.clientWidth }
    viewportRef.current.setPointerCapture(event.pointerId)
    setAnimate(false)
    setActive(true)
    event.preventDefault()
  }

  const onPointerMove = (event) => {
    if (pointerRef.current?.id !== event.pointerId) return
    const width = pointerRef.current.width
    setDrag(Math.max(-width, Math.min(width, event.clientX - pointerRef.current.start)))
  }

  const onPointerEnd = (event, cancelled = false) => {
    if (pointerRef.current?.id !== event.pointerId) return
    const distance = event.clientX - pointerRef.current.start
    const threshold = Math.min(SWIPE_THRESHOLD_PX, pointerRef.current.width * 0.12)
    pointerRef.current = null
    setDrag(0)
    setAnimate(true)
    setActive(false)
    if (!cancelled && Math.abs(distance) > threshold) setTrackIndex((index) => Math.max(0, Math.min(images.length + 1, index + (distance < 0 ? 1 : -1))))
  }

  return (
    <div ref={rootRef} className={`project-carousel ${large ? 'project-carousel-large' : ''} ${hasMultiple ? '' : 'is-single'}`} role="region" aria-roledescription="carousel" aria-label={`${project.name} project visuals`} onMouseEnter={() => setActive(true)} onMouseLeave={() => { if (!pointerRef.current) setActive(false) }} onFocusCapture={() => setActive(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(false) }}>
      <div ref={viewportRef} className="project-carousel-viewport" tabIndex={hasMultiple ? 0 : undefined} aria-label={hasMultiple ? 'Swipe screenshots or use the dots below' : images[0].alt} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={(event) => onPointerEnd(event, true)} onContextMenu={(event) => event.preventDefault()} onKeyDown={(event) => {
        if (!hasMultiple) return
        if (event.key === 'ArrowRight') { event.preventDefault(); setTrackIndex((index) => Math.min(images.length + 1, index + 1)) }
        if (event.key === 'ArrowLeft') { event.preventDefault(); setTrackIndex((index) => Math.max(0, index - 1)) }
      }}>
        <div className="project-carousel-track" style={{ transform: `translate3d(calc(-${trackIndex * 100}% + ${drag}px), 0, 0)`, transition: animate ? undefined : 'none' }} onTransitionEnd={finishLoop}>
          {slides.map((image, index) => (
            <figure className="project-carousel-slide" key={`${image.src}-${index}`} aria-hidden={index !== trackIndex}>
              <img src={image.src} alt={index === trackIndex ? image.alt : ''} draggable="false" loading={index > 2 ? 'lazy' : 'eager'} decoding="async" />
            </figure>
          ))}
        </div>
        <span className="project-carousel-caption" aria-live="off">{images[current].caption}</span>
      </div>
      <div className="project-carousel-dots" aria-label="Choose project visual">
        {images.map((image, index) => (
          <button key={image.src} type="button" className={index === current ? 'is-active' : ''} aria-label={`Show ${image.caption}`} aria-pressed={index === current} disabled={!hasMultiple} onClick={() => goTo(index)} />
        ))}
      </div>
    </div>
  )
}
