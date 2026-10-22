// The voice library on this device. Two kinds of recording live here, both used instead of the built-in voice:
//   - recordings made on this device ("clips"), which can be published for every tablet
//   - recordings published by someone else and downloaded here ("published")
// A recording made here wins over a published one. Keys look like "sounds/s", "rimes/at",
// "words/cat", "prompts/well-done".

const DB = 'word-nest-audio'
const CLIPS = 'clips'
const PUBLISHED = 'published'

interface Stored {
  key: string
  blob: Blob
  savedAt: number
  /** When this exact recording was last published, if it was. */
  publishedAt?: number
}

interface StoredPublished {
  key: string
  blob: Blob
  /** The library's timestamp for the version we hold, so we know when it has changed. */
  uploadedAt: string
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 2)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(CLIPS)) db.createObjectStore(CLIPS, { keyPath: 'key' })
      if (!db.objectStoreNames.contains(PUBLISHED)) db.createObjectStore(PUBLISHED, { keyPath: 'key' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(store: string, mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode)
    const req = work(tx.objectStore(store))
    tx.oncomplete = () => {
      db.close()
      resolve(req.result)
    }
    tx.onerror = tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
  })
}

// Object URLs the audio player can use, by key.
const own = new Map<string, string>()
const published = new Map<string, string>()
const publishedVersion = new Map<string, string>()
const ownSavedAt = new Map<string, { savedAt: number; publishedAt?: number }>()
const listeners = new Set<() => void>()
const changed = () => listeners.forEach((fn) => fn())

export const onRecordingsChange = (fn: () => void) => {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

/** The recording to play for a key: one made here, else one published by someone else. */
export const userClipUrl = (key: string) => own.get(key) ?? published.get(key)
export const hasUserClip = (key: string) => own.has(key) || published.has(key)
/** Whether the recording on this device was made here (and so can be re-recorded and published). */
export const isOwnClip = (key: string) => own.has(key)
export const userClipCount = () => new Set([...own.keys(), ...published.keys()]).size
export const publishedClipCount = () => published.size
/** Every published recording this device holds. */
export const publishedKeys = () => [...published.keys()]
/** The version of a published recording this device holds. */
export const publishedVersionOf = (key: string) => publishedVersion.get(key)

/** Keys recorded here that have never been published, or have been re-recorded since. */
export const unpublishedKeys = () =>
  [...ownSavedAt].filter(([, m]) => !m.publishedAt || m.savedAt > m.publishedAt).map(([key]) => key)

function swap(map: Map<string, string>, key: string, blob: Blob) {
  const old = map.get(key)
  if (old) URL.revokeObjectURL(old)
  map.set(key, URL.createObjectURL(blob))
}

/** Load every saved recording so lessons can use them. Safe to call when storage is unavailable. */
export async function loadRecordings() {
  try {
    const clips = await run<Stored[]>(CLIPS, 'readonly', (s) => s.getAll())
    clips.forEach((c) => {
      swap(own, c.key, c.blob)
      ownSavedAt.set(c.key, { savedAt: c.savedAt, publishedAt: c.publishedAt })
    })
    const pub = await run<StoredPublished[]>(PUBLISHED, 'readonly', (s) => s.getAll())
    pub.forEach((c) => {
      swap(published, c.key, c.blob)
      publishedVersion.set(c.key, c.uploadedAt)
    })
    changed()
  } catch {
    // No IndexedDB (private mode): the app just uses the built-in voice.
  }
}

export async function saveRecording(key: string, blob: Blob) {
  const savedAt = Date.now()
  await run(CLIPS, 'readwrite', (s) => s.put({ key, blob, savedAt } satisfies Stored))
  swap(own, key, blob)
  ownSavedAt.set(key, { savedAt })
  changed()
}

export async function deleteRecording(key: string) {
  await run(CLIPS, 'readwrite', (s) => s.delete(key))
  const old = own.get(key)
  if (old) URL.revokeObjectURL(old)
  own.delete(key)
  ownSavedAt.delete(key)
  changed()
}

/** The recording made on this device, for uploading. */
export async function readOwnClip(key: string): Promise<Blob | undefined> {
  const found = await run<Stored | undefined>(CLIPS, 'readonly', (s) => s.get(key))
  return found?.blob
}

/** Remember that the recording made here has been published, so it is not uploaded again. */
export async function markPublished(key: string) {
  const found = await run<Stored | undefined>(CLIPS, 'readonly', (s) => s.get(key))
  if (!found) return
  const publishedAt = Date.now()
  await run(CLIPS, 'readwrite', (s) => s.put({ ...found, publishedAt } satisfies Stored))
  ownSavedAt.set(key, { savedAt: found.savedAt, publishedAt })
  changed()
}

/** Keep a recording published by someone else, with the version it came from. */
export async function savePublished(key: string, blob: Blob, uploadedAt: string) {
  await run(PUBLISHED, 'readwrite', (s) => s.put({ key, blob, uploadedAt } satisfies StoredPublished))
  swap(published, key, blob)
  publishedVersion.set(key, uploadedAt)
  changed()
}

/** Forget a published recording that has been taken out of the library. */
export async function dropPublished(key: string) {
  await run(PUBLISHED, 'readwrite', (s) => s.delete(key))
  const old = published.get(key)
  if (old) URL.revokeObjectURL(old)
  published.delete(key)
  publishedVersion.delete(key)
  changed()
}

// ---------- backup: one file with every recording made here in it ----------

interface BackupFile {
  app: 'word-nest'
  version: 1
  clips: { key: string; data: string }[]
}

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1])
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })

export async function exportRecordings(): Promise<Blob> {
  const all = await run<Stored[]>(CLIPS, 'readonly', (s) => s.getAll())
  const clips = await Promise.all(all.map(async (c) => ({ key: c.key, data: await toBase64(c.blob) })))
  const file: BackupFile = { app: 'word-nest', version: 1, clips }
  return new Blob([JSON.stringify(file)], { type: 'application/json' })
}

/** Add the recordings from a backup file. Returns how many were imported. */
export async function importRecordings(file: File): Promise<number> {
  const parsed = JSON.parse(await file.text()) as BackupFile
  if (parsed.app !== 'word-nest' || !Array.isArray(parsed.clips)) throw new Error('Not a Word Nest backup')
  let count = 0
  for (const clip of parsed.clips) {
    if (!/^(sounds|rimes|words|prompts)\/[\w-]+$/.test(clip.key)) continue
    const bytes = Uint8Array.from(atob(clip.data), (c) => c.charCodeAt(0))
    await saveRecording(clip.key, new Blob([bytes], { type: 'audio/wav' }))
    count++
  }
  return count
}
