import { Link } from 'react-router'
import Layout from '@/components/Layout'
import { useLang } from '@/i18n/LanguageContext'

export default function NotFound() {
  const { t } = useLang()
  return (
    <Layout>
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
        <h1 className="font-display text-4xl font-bold text-gradient-cyan">{t('notFound.title')}</h1>
        <p className="mt-4 text-slate-400">{t('notFound.text')}</p>
        <Link
          to="/"
          className="mt-8 rounded-full border border-slate-600 px-6 py-2.5 text-sm text-slate-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
        >
          {t('notFound.back')}
        </Link>
      </section>
    </Layout>
  )
}
