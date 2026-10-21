// Grown-up settings and the children's progress, saved on this device.

export interface Settings {
  /** Built-in voice to use until recordings exist. Empty = pick a British/Indian English voice. */
  voiceURI: string
  speechRate: number
  effects: boolean
}

const SETTINGS_KEY = 'word-nest:settings'
const PROGRESS_KEY = 'word-nest:progress'

const defaults: Settings = { voiceURI: '', speechRate: 0.8, effects: true }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or storage full: the app still works, it just won't remember.
  }
}

let settings: Settings | undefined
export function loadSettings(): Settings {
  return (settings ??= read(SETTINGS_KEY, defaults))
}
export function saveSettings(next: Settings) {
  settings = next
  write(SETTINGS_KEY, next)
}

/** Stars earned per lesson id (0–3). */
export type Progress = Record<string, number>

export function loadProgress(): Progress {
  return read<Progress>(PROGRESS_KEY, {})
}
export function saveStars(lessonId: string, stars: number) {
  const progress = loadProgress()
  progress[lessonId] = Math.max(progress[lessonId] ?? 0, stars)
  write(PROGRESS_KEY, progress)
}
export function resetProgress() {
  write(PROGRESS_KEY, {})
}
