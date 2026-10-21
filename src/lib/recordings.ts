// Recordings made in the app are kept in this device's IndexedDB and used instead of the
// built-in voice. Keys look like "sounds/s", "rimes/at", "words/cat", "prompts/well-done".

const DB = 'word-nest-audio'
const STORE = 'clips'

interface Stored {
  key: string
  blob: Blob
  savedAt: number
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'key' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = work(tx.objectStore(STORE))
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
const urls = new Map<string, string>()
const listeners = new Set<() => void>()
const changed = () => listeners.forEach((fn) => fn())

export const onRecordingsChange = (fn: () => void) => {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
export const userClipUrl = (key: string) => urls.get(key)
export const hasUserClip = (key: string) => urls.has(key)
export const userClipCount = () => urls.size

function remember(key: string, blob: Blob) {
  const old = urls.get(key)
  if (old) URL.revokeObjectURL(old)
  urls.set(key, URL.createObjectURL(blob))
}

/** Load every saved recording so lessons can use them. Safe to call when storage is unavailable. */
export async function loadRecordings() {
  try {
    const all = await run<Stored[]>('readonly', (s) => s.getAll())
    all.forEach((c) => remember(c.key, c.blob))
    changed()
  } catch {
    // No IndexedDB (private mode): the app just uses the built-in voice.
  }
}

export async function saveRecording(key: string, blob: Blob) {
  await run('readwrite', (s) => s.put({ key, blob, savedAt: Date.now() } satisfies Stored))
  remember(key, blob)
  changed()
}

export async function deleteRecording(key: string) {
  await run('readwrite', (s) => s.delete(key))
  const old = urls.get(key)
  if (old) URL.revokeObjectURL(old)
  urls.delete(key)
  changed()
}

// ---------- backup: one file with every recording in it ----------

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
  const all = await run<Stored[]>('readonly', (s) => s.getAll())
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
