/**
 * Zero-backend publishing: the Admin panel commits content.json straight to
 * the GitHub Pages repo through the Contents API, using OAuth Device Flow
 * (no server, no rebuild, no fixed maintainer machine).
 *
 * The OAuth client_id below is GitHub CLI's public device-flow client — any
 * lab member with write access to the repo can authorise in ~30 seconds and
 * publish from any browser (desktop or iPad).
 */

const CLIENT_ID = '178c6fc778ccc68e1d6a'
const OWNER = 'LineaRf'
const REPO = 'LineaRf.github.io'
const CONTENT_PATH = 'content.json'
const TOKEN_KEY = 'nail-gh-token'

export interface DeviceFlowStart {
  device_code: string
  user_code: string
  verification_uri: string
  interval: number
  expires_in: number
}

export class PublishError extends Error {}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export async function startDeviceFlow(): Promise<DeviceFlowStart> {
  const res = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${CLIENT_ID}&scope=repo`,
  })
  if (!res.ok) throw new PublishError(`device flow start failed (${res.status})`)
  return (await res.json()) as DeviceFlowStart
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Polls until the user authorises; stores and returns the access token. */
export async function pollForToken(flow: DeviceFlowStart): Promise<string> {
  const deadline = Date.now() + flow.expires_in * 1000
  let interval = Math.max(flow.interval, 5) * 1000
  while (Date.now() < deadline) {
    await sleep(interval)
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body:
        `client_id=${CLIENT_ID}&device_code=${encodeURIComponent(flow.device_code)}` +
        `&grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:device_code')}`,
    })
    const data = await res.json()
    if (data.access_token) {
      try {
        localStorage.setItem(TOKEN_KEY, data.access_token)
      } catch {
        /* ignore */
      }
      return data.access_token as string
    }
    if (data.error === 'authorization_pending') continue
    if (data.error === 'slow_down') {
      interval += 5000
      continue
    }
    throw new PublishError(data.error_description || data.error || 'authorization failed')
  }
  throw new PublishError('authorization expired')
}

function toBase64(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** Commit content.json to the Pages repo. Throws PublishError with a readable message. */
export async function publishContent(content: unknown, token: string, message?: string): Promise<void> {
  const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  let sha: string | undefined
  const head = await fetch(api, { headers })
  if (head.ok) {
    const meta = await head.json()
    sha = meta.sha
  } else if (head.status === 401 || head.status === 403) {
    clearStoredToken()
    throw new PublishError('token rejected — please sign in again')
  } else if (head.status !== 404) {
    throw new PublishError(`cannot read ${CONTENT_PATH} (${head.status})`)
  }

  const put = await fetch(api, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: message ?? `Update site content via Admin (${new Date().toISOString()})`,
      content: toBase64(JSON.stringify(content, null, 2) + '\n'),
      ...(sha ? { sha } : {}),
    }),
  })
  if (!put.ok) {
    if (put.status === 401 || put.status === 403) clearStoredToken()
    const detail = await put.text().catch(() => '')
    throw new PublishError(`publish failed (${put.status}) ${detail.slice(0, 200)}`)
  }
}
