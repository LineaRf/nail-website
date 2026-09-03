import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { assetUrl } from '@/lib/asset'

const navItems = [
  { to: '/', key: 'nav.home' },
  { to: '/people', key: 'nav.people' },
  { to: '/research', key: 'nav.research' },
  { to: '/publications', key: 'nav.publications' },
  { to: '/media', key: 'nav.media' },
  { to: '/contact', key: 'nav.contact' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang()
  const { hasLocalEdits } = useContent()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Vercount (busuanzi-compatible) visit counter — account-free analytics.
  useEffect(() => {
    if (document.getElementById('vercount-js')) return
    const s = document.createElement('script')
    s.id = 'vercount-js'
    s.src = 'https://cn.vercount.one/js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100">
      {/* header — floating logo plate + detached pill menu */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="relative flex items-center justify-between px-3 pt-4 sm:px-5">
          {/* logo plate — pinned to the left edge; collapses to a compact mark on scroll */}
          <Link
            to="/"
            className={`glass flex items-center rounded-2xl border border-slate-700/50 transition-all duration-300 ${
              scrolled
                ? 'gap-0 px-2 py-2 shadow-[0_10px_36px_rgba(0,0,0,0.55)]'
                : 'gap-3 px-3.5 py-2.5'
            }`}
          >
            <img
              src={assetUrl('./assets/lab-logo-outline.png')}
              alt="Lab logo"
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-8' : 'h-12'}`}
            />
            <div
              className={`overflow-hidden leading-tight transition-all duration-300 ${
                scrolled ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
              } hidden sm:block`}
            >
              <div className="font-display text-sm font-semibold tracking-wide whitespace-nowrap">
                Neuro-Affective <span className="text-cyan-300">Interaction</span> Lab
              </div>
              <div className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                CCBS · University of Macau
              </div>
            </div>
          </Link>

          {/* detached pill menu — horizontally centered, visually separate from the logo */}
          <nav className="glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border border-slate-700/50 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? 'bg-cyan-400/90 font-semibold text-slate-950'
                      : 'text-slate-300 hover:text-cyan-200'
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          {/* right cluster: compact language pill + mobile burger */}
          <div className="flex items-center gap-2">
            <div className="glass hidden items-center rounded-full border border-slate-700/50 p-0.5 text-xs md:flex">
              <button
                onClick={() => setLang('en')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === 'en' ? 'bg-cyan-400/90 font-semibold text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === 'zh' ? 'bg-cyan-400/90 font-semibold text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                繁中
              </button>
            </div>

            {/* mobile menu button */}
            <button
              className="glass flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span className="text-lg">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <div className="glass mt-2 border-t border-slate-800 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `text-sm ${isActive ? 'text-cyan-300' : 'text-slate-300'}`
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
              <div className="mt-1 flex gap-2 text-xs">
                <button
                  onClick={() => setLang('en')}
                  className={`rounded-full border px-3 py-1 ${lang === 'en' ? 'border-cyan-400 text-cyan-300' : 'border-slate-700 text-slate-400'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('zh')}
                  className={`rounded-full border px-3 py-1 ${lang === 'zh' ? 'border-cyan-400 text-cyan-300' : 'border-slate-700 text-slate-400'}`}
                >
                  繁中
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      {/* footer */}
      <footer className="border-t border-slate-800/80 bg-[#05080f]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center">
          <img src={assetUrl('./assets/lab-logo-outline.png')} alt="" className="h-16 w-auto opacity-90" />
          <div>
            <div className="font-display font-semibold">{t('footer.line1')}</div>
            <div className="mt-1 text-sm text-slate-400">{t('footer.line2')}</div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} {t('footer.rights')}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono2 tracking-wider">
              PV <span id="busuanzi_value_site_pv">·</span> / UV <span id="busuanzi_value_site_uv">·</span>
            </span>
            <span aria-hidden="true">·</span>
            <Link to="/admin" className="transition-colors hover:text-cyan-300">
              {t('nav.admin')}
              {hasLocalEdits && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-400 align-middle" title={t('admin.localBadge')} />}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
