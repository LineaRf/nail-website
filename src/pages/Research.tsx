import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
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
      {/* unified interactive page header */}
      <PageHeader kicker={t('research.kicker')} title={t('research.title')} subtitle={t('research.intro')} />

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
