import { Link } from 'react-router'
import Layout from '@/components/Layout'
import TactileField from '@/components/TactileField'
import Reveal from '@/components/Reveal'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'

const focusIcons = ['◉', '⇄', '♥', '⌘']
const focusKeys = [
  { t: 'focus.f1t', d: 'focus.f1d' },
  { t: 'focus.f2t', d: 'focus.f2d' },
  { t: 'focus.f3t', d: 'focus.f3d' },
  { t: 'focus.f4t', d: 'focus.f4d' },
]

export default function Home() {
  const { t } = useLang()
  const { content } = useContent()

  return (
    <Layout>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* interactive tactile membrane */}
        <TactileField className="absolute inset-0 cursor-crosshair" />
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#060a12_92%)]" />

        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pt-28 pb-16 text-center">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
              {t('hero.kicker')}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              <span className="text-gradient-cyan">{t('hero.titleA')}</span>
              <br />
              <span className="text-slate-100">{t('hero.titleB')}</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t('hero.tagline')}
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/research"
                className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.45)]"
              >
                {t('hero.cta1')}
              </Link>
              <a
                href="#people"
                className="rounded-full border border-slate-600 px-6 py-2.5 text-sm text-slate-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
              >
                {t('hero.cta2')}
              </a>
            </div>
          </Reveal>
        </div>

        <div className="pointer-events-none relative z-10 pb-8 text-center">
          <div className="font-mono2 text-[11px] tracking-widest text-slate-500">{t('hero.hint')}</div>
          <div className="mx-auto mt-3 h-8 w-px animate-pulse bg-gradient-to-b from-cyan-400/70 to-transparent" />
        </div>
      </section>

      {/* ================= PI ================= */}
      <section className="relative border-t border-slate-800/60 bg-[#070c16]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[300px_1fr] md:gap-14">
          <Reveal>
            <div className="relative mx-auto w-64 md:w-full">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-transparent to-rose-500/20 blur-xl" />
              <img
                src={assetUrl('./assets/pi-photo.webp')}
                alt="Prof. Michiel Spapé"
                className="relative w-full rounded-2xl border border-slate-700/60 object-cover shadow-2xl"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-400/30 bg-[#0a1220] px-4 py-1.5 font-mono2 text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                {t('home.piKicker')}
              </div>
            </div>
          </Reveal>
          <div className="flex flex-col justify-center">
            <Reveal>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Prof. Michiel Spapé</h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-3 text-sm font-medium text-cyan-300/90">{t('home.piRole')}</p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 leading-relaxed text-slate-300">{t('home.piBio1')}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-4 leading-relaxed text-slate-400">{t('home.piBio2')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= RESEARCH INTERESTS ================= */}
      <section className="relative border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-rose-300/80">
              {t('home.interestsKicker')}
            </div>
            <h2 className="eeg-line mt-4 max-w-3xl font-display text-3xl font-bold leading-snug sm:text-4xl">
              {t('home.interestsTitle')}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-5 text-[15px] leading-relaxed text-slate-300">
              <Reveal delay={100}><p>{t('home.interestsP1')}</p></Reveal>
              <Reveal delay={180}><p>{t('home.interestsP2')}</p></Reveal>
              <Reveal delay={260}><p>{t('home.interestsP3')}</p></Reveal>
              <Reveal delay={340}>
                <div className="rounded-xl border border-slate-800 bg-[#0a1120] p-5">
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
                    {t('home.methodsKicker')}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{t('home.methodsText')}</p>
                </div>
              </Reveal>
            </div>

            {/* four focus areas */}
            <div>
              <Reveal delay={150}>
                <div className="font-mono2 mb-5 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {t('home.focusKicker')}
                </div>
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {focusKeys.map((f, i) => (
                  <Reveal key={f.t} delay={200 + i * 90}>
                    <Link
                      to="/research"
                      className="group block h-full rounded-xl border border-slate-800 bg-[#0a1120] p-5 transition-all hover:border-cyan-400/40 hover:bg-[#0c1526] hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                    >
                      <div className="text-xl text-cyan-300 transition-transform group-hover:scale-110">{focusIcons[i]}</div>
                      <div className="mt-3 font-display text-[15px] font-semibold leading-snug">{t(f.t)}</div>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{t(f.d)}</p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PEOPLE ================= */}
      <section id="people" className="relative border-t border-slate-800/60 bg-[#070c16]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
              {t('home.peopleKicker')}
            </div>
            <h2 className="eeg-line mt-4 font-display text-3xl font-bold sm:text-4xl">{t('home.peopleTitle')}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 text-sm text-slate-500">{t('home.peopleNote')}</p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.members.map((m, i) => (
              <Reveal key={m.id} delay={i * 90}>
                <Link
                  to={`/people/${m.id}`}
                  className="group block h-full rounded-xl border border-slate-800 bg-[#0a1120] p-5 text-center transition-all hover:border-cyan-400/40 hover:bg-[#0c1526]"
                >
                  {m.photo ? (
                    <img
                      src={assetUrl(m.photo)}
                      alt={m.name}
                      className="mx-auto h-24 w-24 rounded-full border border-slate-700 object-cover object-top transition-all group-hover:border-cyan-400/50"
                    />
                  ) : (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 font-display text-2xl text-slate-500 transition-all group-hover:border-cyan-400/50 group-hover:text-cyan-300">
                      {m.name.replace(/^(Prof\.|Dr\.)\s*/, '').charAt(0)}
                    </div>
                  )}
                  <div className="mt-4 font-display text-[15px] font-semibold">{m.name}</div>
                  <div className="mt-1 text-xs text-cyan-300/80">
                    {t(`people.${m.role}`) !== `people.${m.role}` ? t(`people.${m.role}`) : m.role}
                  </div>
                  {m.interests && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{m.interests}</p>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* ================= NEWS ================= */}
      <section className="relative border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-rose-300/80">
              {t('home.newsKicker')}
            </div>
            <h2 className="eeg-line mt-4 font-display text-3xl font-bold sm:text-4xl">{t('home.newsTitle')}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[...content.news]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((n, i) => (
                <Reveal key={n.id} delay={i * 90}>
                  <Link
                    to="/media"
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0a1120] transition-all hover:border-rose-400/40"
                  >
                    {n.image && (
                      <img src={assetUrl(n.image)} alt="" className="h-32 w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="font-mono2 text-xs text-rose-300/80">{n.date}</div>
                      <div className="mt-2 font-display text-sm font-semibold leading-snug">{n.title}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{n.source}</div>
                    </div>
                  </Link>
                </Reveal>
              ))}
          </div>
          <Reveal delay={200}>
            <Link
              to="/media"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-rose-400/40 px-5 py-2 text-xs text-rose-300 transition-colors hover:bg-rose-400/10"
            >
              {t('home.newsAll')} →
            </Link>
          </Reveal>
        </div>
      </section>
    </Layout>
  )
}
