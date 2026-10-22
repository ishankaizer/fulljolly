import { createHash, timingSafeEqual } from 'node:crypto'

// The voice library lives in cloud storage. Every tablet reads the list (GET /api/voice); only someone
// with the passcode can publish (POST /api/publish) or remove (DELETE /api/publish) a recording.
// This file holds the rules, and knows nothing about which storage is behind it, so it can be tested alone.

export interface BlobInfo {
  pathname: string
  url: string
  size: number
  uploadedAt: string
}

export interface VoiceStore {
  put(pathname: string, body: ArrayBuffer): Promise<void>
  list(prefix: string): Promise<BlobInfo[]>
  remove(pathname: string): Promise<void>
}

const PREFIX = 'voice/'
/** Where a recording is kept, e.g. "voice/sounds/sh.wav". */
export const pathFor = (key: string) => `${PREFIX}${key}.wav`
/** Keys look like "sounds/sh", "rimes/at", "words/cat", "prompts/well-done". */
export const KEY_RE = /^(sounds|rimes|words|prompts)\/[A-Za-z0-9_-]{1,60}$/
export const MAX_BYTES = 3 * 1024 * 1024

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to))

/** A WAV file starts "RIFF....WAVE". */
export const isWav = (b: Uint8Array) => b.length > 44 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WAVE'

/** Compare passcodes without leaking how much of one was right. */
export function passcodeOk(given: string | null, expected: string | undefined): boolean {
  if (!expected || !given) return false
  const hash = (s: string) => createHash('sha256').update(s).digest()
  return timingSafeEqual(hash(given), hash(expected))
}

/** GET: every published recording, with where to download it and when it was last changed. */
export async function listClips(store: VoiceStore): Promise<Response> {
  const blobs = await store.list(PREFIX)
  const clips: Record<string, { url: string; size: number; uploadedAt: string }> = {}
  for (const b of blobs) {
    const key = b.pathname.slice(PREFIX.length).replace(/\.wav$/, '')
    if (KEY_RE.test(key)) clips[key] = { url: b.url, size: b.size, uploadedAt: b.uploadedAt }
  }
  return json({ clips }, 200, { 'cache-control': 'public, s-maxage=20, stale-while-revalidate=120' })
}

function guard(req: Request, expected: string | undefined): Response | undefined {
  if (!expected) return json({ error: 'not-configured' }, 503)
  if (!passcodeOk(req.headers.get('x-passcode'), expected)) return json({ error: 'wrong-passcode' }, 401)
}

/** POST ?key=sounds/sh with the WAV as the body. POST ?check=1 only checks the passcode. */
export async function publish(req: Request, store: VoiceStore, expected: string | undefined): Promise<Response> {
  const denied = guard(req, expected)
  if (denied) return denied
  const params = new URL(req.url).searchParams
  if (params.get('check')) return json({ ok: true })

  const key = params.get('key') ?? ''
  if (!KEY_RE.test(key)) return json({ error: 'bad-key' }, 400)
  const body = await req.arrayBuffer()
  if (body.byteLength > MAX_BYTES) return json({ error: 'too-big' }, 413)
  if (!isWav(new Uint8Array(body))) return json({ error: 'not-wav' }, 415)

  await store.put(pathFor(key), body)
  return json({ ok: true, key })
}

/** DELETE ?key=sounds/sh takes a recording back out of the library. */
export async function unpublish(req: Request, store: VoiceStore, expected: string | undefined): Promise<Response> {
  const denied = guard(req, expected)
  if (denied) return denied
  const key = new URL(req.url).searchParams.get('key') ?? ''
  if (!KEY_RE.test(key)) return json({ error: 'bad-key' }, 400)
  await store.remove(pathFor(key))
  return json({ ok: true, key })
}

/** GET ?key=sounds/sh hands over one recording through our own server, for browsers that cannot reach storage directly. */
export async function fetchClip(req: Request, store: VoiceStore): Promise<Response> {
  const key = new URL(req.url).searchParams.get('key') ?? ''
  if (!KEY_RE.test(key)) return json({ error: 'bad-key' }, 400)
  const found = (await store.list(pathFor(key))).find((b) => b.pathname === pathFor(key))
  if (!found) return json({ error: 'missing' }, 404)
  const res = await fetch(found.url)
  if (!res.ok) return json({ error: 'storage' }, 502)
  return new Response(res.body, { status: 200, headers: { 'content-type': 'audio/wav', 'cache-control': 'public, s-maxage=60' } })
}
