import { useEffect, useRef } from 'react'
import './SkillsPool.css'

// Add or remove a buoy here. The icon key selects its inline SVG mark.
const SKILLS = [
  { name: 'UI/UX design', icon: 'ui', ring: '#8763d5' },
  { name: 'Dart', icon: 'dart', ring: '#00a8c8' },
  { name: 'Git and GitHub', icon: 'git', ring: '#ef7e32' },
  { name: 'JavaScript', icon: 'js', ring: '#e9b725' },
  { name: 'REST APIs', icon: 'api', ring: '#20b989' },
  { name: 'React', icon: 'react', ring: '#188fc4' },
  { name: 'Flutter', icon: 'flutter', ring: '#2baced' },
  { name: 'Figma', icon: 'figma', ring: '#d7428d' },
  { name: 'PHP', icon: 'php', ring: '#7066c9' },
  { name: 'Laravel', icon: 'laravel', ring: '#e74769' },
  { name: 'Firebase (Firestore)', icon: 'firebase', ring: '#f1933d' },
  { name: 'MySQL', icon: 'mysql', ring: '#13aa9c' },
]

const PHYSICS = {
  wallBounce: 0.78,
  buoyBounce: 0.86,
  waterDrag: 0.24,
  spinDrag: 0.32,
  maxSpeed: 650,
  maxThrow: 620,
  rippleLimit: 12,
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function SkillLogo({ icon }) {
  const svg = { className: 'skills-pool-logo', viewBox: '0 0 48 48', fill: 'none', 'aria-hidden': true, draggable: false }
  switch (icon) {
    case 'ui': return <svg {...svg}><rect x="5" y="8" width="38" height="31" rx="5" fill="#8153db" /><rect x="9" y="12" width="30" height="23" rx="2" fill="#f5f0ff" /><path d="M9 18h30M20 18v17" stroke="#8153db" strokeWidth="2" /><circle cx="14" cy="15" r="1" fill="#8153db" /><circle cx="18" cy="15" r="1" fill="#8153db" /><rect x="24" y="22" width="11" height="7" rx="1" fill="#9e84f1" /></svg>
    case 'dart': return <svg {...svg}><path d="M9 25 25 7h12l4 13-17 21H12z" fill="#14a6d0" /><path d="M9 25 24 41h13L21 25z" fill="#0876aa" /><path d="M25 7 41 20 21 25 9 25z" fill="#47c6e8" /></svg>
    case 'git': return <svg {...svg}><rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(45 24 24)" fill="#ee613b" /><path d="M18 16v15m0-10 12 7V16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="18" cy="16" r="2.8" fill="white" /><circle cx="18" cy="31" r="2.8" fill="white" /><circle cx="30" cy="16" r="2.8" fill="white" /></svg>
    case 'js': return <svg {...svg}><rect x="6" y="6" width="36" height="36" rx="5" fill="#f4d930" /><text x="24" y="32" fill="#17243a" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="Arial, sans-serif">JS</text></svg>
    case 'api': return <svg {...svg}><circle cx="24" cy="24" r="20" fill="#17ae89" /><path d="m17 16-6 8 6 8m14-16 6 8-6 8m-4-18-6 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'react': return <svg {...svg}><circle cx="24" cy="24" r="4" fill="#00c4e8" /><ellipse cx="24" cy="24" rx="21" ry="8" stroke="#00c4e8" strokeWidth="2.7" /><ellipse cx="24" cy="24" rx="21" ry="8" stroke="#00c4e8" strokeWidth="2.7" transform="rotate(60 24 24)" /><ellipse cx="24" cy="24" rx="21" ry="8" stroke="#00c4e8" strokeWidth="2.7" transform="rotate(120 24 24)" /></svg>
    case 'flutter': return <svg {...svg}><path d="M30 5 8 27l8 8L42 9 38 5z" fill="#45c9f2" /><path d="M25 22 13 34l8 8 16-16z" fill="#1688cd" /><path d="m21 42 8-8-8-8-8 8z" fill="#0b5ba4" /></svg>
    case 'figma': return <svg {...svg}><rect x="13" y="5" width="11" height="13" rx="5.5" fill="#f24e1e" /><rect x="24" y="5" width="11" height="13" rx="5.5" fill="#ff7262" /><rect x="13" y="18" width="11" height="13" rx="5.5" fill="#a259ff" /><circle cx="29.5" cy="23.5" r="5.5" fill="#1abcfe" /><path d="M13 31h11v6a5.5 5.5 0 0 1-11 0z" fill="#0acf83" /></svg>
    case 'php': return <svg {...svg}><ellipse cx="24" cy="24" rx="22" ry="13" fill="#777bb3" /><text x="24" y="29" fill="white" fontSize="15" fontStyle="italic" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif">php</text></svg>
    case 'laravel': return <svg {...svg}><path d="m10 11 12-4 9 5v12l8 4-4 9-13 4-13-7V21l7-3zM16 18l11 8 8-3M22 41V29l9-5M9 21l13 8" stroke="#f04d54" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>
    case 'firebase': return <svg {...svg}><path d="m10 33 6-27 8 12 5-6 9 24-14 8z" fill="#f9a51a" /><path d="m10 33 14 11 14-8-15-18z" fill="#ffca28" /><path d="m16 6 8 12-14 15z" fill="#ef7e18" /></svg>
    case 'mysql': return <svg {...svg}><path d="M6 32c7-8 10-13 16-13 5 0 8 5 10 10 4-2 7-7 9-15-1 11-4 18-11 21-7 3-14 1-24-3Z" fill="#1385a3" /><path d="M12 31c5-1 10-4 14-7m7 5 7 7" stroke="#f1a934" strokeWidth="2.5" strokeLinecap="round" /><circle cx="20" cy="19" r="1.5" fill="#173b5a" /></svg>
    default: return <svg {...svg}><circle cx="24" cy="24" r="18" fill="#2f4a63" /></svg>
  }
}

export function SkillsPool({ reduced = false }) {
  const deckRef = useRef(null)
  const basinRef = useRef(null)
  const rippleRef = useRef(null)
  const buoyRefs = useRef([])
  const stateRef = useRef(null)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  useEffect(() => {
    const deck = deckRef.current
    const basin = basinRef.current
    const rippleLayer = rippleRef.current
    if (!deck || !basin || !rippleLayer) return undefined

    const state = { bodies: [], ripples: [], drag: null, width: 0, height: 0, phase: 0, last: 0, raf: 0, visible: false, ready: false }
    stateRef.current = state

    const render = () => {
      for (const body of state.bodies) {
        const bob = reducedRef.current ? 1 : state.drag?.body === body ? 1.045 : 1 + Math.sin(state.phase * body.bobSpeed + body.phase) * 0.015
        body.el.style.transform = `translate3d(${(body.x - body.radius).toFixed(1)}px, ${(body.y - body.radius).toFixed(1)}px, 0) scale(${bob.toFixed(4)})`
        body.ring.style.transform = `rotate(${body.angle.toFixed(1)}deg)`
        body.core.style.transform = `rotate(${(-body.angle + Math.sin(body.angle * Math.PI / 180) * 8).toFixed(1)}deg)`
      }
      if (!state.ready) {
        state.ready = true
        deck.classList.add('is-ready')
      }
    }

    const resize = () => {
      const width = basin.clientWidth
      const height = basin.clientHeight
      if (!width || !height) return
      const radius = (buoyRefs.current[0]?.offsetWidth || 112) / 2
      if (!state.bodies.length) {
        const columns = width < 480 ? 3 : 4
        const rows = Math.ceil(SKILLS.length / columns)
        const side = radius + (width < 480 ? 15 : 35)
        const top = radius + (width < 330 ? 50 : width < 480 ? 12 : 35)
        const bottom = height - radius - (width < 480 ? 12 : 82)
        state.bodies = SKILLS.map((skill, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)
          const x = side + (width - side * 2) * col / Math.max(1, columns - 1) + (index === 0 ? (width < 330 ? 0 : width < 480 ? 36 : 50) : 0)
          const y = top + (bottom - top) * row / Math.max(1, rows - 1)
          const el = buoyRefs.current[index]
          return { el, ring: el.querySelector('.skills-pool-ring'), core: el.querySelector('.skills-pool-core'), x, y, vx: Math.sin(index * 2.4) * 8, vy: Math.cos(index * 1.7) * 7, angle: Math.sin(index * 1.9) * 9, spin: 0, phase: index * 1.13, bobSpeed: 1.5 + index % 4 * 0.18, radius, mass: radius * radius, collisionAt: -1, wakeAt: 0 }
        })
      } else {
        const sx = width / state.width
        const sy = height / state.height
        for (const body of state.bodies) {
          body.radius = radius
          body.mass = radius * radius
          body.x = clamp(body.x * sx, radius + 5, width - radius - 5)
          body.y = clamp(body.y * sy, radius + 5, height - radius - 5)
          body.vx *= sx
          body.vy *= sy
        }
        for (const ripple of state.ripples) {
          ripple.x *= sx
          ripple.y *= sy
          ripple.el.setAttribute('cx', ripple.x)
          ripple.el.setAttribute('cy', ripple.y)
          ripple.echo.setAttribute('cx', ripple.x)
          ripple.echo.setAttribute('cy', ripple.y)
        }
      }
      state.width = width
      state.height = height
      rippleLayer.setAttribute('viewBox', `0 0 ${width} ${height}`)
      render()
    }

    const removeRipple = (ring) => { ring.el.remove(); ring.echo.remove() }
    const ripple = (x, y, startRadius = 18, alpha = 0.55, delay = 0) => {
      if (reducedRef.current) return
      if (state.ripples.length >= PHYSICS.rippleLimit) removeRipple(state.ripples.shift())
      const makeCircle = (stroke, width) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        circle.setAttribute('r', startRadius)
        circle.setAttribute('fill', 'none')
        circle.setAttribute('stroke', stroke)
        circle.setAttribute('stroke-width', width)
        circle.setAttribute('stroke-opacity', '0')
        rippleLayer.appendChild(circle)
        return circle
      }
      state.ripples.push({ el: makeCircle('#e0f7ff', '2.2'), echo: makeCircle('#7dd3fc', '1.2'), x, y, radius: startRadius, startRadius, maxRadius: startRadius + 95 + Math.random() * 55, alpha, speed: 68 + Math.random() * 28, delay })
    }

    // A water click sends a radial impulse through nearby buoys, as well as drawing waves.
    const splash = (x, y, strength = 260) => {
      if (reducedRef.current) return
      ripple(x, y, 12, 0.75)
      ripple(x, y, 24, 0.45, 0.11)
      const reach = Math.min(280, Math.max(170, state.width * 0.48))
      for (const body of state.bodies) {
        if (state.drag?.body === body) continue
        const dx = body.x - x
        const dy = body.y - y
        const distance = Math.hypot(dx, dy)
        if (distance < 1 || distance >= reach) continue
        const falloff = (1 - distance / reach) ** 1.2
        const impulse = strength * falloff
        body.vx += dx / distance * impulse
        body.vy += dy / distance * impulse
        body.spin += (Math.sin(body.phase + state.phase) * 24) * falloff
      }
      state.wake()
    }

    const step = (dt) => {
      const margin = 8
      const damping = Math.pow(PHYSICS.waterDrag, dt)
      const spinDamping = Math.pow(PHYSICS.spinDrag, dt)
      for (const body of state.bodies) {
        if (state.drag?.body === body) continue
        const currentX = Math.sin(state.phase * 0.65 + body.phase) * 9.5
        const currentY = Math.cos(state.phase * 0.52 + body.phase * 1.3) * 8.5
        body.vx = clamp(body.vx * damping + currentX * dt * 2.2, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
        body.vy = clamp(body.vy * damping + currentY * dt * 2.2, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
        body.x += body.vx * dt
        body.y += body.vy * dt
        body.spin *= spinDamping
        body.angle += body.spin * dt
        const minX = body.radius + margin
        const maxX = state.width - minX
        const minY = body.radius + margin
        const maxY = state.height - minY
        if (body.x < minX || body.x > maxX) {
          const speed = Math.abs(body.vx)
          body.x = clamp(body.x, minX, maxX)
          body.vx *= -PHYSICS.wallBounce
          body.spin += body.vy * 0.11 * (body.x === minX ? 1 : -1)
          if (speed > 90 && state.phase - body.collisionAt > 0.6) { ripple(body.x, body.y, 14, 0.32); body.collisionAt = state.phase }
        }
        if (body.y < minY || body.y > maxY) {
          const speed = Math.abs(body.vy)
          body.y = clamp(body.y, minY, maxY)
          body.vy *= -PHYSICS.wallBounce
          body.spin += body.vx * 0.11 * (body.y === minY ? -1 : 1)
          if (speed > 90 && state.phase - body.collisionAt > 0.6) { ripple(body.x, body.y, 14, 0.32); body.collisionAt = state.phase }
        }
      }

      // Two passes separate dense clusters without making the collision response stiff.
      for (let pass = 0; pass < 2; pass += 1) {
        for (let i = 0; i < state.bodies.length; i += 1) {
          for (let j = i + 1; j < state.bodies.length; j += 1) {
            const a = state.bodies[i]
            const b = state.bodies[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const distance = Math.hypot(dx, dy)
            const minimum = a.radius + b.radius + 2
            if (distance >= minimum) continue
            const nx = distance > 0.001 ? dx / distance : 1
            const ny = distance > 0.001 ? dy / distance : 0
            const aDragged = state.drag?.body === a
            const bDragged = state.drag?.body === b
            const overlap = minimum - distance
            const totalMass = a.mass + b.mass
            if (!aDragged) { a.x -= nx * overlap * (bDragged ? 1 : b.mass / totalMass); a.y -= ny * overlap * (bDragged ? 1 : b.mass / totalMass) }
            if (!bDragged) { b.x += nx * overlap * (aDragged ? 1 : a.mass / totalMass); b.y += ny * overlap * (aDragged ? 1 : a.mass / totalMass) }
            const rvx = b.vx - a.vx
            const rvy = b.vy - a.vy
            const along = rvx * nx + rvy * ny
            if (along >= 0) continue
            const inverseA = aDragged ? 0 : 1 / a.mass
            const inverseB = bDragged ? 0 : 1 / b.mass
            const impulse = -(1 + PHYSICS.buoyBounce) * along / (inverseA + inverseB)
            if (!aDragged) { a.vx -= impulse * nx * inverseA; a.vy -= impulse * ny * inverseA }
            if (!bDragged) { b.vx += impulse * nx * inverseB; b.vy += impulse * ny * inverseB }
            const tangent = rvx * -ny + rvy * nx
            if (!aDragged) a.spin -= tangent * 0.18
            if (!bDragged) b.spin += tangent * 0.18
            if (pass === 0 && Math.abs(along) > 100 && state.phase - Math.max(a.collisionAt, b.collisionAt) > 0.6) {
              ripple(a.x + nx * a.radius, a.y + ny * a.radius, 12, Math.min(0.65, Math.abs(along) / 420))
              a.collisionAt = state.phase
              b.collisionAt = state.phase
            }
          }
        }
      }
      for (const body of state.bodies) {
        body.x = clamp(body.x, body.radius + margin, state.width - body.radius - margin)
        body.y = clamp(body.y, body.radius + margin, state.height - body.radius - margin)
      }
      for (let i = state.ripples.length - 1; i >= 0; i -= 1) {
        const ring = state.ripples[i]
        if (ring.delay > 0) { ring.delay -= dt; continue }
        ring.radius += ring.speed * dt
        const progress = (ring.radius - ring.startRadius) / (ring.maxRadius - ring.startRadius)
        if (progress >= 1) { removeRipple(ring); state.ripples.splice(i, 1); continue }
        const opacity = ring.alpha * (1 - progress)
        ring.el.setAttribute('r', ring.radius.toFixed(1))
        ring.el.setAttribute('stroke-opacity', opacity.toFixed(2))
        ring.echo.setAttribute('r', Math.max(0, ring.radius - 8).toFixed(1))
        ring.echo.setAttribute('stroke-opacity', ring.radius > 16 ? (opacity * 0.55).toFixed(2) : '0')
      }
    }

    const tick = (now) => {
      state.raf = 0
      if (!state.visible || document.visibilityState !== 'visible') return
      const dt = state.last ? Math.min((now - state.last) / 1000, 1 / 30) : 1 / 60
      state.last = now
      if (!reducedRef.current) {
        state.phase += dt
        step(dt)
      }
      render()
      if (!reducedRef.current) state.raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (state.visible && document.visibilityState === 'visible' && !state.raf) state.raf = requestAnimationFrame(tick)
    }
    state.render = render
    state.ripple = ripple
    state.splash = splash
    state.wake = wake

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(basin)
    resize()
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting
      deck.classList.toggle('is-active', state.visible)
      state.last = 0
      if (state.visible) wake()
      else { cancelAnimationFrame(state.raf); state.raf = 0 }
    }, { threshold: 0.01 })
    visibilityObserver.observe(deck)
    const tabVisibility = () => {
      state.last = 0
      if (document.visibilityState === 'visible') wake()
      else { cancelAnimationFrame(state.raf); state.raf = 0 }
    }
    document.addEventListener('visibilitychange', tabVisibility)

    return () => {
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', tabVisibility)
      cancelAnimationFrame(state.raf)
      deck.classList.remove('is-active')
      state.ripples.forEach(removeRipple)
      stateRef.current = null
    }
  }, [])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    if (reduced) {
      state.ripples.forEach((ring) => { ring.el.remove(); ring.echo.remove() })
      state.ripples.length = 0
    } else state.wake()
  }, [reduced])

  const startDrag = (event, index) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const state = stateRef.current
    const body = state?.bodies[index]
    if (!body || state.drag) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('is-dragging')
    body.vx = 0
    body.vy = 0
    const rect = basinRef.current.getBoundingClientRect()
    state.drag = { body, pointerId: event.pointerId, offsetX: event.clientX - rect.left - body.x, offsetY: event.clientY - rect.top - body.y, time: event.timeStamp, vx: 0, vy: 0 }
    state.ripple(body.x, body.y, body.radius * 0.85, 0.65)
    state.wake()
  }
  const moveDrag = (event) => {
    const state = stateRef.current
    const drag = state?.drag
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const rect = basinRef.current.getBoundingClientRect()
    const body = drag.body
    const x = clamp(event.clientX - rect.left - drag.offsetX, body.radius + 8, state.width - body.radius - 8)
    const y = clamp(event.clientY - rect.top - drag.offsetY, body.radius + 8, state.height - body.radius - 8)
    const dt = Math.max(0.008, Math.min(0.05, (event.timeStamp - drag.time) / 1000))
    const instantX = (x - body.x) / dt
    const instantY = (y - body.y) / dt
    drag.vx = clamp(drag.vx * 0.55 + instantX * 0.45, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
    drag.vy = clamp(drag.vy * 0.55 + instantY * 0.45, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
    body.vx = drag.vx * 0.35
    body.vy = drag.vy * 0.35
    body.x = x
    body.y = y
    if (!reducedRef.current) body.angle = clamp(body.angle + drag.vx * dt * 0.11, -35, 35)
    if (!reducedRef.current && Math.hypot(instantX, instantY) > 130 && event.timeStamp - body.wakeAt > 160) {
      state.ripple(body.x, body.y, body.radius * 0.6, Math.min(0.55, Math.hypot(instantX, instantY) / 1200))
      body.wakeAt = event.timeStamp
    }
    drag.time = event.timeStamp
    state.render()
  }
  const endDrag = (event) => {
    const state = stateRef.current
    const drag = state?.drag
    if (!drag || drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    event.currentTarget.classList.remove('is-dragging')
    const throwScale = Math.min(1, PHYSICS.maxThrow / (Math.hypot(drag.vx, drag.vy) || 1))
    drag.body.vx = reducedRef.current ? 0 : drag.vx * throwScale
    drag.body.vy = reducedRef.current ? 0 : drag.vy * throwScale
    drag.body.spin = reducedRef.current ? 0 : (drag.body.vx - drag.body.vy) * 0.1
    state.ripple(drag.body.x, drag.body.y, drag.body.radius * 0.9, 0.5)
    state.drag = null
    state.wake()
  }
  const waterPointerDown = (event) => {
    if (event.target.closest('.skills-pool-buoy')) return
    const state = stateRef.current
    if (!state) return
    const rect = basinRef.current.getBoundingClientRect()
    state.splash(event.clientX - rect.left, event.clientY - rect.top)
  }
  const stir = () => {
    const state = stateRef.current
    if (!state) return
    const cx = state.width / 2
    const cy = state.height / 2
    for (const body of state.bodies) {
      if (reducedRef.current) {
        body.x = clamp(body.x + Math.sin(body.phase) * 3, body.radius + 5, state.width - body.radius - 5)
        body.y = clamp(body.y + Math.cos(body.phase) * 3, body.radius + 5, state.height - body.radius - 5)
        continue
      }
      const dx = body.x - cx
      const dy = body.y - cy
      const length = Math.hypot(dx, dy) || 1
      if (state.drag?.body === body) continue
      const swirl = 165 + (body.phase % 1) * 95
      const outward = (Math.sin(body.phase * 2.3) - 0.35) * 110
      body.vx += -dy / length * swirl + dx / length * outward
      body.vy += dx / length * swirl + dy / length * outward
      body.spin += Math.sin(body.phase * 3) * 22
    }
    for (let i = 0; i < 3; i += 1) state.ripple(state.width * (0.25 + i * 0.25), state.height * (0.32 + (i % 2) * 0.24), 20, 0.55, i * 0.12)
    if (reducedRef.current) state.render()
    state.wake()
  }

  return (
    <div ref={deckRef} className="skills-pool-deck" role="group" aria-label="Interactive skills pool" onContextMenu={(event) => event.preventDefault()}>
      <div ref={basinRef} className="skills-pool-basin" onPointerDown={waterPointerDown}>
        <span className="skills-pool-tiles" aria-hidden="true" />
        <span className="skills-pool-caustics" aria-hidden="true" />
        <svg ref={rippleRef} className="skills-pool-ripples" aria-hidden="true" />
        <span className="skills-pool-ladder" aria-hidden="true"><i /><i /><b /><b /></span>
        <div className="skills-pool-buoys" aria-hidden="true">
          {SKILLS.map((skill, index) => (
            <div key={skill.name} ref={(node) => { buoyRefs.current[index] = node }} className="skills-pool-buoy" style={{ '--ring-color': skill.ring }} onPointerDown={(event) => startDrag(event, index)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <span className="skills-pool-ring"><span className="skills-pool-core"><SkillLogo icon={skill.icon} /><span className="skills-pool-name">{skill.name}</span></span></span>
            </div>
          ))}
        </div>
      </div>
      <div className="skills-pool-controls">
        <span className="skills-pool-status"><i aria-hidden="true" />Elastic Water Physics Active • Click water for ripples</span>
        <button type="button" className="skills-pool-stir" onClick={stir}><span aria-hidden="true">≋</span>Gently stir water</button>
      </div>
      <ul className="skills-pool-accessible">{SKILLS.map(({ name }) => <li key={name}>{name}</li>)}</ul>
    </div>
  )
}
