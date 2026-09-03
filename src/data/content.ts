import raw from './content.json'

export interface Publication {
  id: string
  title: string
  authors: string
  outlet: string
  year: number
  url: string
  tags: string[]
}

export interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  url: string
  summary: string
  /** optional image (data URI or URL) shown as thumbnail / headline visual */
  image?: string
  /** pin this item as the large headline card on the Media page */
  featured?: boolean
}

export interface Member {
  id: string
  name: string
  role: string // key into people.* translations or free text
  bio: string
  photo: string
  email: string
  interests: string
  /** substrings matched (case-insensitive) against publication author strings */
  matchNames: string[]
}

export interface LabContent {
  publications: Publication[]
  news: NewsItem[]
  members: Member[]
}

/**
 * Bundled defaults — also emitted to dist/content.json at build time.
 * At runtime the app fetches ./content.json first (the published, remotely
 * editable copy) and falls back to this bundled snapshot when offline.
 */
export const defaultContent = raw as LabContent
