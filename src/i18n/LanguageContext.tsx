import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

function lookup(lang: Lang, key: string): string {
  let node: unknown = translations[lang]
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      node = undefined
      break
    }
  }
  if (typeof node === 'string') return node
  // fall back to English
  if (lang !== 'en') return lookup('en', key)
  return key
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('nail-lang')
    return saved === 'zh' ? 'zh' : 'en'
  })

  useEffect(() => {
    localStorage.setItem('nail-lang', lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'
  }, [lang])

  const t = (key: string) => lookup(lang, key)

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
