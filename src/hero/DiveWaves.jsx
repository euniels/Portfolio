import { useEffect, useRef } from 'react'

const WIDTH = 1440
const HEIGHT = 1000
const SAMPLES = 96
const FOLLOW_RATE = 5
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

// Each height is a percentage of the stage: 100 is below it, 0 is its top.
const WAVES = [
  { amplitude: 105, phases: [1.2, 0.4, 2.0], keys: [[0, 112], [0.22, 50, 'out'], [0.78, 22, 'out'], [1, 8, 'soft']] },
  { amplitude: 85, phases: [3.6, 2.2, 0.7], keys: [[0, 112], [0.18, 112], [0.45, 62, 'out'], [0.72, 46, 'out'], [1, 24, 'soft']] },
  { amplitude: 100, phases: [0.3, 1.5, 3.1], keys: [[0, 112], [0.40, 112], [0.64, 62, 'out'], [0.68, 58, 'soft'], [1, -18, 'soft']] },
]

const easing = {
  out: (t) => 1 - (1 - t) ** 3,
  soft: (t) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2,
  lin: (t) => t,
}

function levelAt(keys, progress) {
  if (progress <= keys[0][0]) return keys[0][1]
  for (let index = 0; index < keys.length - 1; index += 1) {
    const from = keys[index]
    const to = keys[index + 1]
    if (progress <= to[0]) {
      const t = (progress - from[0]) / (to[0] - from[0] || 1)
      return from[1] + (to[1] - from[1]) * easing[to[2] || 'lin'](t)
    }
  }
  return keys[keys.length - 1][1]
}

function edgeShape(x, phase, phases) {
  const u = x / WIDTH * Math.PI * 2
  return 0.62 * Math.sin(u * 0.9 + phases[0] + phase * 0.6)
    + 0.28 * Math.sin(u * 1.8 + phases[1] - phase * 0.8)
    + 0.10 * Math.sin(u * 3.1 + phases[2] + phase * 1.1)
}

function wavePath(level, amplitude, phase, phases) {
  const meanY = level * HEIGHT / 100
  let path = ''
  for (let index = 0; index <= SAMPLES; index += 1) {
    const x = index * WIDTH / SAMPLES
    const y = meanY + amplitude * edgeShape(x, phase, phases)
    path += `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
  }
  return `${path}L${WIDTH},1100L0,1100Z`
}

export function DiveWaves({ transitionRef, stageRef, reduced }) {
  const backRef = useRef(null)
  const middleRef = useRef(null)
  const frontRef = useRef(null)
  const reducedRef = useRef(reduced)
  const wakeRef = useRef(() => {})
  reducedRef.current = reduced

  useEffect(() => {
    const track = transitionRef.current
    const stage = stageRef.current
    const paths = [backRef.current, middleRef.current, frontRef.current]
    if (!track || !stage || paths.some((path) => !path)) return undefined

    const hero = stage.querySelector('.hero-section')
    const header = stage.querySelector('.site-header')
    let trackTop = 0
    let naturalScroll = 0
    let scrollDistance = 1
    let current = 0
    let target = 0
    let phase = 0
    let boost = 0
    let lastY = window.scrollY
    let lastTime = 0
    let lastPaint = 0
    let frame = 0
    let visible = false
    let covered = false

    const readTarget = () => {
      target = clamp((window.scrollY - trackTop - naturalScroll) / scrollDistance)
    }

    const render = () => {
      WAVES.forEach((wave, index) => {
        paths[index].setAttribute('d', wavePath(levelAt(wave.keys, current), wave.amplitude * (1 + 0.25 * boost), phase, wave.phases))
      })
      // Remove controls from tab order once the rising layers obscure them.
      const nextCovered = current >= 0.32
      if (nextCovered !== covered) {
        covered = nextCovered
        if (hero) hero.inert = covered
        if (header) header.inert = covered
      }
    }

    const paint = (now) => {
      frame = 0
      if (!visible || document.hidden) return
      if (lastPaint && now - lastPaint < 16) {
        frame = requestAnimationFrame(paint)
        return
      }

      // A paused tab or an off-screen stage keeps its position and phase.
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60
      lastTime = now
      lastPaint = now
      readTarget()
      current += (target - current) * (1 - Math.exp(-dt * FOLLOW_RATE))

      if (!reducedRef.current) {
        const scrollY = window.scrollY
        const speed = Math.abs(scrollY - lastY) / Math.max(dt, 0.001)
        lastY = scrollY
        boost += (Math.min(speed / 1500, 1.5) - boost) * (1 - Math.exp(-dt * 4))
        phase += dt * (0.45 + boost * 1.4)
      } else {
        lastY = window.scrollY
        boost = 0
      }

      render()
      if (!reducedRef.current || Math.abs(target - current) > 0.0005) frame = requestAnimationFrame(paint)
    }

    const wake = () => {
      if (!visible || document.hidden || frame) return
      lastTime = 0
      lastPaint = 0
      lastY = window.scrollY
      frame = requestAnimationFrame(paint)
    }
    wakeRef.current = wake

    const measure = () => {
      naturalScroll = Math.max(0, stage.offsetHeight - window.innerHeight)
      stage.style.setProperty('--sticky-top', `${-naturalScroll}px`)
      trackTop = track.getBoundingClientRect().top + window.scrollY
      scrollDistance = Math.max(1, track.offsetHeight - stage.offsetHeight)
      readTarget()
      wake()
    }

    const onScroll = () => { readTarget(); wake() }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else wake()
    }

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
      else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }, { threshold: 0.01 })
    const resize = new ResizeObserver(measure)

    resize.observe(track)
    resize.observe(stage)
    intersection.observe(stage)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    document.addEventListener('visibilitychange', onVisibility)
    measure()
    current = target
    render()

    return () => {
      resize.disconnect()
      intersection.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(frame)
      wakeRef.current = () => {}
      stage.style.removeProperty('--sticky-top')
      if (hero) hero.inert = false
      if (header) header.inert = false
    }
  }, [stageRef, transitionRef])

  useEffect(() => { wakeRef.current() }, [reduced])

  return (
    <svg className="dive-waves" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path ref={backRef} className="wave-light" d={wavePath(112, WAVES[0].amplitude, 0, WAVES[0].phases)} />
      <path ref={middleRef} className="wave-mid" d={wavePath(112, WAVES[1].amplitude, 0, WAVES[1].phases)} />
      <path ref={frontRef} className="wave-deep" d={wavePath(112, WAVES[2].amplitude, 0, WAVES[2].phases)} />
    </svg>
  )
}
