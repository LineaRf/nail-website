import Layout from '@/components/Layout'
import Reveal from '@/components/Reveal'
import TactileField from '@/components/TactileField'
import { useLang } from '@/i18n/LanguageContext'

const areaKeys = [
  { t: 'focus.f1t', d: 'focus.f1d', n: '01' },
  { t: 'focus.f2t', d: 'focus.f2d', n: '02' },
  { t: 'focus.f3t', d: 'focus.f3d', n: '03' },
  { t: 'focus.f4t', d: 'focus.f4d', n: '04' },
]

const methodKeys = [
  { t: 'research.methods.m1t', d: 'research.methods.m1d' },
  { t: 'research.methods.m2t', d: 'research.methods.m2d' },
  { t: 'research.methods.m3t', d: 'research.methods.m3d' },
  { t: 'research.methods.m4t', d: 'research.methods.m4d' },
]

const projectKeys = [
  { t: 'research.p1t', d: 'research.p1d' },
  { t: 'research.p2t', d: 'research.p2d' },
  { t: 'research.p3t', d: 'research.p3d' },
  { t: 'research.p4t', d: 'research.p4d' },
]

export default function Research() {
  const { t } = useLang()

  return (
    <Layout>
      {/* header band with a quiet tactile field */}
      <section className="relative overflow-hidden border-b border-slate-800/60">
        <TactileField className="absolute inset-0 cursor-crosshair" opacity={0.45} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060a12]/40 via-transparent to-[#060a12]" />
        <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-36">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">{t('research.kicker')}</div>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              {t('research.title')}
            </h1>
            <p className="mt-6 max-w-2xl leading-relaxed text-slate-300">{t('research.intro')}</p>
          </Reveal>
        </div>
      </section>

      {/* focus areas */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="eeg-line font-display text-2xl font-bold sm:text-3xl">{t('research.areasTitle')}</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {areaKeys.map((a, i) => (
            <Reveal key={a.n} delay={i * 90}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-slate-800 bg-[#0a1120] p-6 transition-all hover:border-cyan-400/40">
                <div className="font-mono2 absolute right-5 top-4 text-3xl font-bold text-slate-800 transition-colors group-hover:text-cyan-900">
                  {a.n}
                </div>
                <div className="h-1 w-10 rounded bg-gradient-to-r from-cyan-400 to-rose-400" />
                <h3 className="mt-4 font-display text-lg font-semibold">{t(a.t)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(a.d)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* methods */}
      <section className="border-t border-slate-800/60 bg-[#070c16]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="eeg-line font-display text-2xl font-bold sm:text-3xl">{t('research.methodsTitle')}</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {methodKeys.map((m, i) => (
              <Reveal key={m.t} delay={i * 90}>
                <div className="h-full rounded-xl border border-slate-800 bg-[#0a1120] p-5 transition-all hover:border-rose-400/40">
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-rose-300/70">
                    M{i + 1}
                  </div>
                  <h3 className="mt-3 font-display text-[15px] font-semibold">{t(m.t)}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{t(m.d)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* current threads */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="eeg-line font-display text-2xl font-bold sm:text-3xl">{t('research.projectsTitle')}</h2>
          </Reveal>
          <div className="mt-12 space-y-4">
            {projectKeys.map((p, i) => (
              <Reveal key={p.t} delay={i * 80}>
                <div className="grid gap-3 rounded-xl border border-slate-800 bg-[#0a1120] p-6 transition-all hover:border-cyan-400/40 md:grid-cols-[64px_1fr] md:gap-6">
                  <div className="font-mono2 text-2xl font-bold text-cyan-400/60">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{t(p.t)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(p.d)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
