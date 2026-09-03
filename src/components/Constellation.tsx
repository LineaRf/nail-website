import { useEffect, useRef } from 'react'

/**
 * Constellation — a drifting 3D-feel particle network ("brain constellation").
 * Random-size dots fade in, drift, connect with nearby dots, and fade out.
 * Reacts to hover (gather/glow), drag (pull along) and click (burst ripple).
 * The canvas itself is pointer-events-none; it listens on window so it never
 * blocks the layers below (TactileField, CTAs).
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
      x: number; y: number; z: number
      vx: number; vy: number
      r: number
      life: number; maxLife: number
      rose: boolean
    }
    interface Ripple { x: number; y: number; r: number; alpha: number }

    const particles: P[] = []
    const ripples: Ripple[] = []
    const mouse = { x: -9999, y: -9999, down: false, downAt: 0, downX: 0, downY: 0 }

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const spawn = (p?: P): P => {
      const z = rand(0.35, 1)
      const n: P = p ?? ({} as P)
      n.x = rand(0, w)
      n.y = rand(0, h)
      n.z = z
      n.vx = rand(-0.12, 0.12) * z
      n.vy = rand(-0.12, 0.12) * z
      n.r = rand(0.8, 3.2) * z
      n.life = 0
      n.maxLife = rand(360, 900)
      n.rose = Math.random() < 0.16
      return n
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.min(170, Math.floor((w * h) / 9000))
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
      if (mouse.down) {
        // drag: pull nearby particles along the drag delta
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        for (const pt of particles) {
          const d = Math.hypot(pt.x - mouse.x, pt.y - mouse.y)
          if (d < 200) {
            const f = (1 - d / 200) * 0.16 * pt.z
            pt.vx += dx * f * 0.12
            pt.vy += dy * f * 0.12
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
        // click: burst ripple + repel
        ripples.push({ x: p.x, y: p.y, r: 0, alpha: 0.8 })
        for (const pt of particles) {
          const d = Math.hypot(pt.x - p.x, pt.y - p.y)
          if (d < 190 && d > 0.01) {
            const f = (1 - d / 190) * 2.4 * pt.z
            pt.vx += ((pt.x - p.x) / d) * f
            pt.vy += ((pt.y - p.y) / d) * f
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

    const LINK = 115
    const tick = () => {
      ctx.clearRect(0, 0, w, h)

      // particles
      for (const p of particles) {
        p.life++
        if (p.life > p.maxLife) spawn(p)
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.vy *= 0.985
        if (Math.abs(p.vx) < 0.05 * p.z) p.vx += rand(-0.02, 0.02)
        if (Math.abs(p.vy) < 0.05 * p.z) p.vy += rand(-0.02, 0.02)
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        const fadeA = Math.min(1, Math.min(a.life / 60, (a.maxLife - a.life) / 90))
        if (fadeA <= 0) continue
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > LINK * LINK) continue
          const fadeB = Math.min(1, Math.min(b.life / 60, (b.maxLife - b.life) / 90))
          if (fadeB <= 0) continue
          const d = Math.sqrt(d2)
          const alpha = (1 - d / LINK) * 0.32 * Math.min(fadeA, fadeB) * ((a.z + b.z) / 2)
          ctx.strokeStyle = `rgba(103, 232, 249, ${alpha.toFixed(3)})`
          ctx.lineWidth = 0.7 * ((a.z + b.z) / 2)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // dots
      for (const p of particles) {
        const fade = Math.min(1, Math.min(p.life / 60, (p.maxLife - p.life) / 90))
        if (fade <= 0) continue
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y)
        const near = dm < 150
        const boost = near ? 1 + (1 - dm / 150) * 0.9 : 1
        const alpha = Math.min(1, fade * (0.55 + 0.45 * p.z) * boost)
        const r = p.r * boost
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = p.rose
          ? `rgba(251, 113, 133, ${alpha.toFixed(3)})`
          : `rgba(165, 243, 252, ${alpha.toFixed(3)})`
        ctx.fill()
        if (near) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(103, 232, 249, ${(0.25 * (1 - dm / 150)).toFixed(3)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += 3.2
        rp.alpha *= 0.955
        if (rp.alpha < 0.02) {
          ripples.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(103, 232, 249, ${rp.alpha.toFixed(3)})`
        ctx.lineWidth = 1.4
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

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
