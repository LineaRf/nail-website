import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultContent, type LabContent } from '@/data/content'

const STORAGE_KEY = 'nail-content-v2' // unpublished draft (per-browser)

interface ContentCtx {
  content: LabContent
  setContent: (c: LabContent) => void
  resetContent: () => void
  hasLocalEdits: boolean
  /** The last published content (remote content.json, fallback: bundled defaults). */
  published: LabContent
  /** Call after a successful remote publish: clears the draft and updates `published`. */
  markPublished: (c: LabContent) => void
}

const ContentContext = createContext<ContentCtx>({
  content: defaultContent,
  setContent: () => {},
  resetContent: () => {},
  hasLocalEdits: false,
  published: defaultContent,
  markPublished: () => {},
})

function isValidContent(x: unknown): x is LabContent {
  const p = x as LabContent
  return !!p && Array.isArray(p.publications) && Array.isArray(p.news) && Array.isArray(p.members)
}

function loadDraft(): LabContent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isValidContent(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  return null
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<LabContent>(defaultContent)
  const [draft, setDraft] = useState<LabContent | null>(loadDraft)

  // Load the remotely published content.json (edited via Admin → GitHub),
  // cache-busted so updates appear immediately after a Pages deploy.
  useEffect(() => {
    let cancelled = false
    fetch(`./content.json?ts=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && isValidContent(j)) setPublished(j)
      })
      .catch(() => {
        /* offline / dev — keep bundled defaults */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    try {
      if (draft) localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage full — ignore */
    }
  }, [draft])

  const setContent = (c: LabContent) => setDraft(c)
  const resetContent = () => setDraft(null)
  const markPublished = (c: LabContent) => {
    setPublished(c)
    setDraft(null)
  }

  const content = draft ?? published

  return (
    <ContentContext.Provider
      value={{ content, setContent, resetContent, hasLocalEdits: draft !== null, published, markPublished }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  return useContext(ContentContext)
}
