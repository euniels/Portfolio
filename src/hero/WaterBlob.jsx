import { useEffect, useRef } from 'react'
import portraitSource from '../images/pic.png'

// Visual and motion controls. The SVG viewBox stays fixed; the resting outline sets layout size.
const PHOTO_SRC = portraitSource
// The image fits inside the white backing, keeping its edges outside the blob.
const PHOTO_FRAME = { x: 0, y: 0, width: 500, height: 600 }
const POINT_COUNT = 12
const BASE_RADIUS = { x: 200, y: 235 }
const SPRING_STIFFNESS = 90
const SPRING_DAMPING = 9
const NEIGHBOR_COUPLING = 24
const IDLE_WOBBLE_STRENGTH = 2.2
const IDLE_WOBBLE_SPEED = 1.05
const POINTER_PUSH_STRENGTH = 5.5
const MAX_DISPLACEMENT = 0.15
const FLOAT_AMPLITUDE = 8
const OUTLINE_COLOR = '#5B91A3'
const OUTLINE_WIDTH = 2.2
const SHADOW_COLOR = '#2F4A63'
const SHADOW_OPACITY = 0.16

const CENTER = { x: 250, y: 300 }
const VIEW_SIZE = { width: 500, height: 600 }
const BASE_FACTOR_SAMPLES = [1.025, 0.98, 0.965, 1.035, 1.06, 1.005, 0.985, 0.935, 0.985, 1.035, 1.065, 0.985]
const TWO_PI = Math.PI * 2
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const softLimit = (value, bound) => bound * Math.tanh(value / bound)

function baseFactor(index) {
  const position = index * BASE_FACTOR_SAMPLES.length / POINT_COUNT
  const first = Math.floor(position)
  const fraction = position - first
  return BASE_FACTOR_SAMPLES[first] * (1 - fraction) + BASE_FACTOR_SAMPLES[(first + 1) % BASE_FACTOR_SAMPLES.length] * fraction
}

function pointsFor(offsets) {
  return Array.from({ length: POINT_COUNT }, (_, index) => {
    const angle = -Math.PI / 2 + index * TWO_PI / POINT_COUNT
    const radius = baseFactor(index) + offsets[index]
    return {
      x: CENTER.x + Math.cos(angle) * BASE_RADIUS.x * radius,
      y: CENTER.y + Math.sin(angle) * BASE_RADIUS.y * radius,
    }
  })
}

function closedCurve(points) {
  const n = points.length
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let index = 0; index < n; index += 1) {
    const previous = points[(index - 1 + n) % n]
    const current = points[index]
    const next = points[(index + 1) % n]
    const after = points[(index + 2) % n]
    const c1x = current.x + (next.x - previous.x) / 6
    const c1y = current.y + (next.y - previous.y) / 6
    const c2x = next.x - (after.x - current.x) / 6
    const c2y = next.y - (after.y - current.y) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`
  }
  return `${d} Z`
}

const REST_PATH = closedCurve(pointsFor(Array(POINT_COUNT).fill(0)))

function createMotion() {
  return {
    offsets: Array(POINT_COUNT).fill(0),
    velocities: Array(POINT_COUNT).fill(0),
    ripples: [],
    phase: 0,
    x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0,
    pointer: null, hover: null, lastHoverRipple: 0,
  }
}

function addRipple(motion, origin, strength = 1) {
  motion.ripples.push({ origin, age: 0, strength })
  if (motion.ripples.length > 4) motion.ripples.shift()
  const center = Math.round(origin) % POINT_COUNT
  motion.velocities[center] += 0.42 * strength
  motion.velocities[(center + POINT_COUNT - 1) % POINT_COUNT] += 0.18 * strength
  motion.velocities[(center + 1) % POINT_COUNT] += 0.18 * strength
}

function localPoint(event, svg) {
  const rect = svg.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * VIEW_SIZE.width / rect.width,
    y: (event.clientY - rect.top) * VIEW_SIZE.height / rect.height,
  }
}

function pointIndex(point) {
  const angle = Math.atan2((point.y - CENTER.y) / BASE_RADIUS.y, (point.x - CENTER.x) / BASE_RADIUS.x)
  return ((angle + Math.PI / 2 + TWO_PI) % TWO_PI) / TWO_PI * POINT_COUNT
}

function advance(motion, dt, reduced) {
  const previous = motion.offsets.slice()
    const hoverIndex = motion.hover === null ? null : pointIndex(motion.hover)
  motion.ripples = motion.ripples.filter((ripple) => ripple.age < 1.7)
  motion.ripples.forEach((ripple) => { ripple.age += dt })

  for (let index = 0; index < POINT_COUNT; index += 1) {
    const neighbor = (previous[(index + POINT_COUNT - 1) % POINT_COUNT] + previous[(index + 1) % POINT_COUNT]) / 2
    let force = -SPRING_STIFFNESS * previous[index] - SPRING_DAMPING * motion.velocities[index] + NEIGHBOR_COUPLING * (neighbor - previous[index])
    if (!reduced) {
      force += IDLE_WOBBLE_STRENGTH * (Math.sin(motion.phase * IDLE_WOBBLE_SPEED + index * 1.43) + 0.35 * Math.sin(motion.phase * 0.57 + index * 2.19))
      const nearHover = hoverIndex === null ? Infinity : Math.min(Math.abs(index - hoverIndex), POINT_COUNT - Math.abs(index - hoverIndex))
      if (nearHover < 2) force += POINTER_PUSH_STRENGTH * Math.exp(-nearHover * nearHover * 1.4)
      motion.ripples.forEach((ripple) => {
        const apart = Math.abs(index - ripple.origin)
        const distance = Math.min(apart, POINT_COUNT - apart)
        const front = ripple.age * 4.5
        force += ripple.strength * 8 * Math.exp(-(((distance - front) / 0.8) ** 2)) * Math.exp(-ripple.age * 1.6)
      })
    }
    motion.velocities[index] += force * dt
    motion.offsets[index] = clamp(previous[index] + motion.velocities[index] * dt, -MAX_DISPLACEMENT, MAX_DISPLACEMENT)
    if (Math.abs(motion.offsets[index]) === MAX_DISPLACEMENT) motion.velocities[index] = 0
  }

  const stiffness = motion.pointer?.dragging ? 65 : 31
  const damping = reduced ? 17 : 8.5
  motion.vx += ((motion.targetX - motion.x) * stiffness - motion.vx * damping) * dt
  motion.vy += ((motion.targetY - motion.y) * stiffness - motion.vy * damping) * dt
  motion.x = clamp(motion.x + motion.vx * dt, -42, 42)
  motion.y = clamp(motion.y + motion.vy * dt, -30, 30)
}

export function WaterBlob({ name, role, reduced, nudgeSignal }) {
  const holderRef = useRef(null)
  const svgRef = useRef(null)
  const clipRef = useRef(null)
  const outlineRef = useRef(null)
  const hitRef = useRef(null)
  const shadowRef = useRef(null)
  const groupRef = useRef(null)
  const photoRef = useRef(null)
  const motionRef = useRef(null)
  const wakeRef = useRef(() => {})
  const reducedRef = useRef(reduced)
  const lastNudgeRef = useRef(nudgeSignal)
  if (!motionRef.current) motionRef.current = createMotion()
  reducedRef.current = reduced

  useEffect(() => {
    const holder = holderRef.current
    let inView = false
    let frame = 0
    let last = 0
    let lastPaint = 0
    const motion = motionRef.current

    const paint = (now) => {
      frame = 0
      if (!inView || document.visibilityState !== 'visible') return
      if (lastPaint && now - lastPaint < (reducedRef.current ? 60 : 16)) {
        frame = requestAnimationFrame(paint)
        return
      }
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 60) : 1 / 60
      last = now
      lastPaint = now
      motion.phase += dt
      advance(motion, dt, reducedRef.current)
      const path = closedCurve(pointsFor(motion.offsets))
      clipRef.current?.setAttribute('d', path)
      outlineRef.current?.setAttribute('d', path)
      hitRef.current?.setAttribute('d', path)
      shadowRef.current?.setAttribute('d', path)
      const bob = Math.sin(motion.phase * (reducedRef.current ? 0.23 : 0.8)) * (reducedRef.current ? 1.5 : FLOAT_AMPLITUDE)
      const turn = reducedRef.current ? 0 : Math.sin(motion.phase * 0.67) * 2.6 + clamp(motion.vx * 0.065, -1.4, 1.4)
      groupRef.current?.setAttribute('transform', `translate(${motion.x.toFixed(2)} ${(motion.y + bob).toFixed(2)}) rotate(${clamp(turn, -4, 4).toFixed(2)} ${CENTER.x} ${CENTER.y})`)
      photoRef.current?.setAttribute('transform', `translate(${clamp(-motion.x * 0.22, -10, 10).toFixed(2)} ${clamp(-motion.y * 0.22, -10, 10).toFixed(2)})`)
      if (shadowRef.current) shadowRef.current.style.opacity = String(clamp(SHADOW_OPACITY - Math.max(0, -motion.y - bob) * 0.003, 0.07, SHADOW_OPACITY))
      frame = requestAnimationFrame(paint)
    }
    const wake = () => { if (inView && document.visibilityState === 'visible' && !frame) frame = requestAnimationFrame(paint) }
    wakeRef.current = wake
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      last = 0
      lastPaint = 0
      if (inView) wake()
      else { cancelAnimationFrame(frame); frame = 0 }
    }, { threshold: 0.01 })
    visibility.observe(holder)
    const onVisibility = () => {
      last = 0
      lastPaint = 0
      if (document.visibilityState === 'visible') wake()
      else { cancelAnimationFrame(frame); frame = 0 }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(frame)
      wakeRef.current = () => {}
    }
  }, [])

  useEffect(() => {
    if (nudgeSignal === lastNudgeRef.current) return
    lastNudgeRef.current = nudgeSignal
    const motion = motionRef.current
    motion.vx += 27
    motion.vy -= 15
    if (!reducedRef.current) addRipple(motion, 9.5, 0.8)
    wakeRef.current()
  }, [nudgeSignal])

  const pointerDown = (event) => {
    if (event.target !== hitRef.current || (event.pointerType === 'mouse' && event.button !== 0)) return
    const motion = motionRef.current
    if (motion.pointer) return
    event.preventDefault()
    motion.pointer = { id: event.pointerId, type: event.pointerType, startX: event.clientX, startY: event.clientY, originX: motion.x, originY: motion.y, dragging: event.pointerType === 'mouse' }
    if (event.pointerType === 'mouse') event.currentTarget.setPointerCapture(event.pointerId)
  }

  const pointerMove = (event) => {
    const motion = motionRef.current
    const pointer = motion.pointer
    if (pointer?.id === event.pointerId) {
      const dx = event.clientX - pointer.startX
      const dy = event.clientY - pointer.startY
      if (!pointer.dragging && pointer.type === 'touch' && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        pointer.dragging = true
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      if (pointer.dragging) {
        event.preventDefault()
        const rect = svgRef.current.getBoundingClientRect()
        const mobile = window.matchMedia('(max-width: 900px)').matches
        motion.targetX = softLimit(pointer.originX + dx * VIEW_SIZE.width / rect.width, mobile ? 12 : 42)
        motion.targetY = softLimit(pointer.originY + dy * VIEW_SIZE.height / rect.height, mobile ? 18 : 30)
        if (!reducedRef.current) motion.velocities[Math.round(pointIndex(localPoint(event, svgRef.current))) % POINT_COUNT] += clamp(dx / 500, -0.025, 0.025)
        wakeRef.current()
      }
      return
    }
    if (event.pointerType !== 'mouse' || event.target !== hitRef.current || reducedRef.current) return
    motion.hover = localPoint(event, svgRef.current)
    const now = performance.now()
    if (now - motion.lastHoverRipple > 360) {
      addRipple(motion, pointIndex(motion.hover), 0.25)
      motion.lastHoverRipple = now
    }
  }

  const pointerEnd = (event) => {
    const motion = motionRef.current
    const pointer = motion.pointer
    if (!pointer || pointer.id !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (event.type !== 'pointercancel' && !pointer.dragging && !reducedRef.current) addRipple(motion, pointIndex(localPoint(event, svgRef.current)), 1)
    motion.pointer = null
    motion.targetX = 0
    motion.targetY = 0
    wakeRef.current()
  }

  return (
    <div ref={holderRef} className="water-blob" onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      <svg ref={svgRef} className="water-blob-svg" viewBox="0 0 500 600" role="img" aria-label={`Interactive water portrait of ${name}, ${role}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onPointerLeave={() => { motionRef.current.hover = null }}>
        <defs>
          <clipPath id="hero-water-portrait-clip"><path ref={clipRef} d={REST_PATH} /></clipPath>
          <filter id="hero-water-shadow" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="15" /></filter>
        </defs>
        <path data-blob-rest="true" d={REST_PATH} opacity="0" pointerEvents="none" />
        <g ref={groupRef}>
          <path ref={shadowRef} d={REST_PATH} fill={SHADOW_COLOR} opacity={SHADOW_OPACITY} filter="url(#hero-water-shadow)" transform="translate(12 18)" pointerEvents="none" />
          <g clipPath="url(#hero-water-portrait-clip)" pointerEvents="none">
            <rect width="500" height="600" fill="#FFFFFF" />
            <image ref={photoRef} href={PHOTO_SRC} x={PHOTO_FRAME.x} y={PHOTO_FRAME.y} width={PHOTO_FRAME.width} height={PHOTO_FRAME.height} preserveAspectRatio="xMidYMid meet" draggable="false" />
          </g>
          <path ref={outlineRef} d={REST_PATH} fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} pointerEvents="none" />
          <path ref={hitRef} d={REST_PATH} fill="transparent" className="water-blob-hit" />
        </g>
      </svg>
    </div>
  )
}
