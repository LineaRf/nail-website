import Layout from '@/components/Layout'
import Reveal from '@/components/Reveal'
import TactileField from '@/components/TactileField'
import { useLang } from '@/i18n/LanguageContext'

export default function Contact() {
  const { t } = useLang()

  return (
    <Layout>
      {/* header with interactive field — reach out and touch */}
      <section className="relative overflow-hidden border-b border-slate-800/60">
        <TactileField className="absolute inset-0 cursor-crosshair" opacity={0.45} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060a12]/40 via-transparent to-[#060a12]" />
        <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-36">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">{t('contact.kicker')}</div>
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{t('contact.title')}</h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {/* address */}
          <Reveal>
            <div className="h-full rounded-xl border border-slate-800 bg-[#0a1120] p-7">
              <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">{t('contact.addressTitle')}</div>
              <div className="mt-4 space-y-1.5 text-[15px] leading-relaxed text-slate-300">
                <p className="font-semibold text-slate-100">{t('contact.address1')}</p>
                <p>{t('contact.address2')}</p>
                <p className="text-slate-400">{t('contact.address3')}</p>
              </div>
            </div>
          </Reveal>

          {/* email */}
          <Reveal delay={100}>
            <div className="h-full rounded-xl border border-slate-800 bg-[#0a1120] p-7">
              <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">{t('contact.emailTitle')}</div>
              <a href="mailto:mspape@um.edu.mo" className="mt-4 block font-mono2 text-lg text-slate-200 transition-colors hover:text-cyan-300">
                mspape@um.edu.mo
              </a>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-sm">
                <div>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-slate-500">{t('contact.phoneTitle')}</div>
                  <div className="mt-1 text-slate-300">{t('contact.phone')}</div>
                </div>
                <div>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-slate-500">{t('contact.hoursTitle')}</div>
                  <div className="mt-1 text-slate-300">{t('contact.hours')}</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* join */}
          <Reveal delay={160}>
            <div className="h-full rounded-xl border border-slate-800 bg-[#0a1120] p-7">
              <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-rose-300/80">{t('contact.joinTitle')}</div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{t('contact.joinText')}</p>
            </div>
          </Reveal>

          {/* collaborations */}
          <Reveal delay={220}>
            <div className="h-full rounded-xl border border-slate-800 bg-[#0a1120] p-7">
              <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-rose-300/80">{t('contact.collabTitle')}</div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{t('contact.collabText')}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  )
}
