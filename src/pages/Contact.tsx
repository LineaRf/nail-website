import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { useLang } from '@/i18n/LanguageContext'

export default function Contact() {
  const { t } = useLang()

  return (
    <Layout>
      {/* unified interactive page header — reach out and touch */}
      <PageHeader kicker={t('contact.kicker')} title={t('contact.title')} />

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
