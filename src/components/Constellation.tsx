import { useEffect, useRef } from 'react'

/**
 * Constellation — a drifting 3D particle network ("brain constellation").
 * True 3D point cloud: perspective projection, slow non-uniform rotation,
 * mouse parallax tilt. Particles do slow Brownian motion with per-particle
 * jitter (non-uniform by design). Reacts to hover (glow), drag (pull) and
 * click (burst ripple). The canvas is pointer-events-none; it listens on
 * window so it never blocks the layers below (TactileField, CTAs).
 */
export default function Constellation({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    interface P {
      // position in a [-1, 1] cube
      x: number; y: number; z: number
      vx: number; vy: number; vz: number
      r: number           // base radius (screen px at scale 1)
      jitter: number      // per-particle Brownian strength
      phase: number       // desync phases so motion is non-uniform
      life: number; maxLife: number
      rose: boolean
      // projected values, refreshed every frame
      sx: number; sy: number; s: number
    }
    interface Ripple { x: number; y: number; r: number; alpha: number }

    const particles: P[] = []
    const ripples: Ripple[] = []
    const mouse = { x: -9999, y: -9999, nx: 0, ny: 0, down: false, downAt: 0, downX: 0, downY: 0 }

    // rotation state — base drift + mouse parallax, eased every frame
    let rotY = 0
    let rotX = 0

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const spawn = (p?: P): P => {
      const n: P = p ?? ({} as P)
      n.x = rand(-1, 1)
      n.y = rand(-1, 1)
      n.z = rand(-1, 1)
      n.vx = 0; n.vy = 0; n.vz = 0
      n.r = rand(1.8, 4.6)
      n.jitter = rand(0.4, 1.6)
      n.phase = rand(0, Math.PI * 2)
      n.life = 0
      n.maxLife = rand(420, 1100)
      n.rose = Math.random() < 0.16
      n.sx = 0; n.sy = 0; n.s = 1
      return n
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.min(200, Math.floor((w * h) / 7500))
      while (particles.length < target) {
        const p = spawn()
        p.life = Math.floor(rand(0, p.maxLife * 0.8)) // pre-warm so they don't appear in sync
        particles.push(p)
      }
      particles.length = target
    }

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e)
      mouse.nx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.ny = (e.clientY / window.innerHeight) * 2 - 1
      if (mouse.down) {
        // drag: pull nearby particles along the drag delta (screen space)
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        for (const pt of particles) {
          const d = Math.hypot(pt.sx - mouse.x, pt.sy - mouse.y)
          if (d < 220) {
            const f = ((1 - d / 220) * 0.0009) / Math.max(0.35, pt.s)
            pt.vx += dx * f
            pt.vy += dy * f
          }
        }
      }
      mouse.x = p.x
      mouse.y = p.y
    }
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e)
      mouse.down = true
      mouse.downAt = performance.now()
      mouse.downX = p.x
      mouse.downY = p.y
      mouse.x = p.x
      mouse.y = p.y
    }
    const onUp = (e: PointerEvent) => {
      const p = toLocal(e)
      const quick = performance.now() - mouse.downAt < 280
      const still = Math.hypot(p.x - mouse.downX, p.y - mouse.downY) < 8
      if (mouse.down && quick && still && p.x >= 0 && p.y >= 0 && p.x <= w && p.y <= h) {
        // click: burst ripple + repel (screen space)
        ripples.push({ x: p.x, y: p.y, r: 0, alpha: 0.9 })
        for (const pt of particles) {
          const d = Math.hypot(pt.sx - p.x, pt.sy - p.y)
          if (d < 200 && d > 0.01) {
            const f = ((1 - d / 200) * 0.02) / Math.max(0.35, pt.s)
            pt.vx += ((pt.sx - p.x) / d) * f * 60
            pt.vy += ((pt.sy - p.y) / d) * f * 60
          }
        }
      }
      mouse.down = false
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const LINK = 150
    const PERSP = 2.6 // perspective distance; smaller = stronger depth
    let time = 0

    const tick = () => {
      time += 0.016
      ctx.clearRect(0, 0, w, h)

      // slow, non-uniform base rotation + eased mouse parallax
      rotY += 0.0016 + 0.0009 * Math.sin(time * 0.23)
      rotX += (mouse.ny * 0.22 - rotX) * 0.04
      const parY = mouse.nx * 0.3
      const cy_ = Math.cos(rotY + parY)
      const sy_ = Math.sin(rotY + parY)
      const cx_ = Math.cos(rotX)
      const sx_ = Math.sin(rotX)
      const cX = w / 2
      const cY = h / 2
      const R = Math.min(w, h) * 0.42

      // integrate Brownian motion + project
      for (const p of particles) {
        p.life++
        if (p.life > p.maxLife) spawn(p)

        // Brownian kicks — per-particle strength, modulated by a slow personal
        // rhythm so the motion is visibly non-uniform
        const kick = 0.00022 * p.jitter * (0.6 + 0.6 * Math.sin(time * 0.5 + p.phase))
        p.vx += rand(-kick, kick)
        p.vy += rand(-kick, kick)
        p.vz += rand(-kick, kick)
        p.vx *= 0.985; p.vy *= 0.985; p.vz *= 0.985
        p.x += p.vx; p.y += p.vy; p.z += p.vz
        // soft containment: steer back toward the cube instead of hard wrap
        if (p.x > 1.15) p.vx -= 0.0006; if (p.x < -1.15) p.vx += 0.0006
        if (p.y > 1.15) p.vy -= 0.0006; if (p.y < -1.15) p.vy += 0.0006
        if (p.z > 1.15) p.vz -= 0.0006; if (p.z < -1.15) p.vz += 0.0006

        // rotate around Y then X, perspective-project
        const x1 = p.x * cy_ - p.z * sy_
        const z1 = p.x * sy_ + p.z * cy_
        const y1 = p.y * cx_ - z1 * sx_
        const z2 = p.y * sx_ + z1 * cx_
        const s = PERSP / (PERSP + z2)
        p.s = s
        p.sx = cX + x1 * s * R
        p.sy = cY + y1 * s * R
      }

      // links — thicker and brighter for nearby (large-scale) pairs
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        const fadeA = Math.min(1, Math.min(a.life / 60, (a.maxLife - a.life) / 90))
        if (fadeA <= 0) continue
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.sx - b.sx
          const dy = a.sy - b.sy
          const d2 = dx * dx + dy * dy
          if (d2 > LINK * LINK) continue
          const fadeB = Math.min(1, Math.min(b.life / 60, (b.maxLife - b.life) / 90))
          if (fadeB <= 0) continue
          const d = Math.sqrt(d2)
          const depth = (a.s + b.s) / 2
          const alpha = Math.min(0.85, (1 - d / LINK) * 0.6 * Math.min(fadeA, fadeB) * depth)
          ctx.strokeStyle = `rgba(103, 232, 249, ${alpha.toFixed(3)})`
          ctx.lineWidth = Math.max(0.8, 1.9 * depth * (1 - d / LINK))
          ctx.beginPath()
          ctx.moveTo(a.sx, a.sy)
          ctx.lineTo(b.sx, b.sy)
          ctx.stroke()
        }
      }

      // dots — radius and brightness scale with depth (closer = bigger/brighter)
      for (const p of particles) {
        const fade = Math.min(1, Math.min(p.life / 60, (p.maxLife - p.life) / 90))
        if (fade <= 0) continue
        const dm = Math.hypot(p.sx - mouse.x, p.sy - mouse.y)
        const near = dm < 170
        const boost = near ? 1 + (1 - dm / 170) * 0.8 : 1
        const alpha = Math.min(1, fade * (0.45 + 0.55 * p.s) * boost)
        const r = p.r * p.s * boost
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2)
        ctx.fillStyle = p.rose
          ? `rgba(251, 113, 133, ${alpha.toFixed(3)})`
          : `rgba(165, 243, 252, ${alpha.toFixed(3)})`
        ctx.fill()
        // soft glow halo on near or very-close-to-camera dots
        if (near || p.s > 1.15) {
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, r + 5, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(103, 232, 249, ${(near ? 0.3 * (1 - dm / 170) : 0.14).toFixed(3)})`
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += 3.4
        rp.alpha *= 0.955
        if (rp.alpha < 0.02) {
          ripples.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(103, 232, 249, ${rp.alpha.toFixed(3)})`
        ctx.lineWidth = 1.6
        ctx.stroke()
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // w-full h-full is REQUIRED: canvas is a replaced element, so with
  // position:absolute the width/height attributes would otherwise become the
  // intrinsic layout size and blow up in a ResizeObserver feedback loop.
  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-hidden="true" />
}
