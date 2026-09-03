import Layout from '@/components/Layout'
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

/** Large headline card — pinned item (featured) or the newest story. */
function Headline({ n }: { n: NewsItem }) {
  const { t } = useLang()
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rose-400/25 bg-gradient-to-br from-[#160d14] to-[#0a1120] transition-all hover:border-rose-400/50 hover:shadow-[0_0_40px_rgba(251,113,133,0.1)]">
      {n.image && (
        <div className="relative">
          <img src={assetUrl(n.image)} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160d14] via-transparent to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rose-400/90 px-3 py-0.5 font-mono2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-950">
            {t('media.featured')}
          </span>
          <span className="font-mono2 text-xs text-rose-300/80">{n.date}</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">{n.title}</h3>
        <div className="mt-2 text-xs uppercase tracking-wider text-slate-500">{n.source}</div>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">{n.summary}</p>
        <ReadMore url={n.url} />
      </div>
    </article>
  )
}

/** Compact side card — natural height, thumbnail when the story has an image. */
function SideCard({ n, delay }: { n: NewsItem; delay: number }) {
  return (
    <Reveal delay={delay}>
      <article className="group flex gap-4 rounded-xl border border-slate-800 bg-[#0a1120] p-5 transition-all hover:border-rose-400/40 hover:shadow-[0_0_30px_rgba(251,113,133,0.07)]">
        {n.image && (
          <img
            src={assetUrl(n.image)}
            alt=""
            className="h-20 w-20 shrink-0 self-start rounded-lg border border-slate-700/60 object-cover"
          />
        )}
        <div className="min-w-0">
          <div className="font-mono2 text-xs text-rose-300/80">{n.date}</div>
          <h3 className="mt-1.5 font-display text-[15px] font-semibold leading-snug">{n.title}</h3>
          <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">{n.source}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{n.summary}</p>
          <ReadMore url={n.url} />
        </div>
      </article>
    </Reveal>
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
      <section className="border-b border-slate-800/60 bg-[#070c16]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-36">
          <Reveal>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-rose-300/80">{t('media.kicker')}</div>
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{t('media.title')}</h1>
            <p className="mt-4 text-sm text-slate-400">{t('media.subtitle')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        {headline && (
          <div className="grid gap-6 lg:grid-cols-5">
            <Reveal className="h-full lg:col-span-3">
              <Headline n={headline} />
            </Reveal>
            <div className="flex flex-col gap-5 lg:col-span-2">
              {rest.map((n, i) => (
                <SideCard key={n.id} n={n} delay={Math.min(120 + i * 80, 440)} />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}
