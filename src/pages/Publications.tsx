import { useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'

export default function Publications() {
  const { t } = useLang()
  const { content } = useContent()
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')

  const pubs = useMemo(
    () => [...content.publications].sort((a, b) => b.year - a.year),
    [content.publications],
  )
  const years = useMemo(() => Array.from(new Set(pubs.map((p) => p.year))).sort((a, b) => b - a), [pubs])
  const tags = useMemo(() => Array.from(new Set(pubs.flatMap((p) => p.tags))).sort(), [pubs])

  const filtered = pubs.filter(
    (p) => (yearFilter === 'all' || p.year === yearFilter) && (tagFilter === 'all' || p.tags.includes(tagFilter)),
  )

  return (
    <Layout>
      <PageHeader kicker={t('pubs.kicker')} title={t('pubs.title')} subtitle={t('pubs.noteRecent')} />

      <section className="mx-auto max-w-6xl px-5 py-14">
        {/* filters */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-slate-500">{t('pubs.year')}</span>
              <FilterChip active={yearFilter === 'all'} onClick={() => setYearFilter('all')} label={t('pubs.all')} />
              {years.map((y) => (
                <FilterChip key={y} active={yearFilter === y} onClick={() => setYearFilter(y)} label={String(y)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-slate-500">{t('pubs.topic')}</span>
              <FilterChip active={tagFilter === 'all'} onClick={() => setTagFilter('all')} label={t('pubs.all')} />
              {tags.map((tag) => (
                <FilterChip key={tag} active={tagFilter === tag} onClick={() => setTagFilter(tag)} label={tag} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* list */}
        <div className="mt-10 space-y-4">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 60, 300)}>
              <article className="group rounded-xl border border-slate-800 bg-[#0a1120] p-6 transition-all hover:border-cyan-400/40">
                <div className="font-mono2 text-xs text-cyan-300/80">{p.year}</div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-cyan-300">
                      {p.title}
                    </a>
                  ) : (
                    p.title
                  )}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">{p.authors}</p>
                <p className="mt-1 text-sm italic text-slate-500">{p.outlet}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(tag)}
                      className="rounded-full bg-slate-800/70 px-2.5 py-0.5 text-[11px] text-slate-400 transition-colors hover:bg-cyan-400/20 hover:text-cyan-200"
                    >
                      #{tag}
                    </button>
                  ))}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-cyan-400/40 px-2.5 py-0.5 text-[11px] text-cyan-300 transition-colors hover:bg-cyan-400/10"
                    >
                      {t('pubs.link')} ↗
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-10 text-xs leading-relaxed text-slate-600">{t('pubs.fullListNote')}</p>
        </Reveal>
      </section>
    </Layout>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
          : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  )
}
