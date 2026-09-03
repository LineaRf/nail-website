import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'
import type { Member } from '@/data/content'

/**
 * PeopleCarousel — multi-card auto-scrolling row of lab members.
 * Excludes the PI (dedicated section above), sorts dynamically by seniority
 * (postdoc → phd → master → ra). Shows as many cards as fit the container,
 * advances one card every few seconds with a seamless infinite loop,
 * pauses on hover/focus, and offers ‹ › arrows for manual control.
 * Fully data-driven: any future member change in content.json just works.
 */
const ROLE_ORDER = ['postdoc', 'phd', 'master', 'ra']

const CARD_W = 230
const GAP = 20
const INTERVAL = 4500
const DUR = 700 // ms, must match the CSS transition duration

export default function PeopleCarousel() {
  const { t } = useLang()
  const { content } = useContent()

  const people = useMemo(
    () =>
      content.members
        .filter((m) => m.role !== 'pi')
        .sort((a, b) => {
          const oa = ROLE_ORDER.indexOf(a.role)
          const ob = ROLE_ORDER.indexOf(b.role)
          return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob) || a.name.localeCompare(b.name)
        }),
    [content.members],
  )
  const n = people.length

  // container width → how many cards fit
  const boxRef = useRef<HTMLDivElement>(null)
  const [boxW, setBoxW] = useState(0)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth))
    ro.observe(el)
    setBoxW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const visible = Math.max(1, Math.min(n, Math.floor((boxW + GAP) / (CARD_W + GAP)) || 1))
  const scrollable = n > visible

  // infinite loop: render 3 copies, live in the middle copy
  const [idx, setIdx] = useState(0)
  const [anim, setAnim] = useState(true)
  const [paused, setPaused] = useState(false)

  // reset when the list or layout changes
  useEffect(() => {
    setAnim(false)
    setIdx(scrollable ? n : 0)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)))
    return () => cancelAnimationFrame(id)
  }, [n, scrollable])

  useEffect(() => {
    if (!scrollable || paused) return
    const id = setInterval(() => setIdx((i) => i + 1), INTERVAL)
    return () => clearInterval(id)
  }, [scrollable, paused])

  // after each slide, snap back into the middle copy invisibly
  useEffect(() => {
    if (!scrollable) return
    if (idx >= 2 * n || idx < n) {
      const id = setTimeout(() => {
        setAnim(false)
        setIdx((i) => (i >= 2 * n ? i - n : i + n))
        requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)))
      }, DUR + 40)
      return () => clearTimeout(id)
    }
  }, [idx, n, scrollable])

  if (n === 0) return null

  const roleLabel = (m: Member) => {
    const key = `people.${m.role}`
    const v = t(key)
    return v !== key ? v : m.role
  }

  const copies = scrollable ? 3 : 1
  const items: Member[] = []
  for (let c = 0; c < copies; c++) items.push(...people)

  const rowW = visible * CARD_W + (visible - 1) * GAP
  const offset = Math.max(0, (boxW - rowW) / 2)
  const x = offset - idx * (CARD_W + GAP)

  const arrow =
    'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-[#0a1120]/80 text-lg text-slate-300 backdrop-blur transition-all hover:border-cyan-400/60 hover:text-cyan-200'

  return (
    <div
      ref={boxRef}
      className="relative mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden py-2">
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(${x}px)`,
            transition: anim ? `transform ${DUR}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
          }}
        >
          {items.map((m, i) => (
            <Link
              key={`${m.id}-${i}`}
              to={`/people/${m.id}`}
              className="group block shrink-0 rounded-xl border border-slate-800 bg-[#0a1120] p-5 text-center transition-colors hover:border-cyan-400/40 hover:bg-[#0c1526]"
              style={{ width: CARD_W }}
              tabIndex={scrollable && (i < n || i >= 2 * n) ? -1 : 0}
            >
              {m.photo ? (
                <img
                  src={assetUrl(m.photo)}
                  alt={m.name}
                  className="mx-auto h-24 w-24 rounded-full border border-slate-700 object-cover object-top transition-colors group-hover:border-cyan-400/50"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 font-display text-2xl text-slate-500 transition-colors group-hover:border-cyan-400/50 group-hover:text-cyan-300">
                  {m.name.replace(/^(Prof\.|Dr\.)\s*/, '').charAt(0)}
                </div>
              )}
              <div className="mt-4 font-display text-[15px] font-semibold">{m.name}</div>
              <div className="mt-1 text-xs text-cyan-300/80">{roleLabel(m)}</div>
              {m.interests && (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">{m.interests}</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIdx((i) => i - 1)}
            className={`${arrow} left-1 sm:-left-2`}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIdx((i) => i + 1)}
            className={`${arrow} right-1 sm:-right-2`}
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
