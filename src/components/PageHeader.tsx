import Reveal from '@/components/Reveal'
import TactileField from '@/components/TactileField'

/**
 * Unified page header for all sub-pages: an interactive tactile-field band
 * (hover = bulge, click = ripple) with kicker / title / subtitle.
 */
export default function PageHeader({
  kicker,
  title,
  subtitle,
  accent = 'cyan',
}: {
  kicker: string
  title: string
  subtitle?: string
  accent?: 'cyan' | 'rose'
}) {
  const accentText = accent === 'rose' ? 'text-rose-300/80' : 'text-cyan-300/80'
  return (
    <section className="relative overflow-hidden border-b border-slate-800/60">
      <TactileField className="absolute inset-0 cursor-crosshair" opacity={0.45} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060a12]/40 via-transparent to-[#060a12]" />
      <div className="pointer-events-none relative z-10 mx-auto flex h-[19rem] max-w-6xl flex-col justify-end px-5 pb-14 sm:h-[21rem]">
        <Reveal>
          <div className={`font-mono2 text-[11px] uppercase tracking-[0.35em] ${accentText}`}>{kicker}</div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300/90">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  )
}
