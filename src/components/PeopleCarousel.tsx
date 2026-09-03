import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'
import type { Member } from '@/data/content'

/**
 * PeopleCarousel — auto-rotating spotlight of lab members on the home page.
 * Excludes the PI (who has a dedicated section above), sorts dynamically by
 * seniority (postdoc → phd → master → ra) and rotates every few seconds.
 * Fully data-driven: any future member change in content.json just works.
 * Pauses on hover/focus; side cards jump when clicked.
 */
const ROLE_ORDER = ['postdoc', 'phd', 'master', 'ra']

const INTERVAL = 4500

export default function PeopleCarousel() {
  const { t } = useLang()
  const { content } = useContent()

  const people = useMemo(
    () =>
      content.members
        .filter((m) => m.role !== 'pi')
        .sort((a, b) => {
          const ra = ROLE_ORDER.indexOf(a.role)
          const rb = ROLE_ORDER.indexOf(b.role)
          const oa = ra === -1 ? ROLE_ORDER.length : ra
          const ob = rb === -1 ? ROLE_ORDER.length : rb
          return oa - ob || a.name.localeCompare(b.name)
        }),
    [content.members],
  )

  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = people.length

  useEffect(() => {
    if (paused || n < 2) return
    const id = setInterval(() => setIdx((i) => (i + 1) % n), INTERVAL)
    return () => clearInterval(id)
  }, [paused, n])

  // keep index valid if the member list shrinks
  useEffect(() => {
    if (n > 0 && idx >= n) setIdx(0)
  }, [n, idx])

  if (n === 0) return null

  const roleLabel = (m: Member) => {
    const key = `people.${m.role}`
    const v = t(key)
    return v !== key ? v : m.role
  }

  const card = (m: Member, pos: 'center' | 'prev' | 'next') => {
    const isCenter = pos === 'center'
    const base =
      'absolute left-1/2 top-1/2 block rounded-2xl border bg-[#0a1120] p-6 text-center transition-all duration-700 ease-out'
    const style =
      pos === 'center'
        ? 'z-10 w-64 sm:w-72 border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.12)] -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100'
        : pos === 'prev'
          ? 'z-0 w-52 border-slate-800 -translate-x-[115%] sm:-translate-x-[135%] -translate-y-1/2 scale-90 opacity-40 hover:opacity-70'
          : 'z-0 w-52 border-slate-800 translate-x-[15%] sm:translate-x-[35%] -translate-y-1/2 scale-90 opacity-40 hover:opacity-70'
    const inner = (
      <>
        {m.photo ? (
          <img
            src={assetUrl(m.photo)}
            alt={m.name}
            className={`mx-auto rounded-full border object-cover object-top transition-colors ${
              isCenter ? 'h-28 w-28 border-cyan-400/40' : 'h-16 w-16 border-slate-700'
            }`}
          />
        ) : (
          <div
            className={`mx-auto flex items-center justify-center rounded-full border bg-slate-900/60 font-display text-slate-500 ${
              isCenter ? 'h-28 w-28 border-cyan-400/40 text-3xl' : 'h-16 w-16 border-slate-700 text-xl'
            }`}
          >
            {m.name.replace(/^(Prof\.|Dr\.)\s*/, '').charAt(0)}
          </div>
        )}
        <div className={`mt-4 font-display font-semibold ${isCenter ? 'text-lg' : 'text-xs'}`}>{m.name}</div>
        <div className={`mt-1 text-cyan-300/80 ${isCenter ? 'text-sm' : 'text-[10px]'}`}>{roleLabel(m)}</div>
        {isCenter && m.interests && (
          <p className="mt-3 text-xs leading-relaxed text-slate-400">{m.interests}</p>
        )}
      </>
    )
    if (isCenter) {
      return (
        <Link key={m.id} to={`/people/${m.id}`} className={`${base} ${style} hover:border-cyan-400/60`}>
          {inner}
        </Link>
      )
    }
    return (
      <button
        key={m.id}
        type="button"
        aria-label={m.name}
        onClick={() => setIdx(pos === 'prev' ? (idx - 1 + n) % n : (idx + 1) % n)}
        className={`${base} ${style} cursor-pointer`}
      >
        {inner}
      </button>
    )
  }

  const prev = people[(idx - 1 + n) % n]
  const cur = people[idx]
  const next = people[(idx + 1) % n]

  return (
    <div
      className="mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative mx-auto h-[21rem] max-w-3xl sm:h-[22rem]">
        {n > 2 && card(prev, 'prev')}
        {card(cur, 'center')}
        {n > 1 && card(next, 'next')}
      </div>

      {/* progress dots */}
      {n > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {people.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={m.name}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === idx ? 'w-6 bg-cyan-300' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
