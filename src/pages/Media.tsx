import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'
import type { NewsItem } from '@/data/content'

function ReadMore({ url }: { url: string }) {
  const { t } = useLang()
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-400/40 px-4 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-400/10"
    >
      {t('media.readMore')} ↗
    </a>
  )
}

/** Full-width headline banner — pinned item (featured) or the newest story. */
function Headline({ n }: { n: NewsItem }) {
  const { t } = useLang()
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-rose-400/25 transition-all hover:border-rose-400/50">
      {n.image && (
        <>
          <img
            src={assetUrl(n.image)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d16]/95 via-[#0a0d16]/75 to-[#0a0d16]/20" />
        </>
      )}
      <div className="relative flex min-h-72 max-w-2xl flex-col p-8 sm:min-h-80 sm:p-10">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rose-400/90 px-3 py-0.5 font-mono2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-950">
            {t('media.featured')}
          </span>
          <span className="font-mono2 text-xs text-rose-300/80">{n.date}</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">{n.title}</h3>
        <div className="mt-2 text-xs uppercase tracking-wider text-slate-400">{n.source}</div>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{n.summary}</p>
        <ReadMore url={n.url} />
      </div>
    </article>
  )
}

/** Masonry card — natural height, image shown whenever the story has one. */
function MasonryCard({ n }: { n: NewsItem }) {
  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-xl border border-slate-800 bg-[#0a1120] transition-all hover:border-rose-400/40 hover:shadow-[0_0_30px_rgba(251,113,133,0.07)]">
      {n.image && (
        <img src={assetUrl(n.image)} alt="" className="w-full object-cover" />
      )}
      <div className="p-5">
        <div className="font-mono2 text-xs text-rose-300/80">{n.date}</div>
        <h3 className="mt-2 font-display text-[15px] font-semibold leading-snug">{n.title}</h3>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{n.source}</div>
        <p className="mt-2.5 text-[13px] leading-relaxed text-slate-400">{n.summary}</p>
        <ReadMore url={n.url} />
      </div>
    </article>
  )
}

export default function Media() {
  const { t } = useLang()
  const { content } = useContent()

  const items = [...content.news].sort((a, b) => b.date.localeCompare(a.date))
  const headline = items.find((n) => n.featured) ?? items[0]
  const rest = items.filter((n) => n !== headline)

  return (
    <Layout>
      <PageHeader kicker={t('media.kicker')} title={t('media.title')} subtitle={t('media.subtitle')} accent="rose" />

      <section className="mx-auto max-w-6xl px-5 py-14">
        {headline && (
          <Reveal>
            <Headline n={headline} />
          </Reveal>
        )}
        {/* true masonry: CSS multi-column, cards keep their natural height */}
        <div className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {rest.map((n) => (
            <MasonryCard key={n.id} n={n} />
          ))}
        </div>
      </section>
    </Layout>
  )
}
