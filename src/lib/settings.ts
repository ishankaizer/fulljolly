// Grown-up settings, the children's profiles and their progress, saved on this device.

export interface Settings {
  /** Built-in voice to use until recordings exist. Empty = pick a British/Indian English voice. */
  voiceURI: string
  speechRate: number
  effects: boolean
}

export interface Profile {
  id: string
  name: string
  avatar: string
}

const SETTINGS_KEY = 'word-nest:settings'
const PROFILES_KEY = 'word-nest:profiles'
const progressKey = (profileId: string) => `word-nest:progress:${profileId}`

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

// ---------- profiles: each child has their own stars ----------

export const avatars = ['🦁', '🐯', '🐼', '🐨', '🐸', '🐰', '🦊', '🐙', '🦄', '🐵']

interface ProfileStore {
  list: Profile[]
  current: string
}

const newId = () => 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36)

let store: ProfileStore | undefined
function profileStore(): ProfileStore {
  if (!store) {
    const saved = read<ProfileStore>(PROFILES_KEY, { list: [], current: '' })
    if (!saved.list.length) {
      const first: Profile = { id: newId(), name: 'Player 1', avatar: avatars[0] }
      saved.list = [first]
      saved.current = first.id
    }
    if (!saved.list.some((p) => p.id === saved.current)) saved.current = saved.list[0].id
    store = saved
    write(PROFILES_KEY, store)
  }
  return store
}
const saveStore = () => write(PROFILES_KEY, profileStore())

export const getProfiles = () => profileStore().list
export const currentProfile = (): Profile => {
  const s = profileStore()
  return s.list.find((p) => p.id === s.current)!
}
export function switchProfile(id: string) {
  profileStore().current = id
  saveStore()
}
export function addProfile(name: string, avatar: string): Profile {
  const profile: Profile = { id: newId(), name: name.trim() || `Player ${getProfiles().length + 1}`, avatar }
  profileStore().list.push(profile)
  saveStore()
  return profile
}
export function updateProfile(id: string, patch: Partial<Pick<Profile, 'name' | 'avatar'>>) {
  const p = profileStore().list.find((x) => x.id === id)
  if (p) Object.assign(p, patch)
  saveStore()
}
export function removeProfile(id: string) {
  const s = profileStore()
  if (s.list.length < 2) return
  s.list = s.list.filter((p) => p.id !== id)
  if (s.current === id) s.current = s.list[0].id
  try {
    localStorage.removeItem(progressKey(id))
  } catch {
    // nothing to clean up
  }
  saveStore()
}

// ---------- progress ----------

/** Stars earned per lesson id (0–3) for the child who is playing. */
export type Progress = Record<string, number>

export function loadProgress(): Progress {
  return read<Progress>(progressKey(currentProfile().id), {})
}
export function saveStars(lessonId: string, stars: number) {
  const progress = loadProgress()
  progress[lessonId] = Math.max(progress[lessonId] ?? 0, stars)
  write(progressKey(currentProfile().id), progress)
}
export function resetProgress(profileId = currentProfile().id) {
  write(progressKey(profileId), {})
}
export function progressFor(profileId: string): Progress {
  return read<Progress>(progressKey(profileId), {})
}
