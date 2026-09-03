import { Link } from 'react-router'
import Layout from '@/components/Layout'
import Reveal from '@/components/Reveal'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'
import type { Member } from '@/data/content'

const roleOrder = ['pi', 'postdoc', 'phd', 'master', 'ra', 'member', 'alumni']

function initials(name: string) {
  return name.replace(/^(Prof\.|Dr\.)\s*/, '').charAt(0)
}

function MemberCard({ m, delay }: { m: Member; delay: number }) {
  const { t } = useLang()
  const roleLabel = t(`people.${m.role}`) !== `people.${m.role}` ? t(`people.${m.role}`) : m.role
  return (
    <Reveal delay={delay}>
      <Link
        to={`/people/${m.id}`}
        className="group flex h-full items-center gap-5 rounded-xl border border-slate-800 bg-[#0a1120] p-5 transition-all hover:border-cyan-400/40 hover:bg-[#0c1526]"
      >
        {m.photo ? (
          <img
            src={assetUrl(m.photo)}
            alt={m.name}
            className="h-20 w-20 shrink-0 rounded-xl border border-slate-700 object-cover object-top transition-all group-hover:border-cyan-400/50"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 font-display text-2xl text-slate-500 transition-all group-hover:border-cyan-400/50 group-hover:text-cyan-300">
            {initials(m.name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-display text-[15px] font-semibold">{m.name}</div>
          <div className="mt-0.5 text-xs text-cyan-300/80">{roleLabel}</div>
          {m.interests && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{m.interests}</p>}
        </div>
      </Link>
    </Reveal>
  )
}

export default function People() {
  const { t } = useLang()
  const { content } = useContent()

  const known = new Set(roleOrder)
  const groups = roleOrder
    .map((role) => ({ role, members: content.members.filter((m) => m.role === role) }))
    .filter((g) => g.members.length > 0)
  const others = content.members.filter((m) => !known.has(m.role))
  if (others.length > 0) groups.push({ role: 'member', members: others })

  return (
    <Layout>
      <section className="border-b border-slate-800/60 bg-[#070c16]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-36">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
              {t('peoplePage.kicker')}
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{t('peoplePage.title')}</h1>
            <p className="mt-4 text-sm text-slate-400">{t('peoplePage.subtitle')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        {groups.map((g, gi) => (
          <div key={g.role} className={gi > 0 ? 'mt-14' : ''}>
            <Reveal>
              <div className="flex items-center gap-4">
                <h2 className="font-display text-xl font-bold text-slate-200">
                  {t(`peoplePage.${g.role}`) !== `peoplePage.${g.role}` ? t(`peoplePage.${g.role}`) : g.role}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 to-transparent" />
                <span className="font-mono2 text-xs text-slate-600">{g.members.length}</span>
              </div>
            </Reveal>

            {g.role === 'pi' ? (
              <div className="mt-6">
                {g.members.map((m, i) => (
                  <Reveal key={m.id} delay={i * 90}>
                    <Link
                      to={`/people/${m.id}`}
                      className="group flex flex-col items-start gap-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0a1220] to-[#0a1120] p-7 transition-all hover:border-cyan-400/50 sm:flex-row sm:items-center"
                    >
                      {m.photo ? (
                        <img
                          src={assetUrl(m.photo)}
                          alt={m.name}
                          className="h-32 w-32 shrink-0 rounded-2xl border border-slate-700 object-cover object-top transition-all group-hover:border-cyan-400/60"
                        />
                      ) : (
                        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/60 font-display text-4xl text-slate-500">
                          {initials(m.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-display text-2xl font-bold">{m.name}</div>
                        <div className="mt-1 text-sm text-cyan-300/90">{t('people.pi')}</div>
                        {m.interests && <p className="mt-3 text-sm leading-relaxed text-slate-400">{m.interests}</p>}
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {g.members.map((m, i) => (
                  <MemberCard key={m.id} m={m} delay={Math.min(i * 70, 350)} />
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </Layout>
  )
}
