import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import Layout from '@/components/Layout'
import Reveal from '@/components/Reveal'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'

/** deterministic accent per member for a personalised but coherent look */
const accents = [
  { from: 'from-cyan-400/30', text: 'text-cyan-300', ring: 'border-cyan-400/40', bar: 'from-cyan-400 to-sky-500' },
  { from: 'from-rose-400/30', text: 'text-rose-300', ring: 'border-rose-400/40', bar: 'from-rose-400 to-fuchsia-500' },
  { from: 'from-emerald-400/30', text: 'text-emerald-300', ring: 'border-emerald-400/40', bar: 'from-emerald-400 to-cyan-500' },
  { from: 'from-amber-400/30', text: 'text-amber-300', ring: 'border-amber-400/40', bar: 'from-amber-400 to-rose-500' },
  { from: 'from-violet-400/30', text: 'text-violet-300', ring: 'border-violet-400/40', bar: 'from-violet-400 to-cyan-500' },
]

function accentFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return accents[h % accents.length]
}

export default function MemberProfile() {
  const { id } = useParams()
  const { t } = useLang()
  const { content } = useContent()

  const member = content.members.find((m) => m.id === id)

  const pubs = useMemo(() => {
    if (!member || member.matchNames.length === 0) return []
    return content.publications
      .filter((p) => member.matchNames.some((n) => p.authors.toLowerCase().includes(n.toLowerCase())))
      .sort((a, b) => b.year - a.year)
  }, [member, content.publications])

  if (!member) {
    return (
      <Layout>
        <section className="mx-auto max-w-6xl px-5 pb-24 pt-40 text-center">
          <p className="text-slate-400">Member not found.</p>
          <Link to="/" className="mt-4 inline-block text-cyan-300 hover:underline">← {t('memberPage.back')}</Link>
        </section>
      </Layout>
    )
  }

  const ac = accentFor(member.id)
  const roleLabel = t(`people.${member.role}`) !== `people.${member.role}` ? t(`people.${member.role}`) : member.role

  return (
    <Layout>
      {/* hero band */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-[#070c16]">
        <div className={`pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-gradient-to-br ${ac.from} to-transparent blur-3xl`} />
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10 mx-auto max-w-4xl px-5 pb-16 pt-36">
          <Reveal>
            <Link to="/" className="font-mono2 text-xs tracking-widest text-slate-500 transition-colors hover:text-cyan-300">
              ← {t('memberPage.back')}
            </Link>
          </Reveal>
          <div className="mt-8 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <Reveal delay={80}>
              {member.photo ? (
                <img
                  src={assetUrl(member.photo)}
                  alt={member.name}
                  className={`h-40 w-40 rounded-2xl border-2 object-cover object-top shadow-2xl ${ac.ring}`}
                />
              ) : (
                <div className={`flex h-40 w-40 items-center justify-center rounded-2xl border-2 ${ac.ring} bg-[#0a1120] font-display text-5xl font-bold ${ac.text}`}>
                  {member.name.replace(/^(Prof\.|Dr\.)\s*/, '').charAt(0)}
                </div>
              )}
            </Reveal>
            <div>
              <Reveal delay={140}>
                <h1 className="font-display text-3xl font-bold sm:text-4xl">{member.name}</h1>
              </Reveal>
              <Reveal delay={200}>
                <div className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium ${ac.ring} ${ac.text}`}>
                  {roleLabel}
                </div>
              </Reveal>
              {member.email && (
                <Reveal delay={260}>
                  <a href={`mailto:${member.email}`} className="mt-3 block font-mono2 text-sm text-slate-400 transition-colors hover:text-cyan-300">
                    {member.email}
                  </a>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14">
        {/* bio */}
        {member.bio && (
          <Reveal>
            <p className="text-[15px] leading-relaxed text-slate-300">{member.bio}</p>
          </Reveal>
        )}

        {/* interests */}
        {member.interests && (
          <Reveal delay={100}>
            <div className="mt-10">
              <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('memberPage.interests')}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.interests.split('·').map((s) => s.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className={`rounded-full border px-3.5 py-1.5 text-sm ${ac.ring} ${ac.text}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* related publications */}
        <Reveal delay={160}>
          <div className="mt-12">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('memberPage.publications')}</div>
            <div className="mt-5 space-y-3">
              {pubs.length === 0 && <p className="text-sm text-slate-500">{t('memberPage.noPubs')}</p>}
              {pubs.map((p) => (
                <article key={p.id} className="rounded-xl border border-slate-800 bg-[#0a1120] p-5 transition-colors hover:border-slate-600">
                  <div className="flex items-center gap-3">
                    <span className={`h-1 w-8 rounded bg-gradient-to-r ${ac.bar}`} />
                    <span className="font-mono2 text-xs text-slate-500">{p.year}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-[15px] font-semibold leading-snug">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-cyan-300">{p.title}</a>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{p.authors}</p>
                  <p className="mt-0.5 text-sm italic text-slate-500">{p.outlet}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </Layout>
  )
}
