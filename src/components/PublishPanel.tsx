import { useState } from 'react'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import {
  PublishError,
  clearStoredToken,
  getStoredToken,
  pollForToken,
  publishContent,
  startDeviceFlow,
  type DeviceFlowStart,
} from '@/lib/publish'

type Phase =
  | { s: 'idle' }
  | { s: 'auth'; flow: DeviceFlowStart }
  | { s: 'working' }
  | { s: 'done' }
  | { s: 'error'; msg: string }

/** GitHub device-flow publishing + visit stats for the Admin page. */
export default function PublishPanel() {
  const { t } = useLang()
  const { content, markPublished, hasLocalEdits } = useContent()
  const [phase, setPhase] = useState<Phase>({ s: 'idle' })
  const [signedIn, setSignedIn] = useState(() => !!getStoredToken())

  const doPublish = async (token: string) => {
    setPhase({ s: 'working' })
    try {
      await publishContent(content, token)
      markPublished(content)
      setPhase({ s: 'done' })
    } catch (e) {
      setPhase({ s: 'error', msg: e instanceof PublishError ? e.message : String(e) })
    }
  }

  const onPublish = async () => {
    const token = getStoredToken()
    if (token) {
      void doPublish(token)
      return
    }
    try {
      const flow = await startDeviceFlow()
      setPhase({ s: 'auth', flow })
      window.open(flow.verification_uri, '_blank', 'noopener')
      const tok = await pollForToken(flow)
      setSignedIn(true)
      await doPublish(tok)
    } catch (e) {
      setPhase({ s: 'error', msg: e instanceof PublishError ? e.message : String(e) })
    }
  }

  const busy = phase.s === 'working' || phase.s === 'auth'

  return (
    <div className="mt-6 rounded-xl border border-cyan-400/30 bg-[#0a1120] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onPublish}
          disabled={busy}
          className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🚀 {phase.s === 'working' ? t('admin.publishWorking') : t('admin.publish')}
        </button>
        <span className="text-xs text-slate-500">{t('admin.publishHint')}</span>
        {signedIn && (
          <button
            onClick={() => {
              clearStoredToken()
              setSignedIn(false)
            }}
            className="ml-auto rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-400 hover:border-rose-400/60 hover:text-rose-300"
          >
            {t('admin.signOut')} ✓
          </button>
        )}
      </div>

      {phase.s === 'auth' && (
        <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3">
          <p className="text-sm text-amber-200">{t('admin.publishAuthHint')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={phase.flow.verification_uri}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-cyan-300 underline underline-offset-2"
            >
              {phase.flow.verification_uri}
            </a>
            <code className="rounded bg-slate-900 px-3 py-1 font-mono2 text-lg tracking-[0.2em] text-cyan-200">
              {phase.flow.user_code}
            </code>
          </div>
          <p className="mt-2 text-xs text-slate-400">{t('admin.publishWaiting')}</p>
        </div>
      )}
      {phase.s === 'done' && (
        <p className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
          {t('admin.publishDone')}
        </p>
      )}
      {phase.s === 'error' && (
        <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
          {t('admin.publishFail')}
          {phase.msg}
        </p>
      )}
      {!hasLocalEdits && phase.s === 'idle' && (
        <p className="mt-3 text-xs text-slate-600">{t('admin.localBadge')}: —</p>
      )}

      <StatsCard />
    </div>
  )
}

function StatsCard() {
  const { t } = useLang()
  const [stats] = useState<{ site_pv?: number; site_uv?: number } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('visitorCountData') || 'null')
    } catch {
      return null
    }
  })
  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('admin.statsTitle')}</div>
      <div className="mt-2 flex flex-wrap gap-6 text-sm">
        <span className="text-slate-300">
          {t('admin.statsPv')}: <b className="font-display text-cyan-300">{stats?.site_pv ?? '—'}</b>
        </span>
        <span className="text-slate-300">
          {t('admin.statsUv')}: <b className="font-display text-cyan-300">{stats?.site_uv ?? '—'}</b>
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-600">{t('admin.statsNote')}</p>
    </div>
  )
}
