import { useRef, useState } from 'react'
import Layout from '@/components/Layout'
import PublishPanel from '@/components/PublishPanel'
import { assetUrl } from '@/lib/asset'
import { useLang } from '@/i18n/LanguageContext'
import { useContent } from '@/context/ContentContext'
import {
  defaultContent,
  type LabContent,
  type Member,
  type NewsItem,
  type Publication,
} from '@/data/content'

type Tab = 'pubs' | 'news' | 'members'
type Editing =
  | { kind: 'pub'; value: Publication }
  | { kind: 'news'; value: NewsItem }
  | { kind: 'member'; value: Member }
  | null

const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/** Read an image file, downscale to max 480px JPEG (~20–60 KB) and return a data URI. */
function fileToDataUrl(file: File, maxDim = 480, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas unavailable'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('cannot read image'))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('cannot read file'))
    reader.readAsDataURL(file)
  })
}

export default function Admin() {
  const { t } = useLang()
  const { content, setContent, resetContent, hasLocalEdits } = useContent()
  const [tab, setTab] = useState<Tab>('pubs')
  const [editing, setEditing] = useState<Editing>(null)
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const flash = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(''), 4000)
  }

  // ---------- CRUD helpers ----------
  const savePub = (p: Publication) => {
    const list = content.publications.some((x) => x.id === p.id)
      ? content.publications.map((x) => (x.id === p.id ? p : x))
      : [...content.publications, p]
    setContent({ ...content, publications: list })
    setEditing(null)
  }
  const saveNews = (n: NewsItem) => {
    const list = content.news.some((x) => x.id === n.id)
      ? content.news.map((x) => (x.id === n.id ? n : x))
      : [...content.news, n]
    setContent({ ...content, news: list })
    setEditing(null)
  }
  const saveMember = (m: Member) => {
    const list = content.members.some((x) => x.id === m.id)
      ? content.members.map((x) => (x.id === m.id ? m : x))
      : [...content.members, m]
    setContent({ ...content, members: list })
    setEditing(null)
  }

  const del = (kind: Tab, id: string) => {
    if (!window.confirm(t('admin.confirmDelete'))) return
    if (kind === 'pubs') setContent({ ...content, publications: content.publications.filter((x) => x.id !== id) })
    if (kind === 'news') setContent({ ...content, news: content.news.filter((x) => x.id !== id) })
    if (kind === 'members') setContent({ ...content, members: content.members.filter((x) => x.id !== id) })
  }

  // ---------- import / export ----------
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'content.json'
    a.click()
    URL.revokeObjectURL(a.href)
    flash(t('admin.exported'))
  }

  const importJson = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as LabContent
        if (!Array.isArray(parsed.publications) || !Array.isArray(parsed.news) || !Array.isArray(parsed.members)) {
          throw new Error('bad shape')
        }
        setContent(parsed)
        flash(t('admin.imported'))
      } catch {
        flash('Invalid JSON — expected { publications, news, members }.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Layout>
      <section className="border-b border-slate-800/60 bg-[#070c16]">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-36">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">{t('admin.kicker')}</div>
          <h1 className="mt-4 font-display text-4xl font-bold">{t('admin.title')}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">{t('admin.subtitle')}</p>
          {hasLocalEdits && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> {t('admin.localBadge')}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-slate-700 p-0.5 text-xs">
            {(['pubs', 'news', 'members'] as Tab[]).map((k) => (
              <button
                key={k}
                onClick={() => { setTab(k); setEditing(null) }}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  tab === k ? 'bg-cyan-400/90 font-semibold text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(`admin.tab${k === 'pubs' ? 'Pubs' : k === 'news' ? 'News' : 'Members'}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={exportJson} className="rounded-full border border-slate-600 px-3 py-1.5 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200">
              ⭳ {t('admin.export')}
            </button>
            <button onClick={() => fileRef.current?.click()} className="rounded-full border border-slate-600 px-3 py-1.5 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200">
              ⭱ {t('admin.import')}
            </button>
            <button
              onClick={() => { if (window.confirm(t('admin.resetConfirm'))) resetContent() }}
              className="rounded-full border border-rose-500/40 px-3 py-1.5 text-rose-300 hover:bg-rose-500/10"
            >
              ⟲ {t('admin.reset')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }}
            />
          </div>
        </div>

        {notice && (
          <div className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm text-cyan-200">
            {notice}
          </div>
        )}

        <PublishPanel />

        {/* editor panel */}
        {editing?.kind === 'pub' && <PubForm value={editing.value} onSave={savePub} onCancel={() => setEditing(null)} />}
        {editing?.kind === 'news' && <NewsForm value={editing.value} onSave={saveNews} onCancel={() => setEditing(null)} />}
        {editing?.kind === 'member' && <MemberForm value={editing.value} onSave={saveMember} onCancel={() => setEditing(null)} />}

        {/* lists */}
        <div className="mt-8">
          {tab === 'pubs' && (
            <AdminList
              items={content.publications}
              emptyText={t('admin.empty')}
              addLabel={t('admin.add')}
              onAdd={() =>
                setEditing({
                  kind: 'pub',
                  value: { id: uid(), title: '', authors: '', outlet: '', year: new Date().getFullYear(), url: '', tags: [] },
                })
              }
              render={(p) => (
                <Row
                  title={p.title || '(untitled)'}
                  meta={`${p.year} · ${p.outlet}`}
                  onEdit={() => setEditing({ kind: 'pub', value: { ...p } })}
                  onDelete={() => del('pubs', p.id)}
                />
              )}
            />
          )}
          {tab === 'news' && (
            <AdminList
              items={content.news}
              emptyText={t('admin.empty')}
              addLabel={t('admin.add')}
              onAdd={() =>
                setEditing({ kind: 'news', value: { id: uid(), title: '', source: '', date: new Date().toISOString().slice(0, 10), url: '', summary: '' } })
              }
              render={(n) => (
                <Row
                  title={n.title || '(untitled)'}
                  meta={`${n.date} · ${n.source}`}
                  onEdit={() => setEditing({ kind: 'news', value: { ...n } })}
                  onDelete={() => del('news', n.id)}
                />
              )}
            />
          )}
          {tab === 'members' && (
            <AdminList
              items={content.members}
              emptyText={t('admin.empty')}
              addLabel={t('admin.add')}
              onAdd={() =>
                setEditing({ kind: 'member', value: { id: uid(), name: '', role: 'phd', bio: '', photo: '', email: '', interests: '', matchNames: [] } })
              }
              render={(m) => (
                <Row
                  title={m.name || '(unnamed)'}
                  meta={m.role}
                  onEdit={() => setEditing({ kind: 'member', value: { ...m } })}
                  onDelete={() => del('members', m.id)}
                />
              )}
            />
          )}
        </div>

        {/* schema hint */}
        <details className="mt-12 rounded-xl border border-slate-800 bg-[#0a1120] p-5 text-xs text-slate-500">
          <summary className="cursor-pointer font-mono2 uppercase tracking-widest text-slate-400">content.json schema</summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(defaultContent, null, 2).slice(0, 1200)}…</pre>
        </details>
      </section>
    </Layout>
  )
}

/* ---------- shared bits ---------- */

function AdminList<T extends { id: string }>({
  items, render, onAdd, addLabel, emptyText,
}: {
  items: T[]
  render: (item: T) => React.ReactNode
  onAdd: () => void
  addLabel: string
  emptyText: string
}) {
  return (
    <div>
      <button
        onClick={onAdd}
        className="rounded-full bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
      >
        + {addLabel}
      </button>
      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-sm text-slate-500">{emptyText}</p>}
        {items.map((item) => <div key={item.id}>{render(item)}</div>)}
      </div>
    </div>
  )
}

function Row({ title, meta, onEdit, onDelete }: {
  title: string; meta: string; onEdit: () => void; onDelete: () => void
}) {
  const { t } = useLang()
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0a1120] px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-200">{title}</div>
        <div className="mt-0.5 truncate text-xs text-slate-500">{meta}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs">
        <button onClick={onEdit} className="rounded-full border border-slate-600 px-3 py-1 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200">{t('admin.edit')}</button>
        <button onClick={onDelete} className="rounded-full border border-rose-500/40 px-3 py-1 text-rose-300 hover:bg-rose-500/10">{t('admin.del')}</button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-md border border-slate-700 bg-[#070d18] px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/60'

function FormShell({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  const { t } = useLang()
  return (
    <div className="mt-6 rounded-xl border border-cyan-400/30 bg-[#0a1120] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-300">{t('admin.cancel')} ✕</button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  )
}

/* ---------- forms ---------- */

function PubForm({ value, onSave, onCancel }: { value: Publication; onSave: (p: Publication) => void; onCancel: () => void }) {
  const { t } = useLang()
  const [v, setV] = useState(value)
  return (
    <FormShell title={t('admin.tabPubs')} onCancel={onCancel}>
      <Field label={t('admin.fieldTitle')}><input className={inputCls} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
      <Field label={t('admin.fieldAuthors')}><input className={inputCls} value={v.authors} onChange={(e) => setV({ ...v, authors: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.fieldOutlet')}><input className={inputCls} value={v.outlet} onChange={(e) => setV({ ...v, outlet: e.target.value })} /></Field>
        <Field label={t('admin.fieldYear')}><input className={inputCls} type="number" value={v.year} onChange={(e) => setV({ ...v, year: Number(e.target.value) })} /></Field>
      </div>
      <Field label={t('admin.fieldUrl')}><input className={inputCls} value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} /></Field>
      <Field label={t('admin.fieldTags')}><input className={inputCls} value={v.tags.join(', ')} onChange={(e) => setV({ ...v, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></Field>
      <button onClick={() => onSave(v)} className="w-fit rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t('admin.save')}</button>
    </FormShell>
  )
}

function NewsForm({ value, onSave, onCancel }: { value: NewsItem; onSave: (n: NewsItem) => void; onCancel: () => void }) {
  const { t } = useLang()
  const [v, setV] = useState(value)
  const [uploading, setUploading] = useState(false)
  const imgFileRef = useRef<HTMLInputElement>(null)
  return (
    <FormShell title={t('admin.tabNews')} onCancel={onCancel}>
      <Field label={t('admin.fieldTitle')}><input className={inputCls} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.fieldSource')}><input className={inputCls} value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} /></Field>
        <Field label={t('admin.fieldDate')}><input className={inputCls} type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></Field>
      </div>
      <Field label={t('admin.fieldUrl')}><input className={inputCls} value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} /></Field>
      <Field label={t('admin.fieldSummary')}><textarea className={`${inputCls} min-h-24`} value={v.summary} onChange={(e) => setV({ ...v, summary: e.target.value })} /></Field>
      <Field label={t('admin.fieldImage')}>
        <div className="flex items-center gap-3">
          {v.image && (
            <img src={assetUrl(v.image)} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-slate-700 object-cover" />
          )}
          <div className="flex-1 space-y-2">
            <input
              className={inputCls}
              value={v.image?.startsWith('data:') ? '' : (v.image ?? '')}
              placeholder="https://…"
              onChange={(e) => setV({ ...v, image: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => imgFileRef.current?.click()}
                disabled={uploading}
                className="rounded-full border border-cyan-400/50 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-50"
              >
                🖼 {uploading ? t('admin.fieldPhotoUploading') : t('admin.fieldPhotoUpload')}
              </button>
              {v.image?.startsWith('data:') && (
                <span className="text-xs text-emerald-400">✓ uploaded ({Math.round(v.image.length / 1366)} KB)</span>
              )}
              {v.image && (
                <button type="button" onClick={() => setV({ ...v, image: '' })} className="text-xs text-slate-500 hover:text-rose-300">
                  ✕
                </button>
              )}
              <input
                ref={imgFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (!f) return
                  if (f.size > 15 * 1024 * 1024) {
                    window.alert(t('admin.photoTooBig'))
                    return
                  }
                  setUploading(true)
                  try {
                    setV({ ...v, image: await fileToDataUrl(f, 800, 0.82) })
                  } finally {
                    setUploading(false)
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Field>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={!!v.featured}
          onChange={(e) => setV({ ...v, featured: e.target.checked })}
          className="h-4 w-4 accent-cyan-400"
        />
        {t('admin.fieldFeatured')}
      </label>
      <button onClick={() => onSave(v)} className="w-fit rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t('admin.save')}</button>
    </FormShell>
  )
}

function MemberForm({ value, onSave, onCancel }: { value: Member; onSave: (m: Member) => void; onCancel: () => void }) {
  const { t } = useLang()
  const [v, setV] = useState(value)
  const [uploading, setUploading] = useState(false)
  const photoFileRef = useRef<HTMLInputElement>(null)
  return (
    <FormShell title={t('admin.tabMembers')} onCancel={onCancel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('admin.fieldName')}><input className={inputCls} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label={t('admin.fieldRole')}>
          <select className={inputCls} value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })}>
            {['pi', 'postdoc', 'phd', 'master', 'ra', 'member', 'alumni'].map((r) => (
              <option key={r} value={r}>{t(`people.${r}`)}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t('admin.fieldBio')}><textarea className={`${inputCls} min-h-20`} value={v.bio} onChange={(e) => setV({ ...v, bio: e.target.value })} /></Field>
      <Field label={t('admin.fieldInterests')}><input className={inputCls} value={v.interests} onChange={(e) => setV({ ...v, interests: e.target.value })} /></Field>
      <Field label={t('admin.fieldPhoto')}>
        <div className="flex items-center gap-3">
          {v.photo && (
            <img src={assetUrl(v.photo)} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-slate-700 object-cover object-top" />
          )}
          <div className="flex-1 space-y-2">
            <input className={inputCls} value={v.photo.startsWith('data:') ? '' : v.photo} placeholder="https://…" onChange={(e) => setV({ ...v, photo: e.target.value })} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => photoFileRef.current?.click()}
                disabled={uploading}
                className="rounded-full border border-cyan-400/50 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-50"
              >
                📷 {uploading ? t('admin.fieldPhotoUploading') : t('admin.fieldPhotoUpload')}
              </button>
              {v.photo.startsWith('data:') && <span className="text-xs text-emerald-400">✓ uploaded ({Math.round(v.photo.length / 1366)} KB)</span>}
              <input
                ref={photoFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (!f) return
                  if (f.size > 15 * 1024 * 1024) {
                    window.alert(t('admin.photoTooBig'))
                    return
                  }
                  setUploading(true)
                  try {
                    setV({ ...v, photo: await fileToDataUrl(f) })
                  } finally {
                    setUploading(false)
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Field>
      <Field label={t('admin.fieldEmail')}><input className={inputCls} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
      <Field label={t('admin.fieldMatchNames')}><input className={inputCls} value={v.matchNames.join(', ')} onChange={(e) => setV({ ...v, matchNames: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></Field>
      <button onClick={() => onSave(v)} className="w-fit rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t('admin.save')}</button>
    </FormShell>
  )
}
