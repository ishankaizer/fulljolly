import {
  dropPublished,
  markPublished,
  publishedKeys,
  publishedVersionOf,
  readOwnClip,
  savePublished,
  unpublishedKeys,
} from './recordings'

// Publishing sends the recordings made on this tablet to the shared voice library (cloud storage),
// and syncing brings everyone else's down. Together they give every tablet the same voice.

const PASSCODE_KEY = 'word-nest:publish-passcode'

export const savedPasscode = () => {
  try {
    return localStorage.getItem(PASSCODE_KEY) ?? ''
  } catch {
    return ''
  }
}
export const rememberPasscode = (code: string) => {
  try {
    localStorage.setItem(PASSCODE_KEY, code)
  } catch {
    // The grown-up will just be asked again next time.
  }
}

interface Manifest {
  clips: Record<string, { url: string; size: number; uploadedAt: string }>
}

async function timed(input: string, init: RequestInit = {}, ms = 15000) {
  const ctl = new AbortController()
  const timer = window.setTimeout(() => ctl.abort(), ms)
  try {
    return await fetch(input, { ...init, signal: ctl.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

/** The list of published recordings, or nothing when offline or the library is not set up. */
export async function fetchManifest(): Promise<Manifest | undefined> {
  try {
    const res = await timed('/api/voice', { cache: 'no-store' })
    if (!res.ok) return undefined
    const body = (await res.json()) as Manifest
    return body.clips ? body : undefined
  } catch {
    return undefined
  }
}

/** Download one recording: straight from storage, or through our own server if the browser cannot reach it. */
async function download(key: string, clip: { url: string; uploadedAt: string }): Promise<ArrayBuffer | undefined> {
  try {
    // The version in the address makes sure a re-recorded sound is not served from an old cache.
    const res = await timed(`${clip.url}${clip.url.includes('?') ? '&' : '?'}v=${encodeURIComponent(clip.uploadedAt)}`, {}, 30000)
    if (res.ok) return await res.arrayBuffer()
  } catch {
    // fall through to the server
  }
  const res = await timed(`/api/clip?key=${encodeURIComponent(key)}`, {}, 30000)
  return res.ok ? await res.arrayBuffer() : undefined
}

let syncing: Promise<number> | undefined

/**
 * Download every published recording this tablet does not have yet (or has an old version of).
 * Sounds come first. Returns how many were downloaded. Quietly does nothing when offline.
 */
export function syncPublished(): Promise<number> {
  syncing ??= (async () => {
    const manifest = await fetchManifest()
    if (!manifest) return 0
    const entries = Object.entries(manifest.clips)
    const order = (k: string) => ['sounds', 'rimes', 'prompts', 'words'].indexOf(k.split('/')[0])
    const todo = entries.filter(([key, c]) => publishedVersionOf(key) !== c.uploadedAt).sort((a, b) => order(a[0]) - order(b[0]))
    let got = 0
    let next = 0
    const worker = async () => {
      while (next < todo.length) {
        const [key, clip] = todo[next++]
        try {
          const bytes = await download(key, clip)
          if (!bytes) continue
          await savePublished(key, new Blob([bytes], { type: 'audio/wav' }), clip.uploadedAt)
          got++
        } catch {
          // Try again next time.
        }
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()])
    // Anything taken out of the library is taken off this tablet too.
    for (const key of publishedKeys()) if (!manifest.clips[key]) await dropPublished(key)
    return got
  })().finally(() => {
    syncing = undefined
  })
  return syncing
}

export type PasscodeResult = 'ok' | 'wrong' | 'not-configured' | 'offline'

/** Check the passcode without uploading anything. */
export async function checkPasscode(passcode: string): Promise<PasscodeResult> {
  try {
    const res = await timed('/api/publish?check=1', { method: 'POST', headers: { 'x-passcode': passcode } })
    if (res.ok) return 'ok'
    if (res.status === 401) return 'wrong'
    if (res.status === 503) return 'not-configured'
    return 'offline'
  } catch {
    return 'offline'
  }
}

export interface PublishReport {
  published: string[]
  failed: { key: string; reason: string }[]
}

/** Upload every recording made here that is not in the library yet. */
export async function publishPending(passcode: string, onProgress: (done: number, total: number) => void): Promise<PublishReport> {
  const keys = unpublishedKeys()
  const report: PublishReport = { published: [], failed: [] }
  onProgress(0, keys.length)
  for (const key of keys) {
    try {
      const clip = await readOwnClip(key)
      if (!clip) throw new Error('missing')
      const res = await timed(`/api/publish?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'x-passcode': passcode }, body: clip }, 60000)
      if (!res.ok) throw new Error(res.status === 401 ? 'wrong passcode' : res.status === 503 ? 'not set up' : `error ${res.status}`)
      await markPublished(key)
      report.published.push(key)
    } catch (e) {
      report.failed.push({ key, reason: e instanceof Error ? e.message : 'failed' })
      // A wrong passcode or missing setup will fail every one of them: stop after the first.
      if (report.failed[0].reason === 'wrong passcode' || report.failed[0].reason === 'not set up') break
    }
    onProgress(report.published.length + report.failed.length, keys.length)
  }
  return report
}
