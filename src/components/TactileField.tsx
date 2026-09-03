import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * TactileField — an interactive "skin" of sensory receptors.
 *
 * A membrane of points floats in dark space. Moving the cursor presses a
 * soft glowing bulge into the surface (like a fingertip on skin); clicking
 * sends a luminous ripple travelling outward. Idle, the field breathes with
 * slow travelling waves.
 *
 * The metaphor is deliberate: not a generic neural network, but a tactile
 * sheet — perception arising where it is touched.
 */

const MAX_RIPPLES = 12

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform vec4 uRipples[${MAX_RIPPLES}]; // x, y, startTime, active
  varying float vElev;
  varying float vTouch;
  varying float vRipple;

  void main() {
    vec3 pos = position;

    // fingertip bulge — gaussian press around the cursor
    float dTouch = distance(pos.xy, uMouse);
    float press = exp(-dTouch * dTouch * 0.018) * 7.0 * uMouseStrength;

    // idle breathing waves
    float wave =
      sin(pos.x * 0.14 + uTime * 0.55) * cos(pos.y * 0.12 + uTime * 0.38) * 0.7 +
      sin(pos.x * 0.05 - uTime * 0.22) * 0.5;

    // expanding click ripples
    float ripple = 0.0;
    float rippleGlow = 0.0;
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      if (r.w > 0.5) {
        float age = uTime - r.z;
        if (age >= 0.0 && age < 4.0) {
          float radius = age * 16.0;
          float rd = abs(distance(pos.xy, r.xy) - radius);
          float decay = exp(-age * 1.0);
          ripple += exp(-rd * rd * 0.10) * decay * 5.5;
          rippleGlow += exp(-rd * rd * 0.06) * decay;
        }
      }
    }

    float elev = press + wave + ripple;
    pos.z += elev;

    vElev = elev;
    vTouch = exp(-dTouch * dTouch * 0.018) * uMouseStrength;
    vRipple = rippleGlow;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.6 + vTouch * 2.6 + vRipple * 2.4 + max(elev, 0.0) * 0.28) * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  varying float vElev;
  varying float vTouch;
  varying float vRipple;

  void main() {
    // round soft point
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.08, r);

    // base receptor: dim slate blue
    vec3 base = vec3(0.13, 0.22, 0.34);
    // touched: cyan (perception)
    vec3 cyan = vec3(0.13, 0.83, 0.93);
    // ripple: warm rose (affect)
    vec3 rose = vec3(0.98, 0.45, 0.55);

    float e = clamp(vElev * 0.16 + 0.25, 0.0, 1.0);
    vec3 col = mix(base, cyan, e);
    col = mix(col, rose, clamp(vRipple * 0.9, 0.0, 1.0));
    col = mix(col, vec3(1.0), clamp(vTouch * 0.55 + vRipple * 0.35, 0.0, 0.85));

    float alpha = soft * (0.28 + e * 0.5 + vTouch * 0.45 + vRipple * 0.55);
    gl_FragColor = vec4(col, alpha);
  }
`

interface Props {
  className?: string
  /** 0–1, overall visibility of the field */
  opacity?: number
}

export default function TactileField({ className = '', opacity = 1 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 500)
    camera.position.set(0, 0, 70)

    // world-space half extents at z = 0
    const halfH = () => 70 * Math.tan(THREE.MathUtils.degToRad(30))
    const halfW = () => halfH() * camera.aspect

    const geometry = new THREE.PlaneGeometry(240, 140, 200, 116)

    const ripples = new Float32Array(MAX_RIPPLES * 4)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9999, 9999) },
        uMouseStrength: { value: 0 },
        uRipples: { value: ripples },
      },
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // --- interaction state ---
    const targetMouse = new THREE.Vector2(9999, 9999)
    let targetStrength = 0
    let rippleIdx = 0
    const clock = new THREE.Clock()

    const toWorld = (clientX: number, clientY: number) => {
      const rect = mount.getBoundingClientRect()
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1)
      return new THREE.Vector2(nx * halfW(), ny * halfH())
    }

    const onMove = (e: PointerEvent) => {
      targetMouse.copy(toWorld(e.clientX, e.clientY))
      targetStrength = 1
    }
    const onLeave = () => {
      targetStrength = 0
    }
    const onDown = (e: PointerEvent) => {
      const w = toWorld(e.clientX, e.clientY)
      const t = clock.getElapsedTime()
      const i = (rippleIdx % MAX_RIPPLES) * 4
      ripples[i] = w.x
      ripples[i + 1] = w.y
      ripples[i + 2] = t
      ripples[i + 3] = 1
      rippleIdx++
    }

    const parent = mount.parentElement ?? mount
    parent.addEventListener('pointermove', onMove)
    parent.addEventListener('pointerleave', onLeave)
    parent.addEventListener('pointerdown', onDown)

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      material.uniforms.uTime.value = t

      const m = material.uniforms.uMouse.value as THREE.Vector2
      m.lerp(targetMouse, 0.14)
      const s = material.uniforms.uMouseStrength
      s.value += (targetStrength - s.value) * 0.08

      // deactivate expired ripples
      for (let i = 0; i < MAX_RIPPLES; i++) {
        const o = i * 4
        if (ripples[o + 3] === 1 && t - ripples[o + 2] > 4) ripples[o + 3] = 0
      }

      if (!prefersReduced) {
        points.rotation.z = Math.sin(t * 0.05) * 0.015
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      parent.removeEventListener('pointermove', onMove)
      parent.removeEventListener('pointerleave', onLeave)
      parent.removeEventListener('pointerdown', onDown)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={className} style={{ opacity }} aria-hidden="true" />
}
