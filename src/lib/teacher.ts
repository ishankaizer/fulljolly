import { useEffect, useState } from 'react'

// Teacher mode. The app starts in student mode: children can play but cannot change anything. A teacher
// opens teacher mode with a 4-digit PIN. It switches itself off when the app is closed, after ten quiet minutes,
// or when the teacher taps Lock.

const PIN_KEY = 'word-nest:teacher-pin'
const SESSION_KEY = 'word-nest:teacher-until'
const IDLE_MS = 10 * 60 * 1000

const listeners = new Set<() => void>()
const changed = () => listeners.forEach((fn) => fn())

async function hashPin(pin: string): Promise<string> {
  const text = `word-nest|${pin}`
  try {
    const bytes = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Very old browsers without crypto.subtle: a simple checksum is still better than storing the PIN as typed.
    let h = 5381
    for (const c of text) h = ((h << 5) + h + c.charCodeAt(0)) | 0
    return `x${h}`
  }
}

const readPin = () => {
  try {
    return localStorage.getItem(PIN_KEY) ?? ''
  } catch {
    return ''
  }
}

export const hasPin = () => readPin() !== ''

export async function setPin(pin: string) {
  try {
    localStorage.setItem(PIN_KEY, await hashPin(pin))
  } catch {
    // Storage unavailable: teacher mode still opens for this visit.
  }
}

export async function checkPin(pin: string): Promise<boolean> {
  const stored = readPin()
  return stored !== '' && stored === (await hashPin(pin))
}

const until = () => {
  try {
    return Number(sessionStorage.getItem(SESSION_KEY) ?? 0)
  } catch {
    return 0
  }
}

export const isTeacher = () => until() > Date.now()

function touch() {
  try {
    sessionStorage.setItem(SESSION_KEY, String(Date.now() + IDLE_MS))
  } catch {
    // Without session storage teacher mode lasts until the page is reloaded.
  }
}

let memoryOnly = false
export function unlockTeacher() {
  touch()
  if (!isTeacher()) memoryOnly = true
  changed()
}

export function lockTeacher() {
  memoryOnly = false
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // nothing to clear
  }
  changed()
}

const active = () => isTeacher() || memoryOnly

if (typeof window !== 'undefined') {
  // Any touch keeps teacher mode open; a check once a minute closes it after ten quiet minutes.
  window.addEventListener('pointerdown', () => active() && !memoryOnly && touch(), { passive: true })
  window.setInterval(() => {
    if (!memoryOnly && until() && !isTeacher()) lockTeacher()
  }, 30 * 1000)
}

/** Re-renders when teacher mode is switched on or off. */
export function useTeacher(): boolean {
  const [, setN] = useState(0)
  useEffect(() => {
    const fn = () => setN((n) => n + 1)
    listeners.add(fn)
    return () => void listeners.delete(fn)
  }, [])
  return active()
}

// ---------- class work links ----------
// A class-work link carries its own list of pages in the web address, so it works for anyone who opens it, with
// nothing stored on a server: https://…/#/work/<code>

export interface ClassWork {
  title: string
  /** Routes without the leading slash, e.g. "alphabet/a", "lesson/a-at", "book/cat". */
  items: string[]
}

const toCode = (text: string) => {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromCode = (code: string) => {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export const workCode = (work: ClassWork) => toCode(JSON.stringify([work.title, ...work.items]))

export function parseWork(code: string): ClassWork | undefined {
  try {
    const [title, ...items] = JSON.parse(fromCode(code)) as string[]
    if (typeof title !== 'string' || !items.length || !items.every((i) => typeof i === 'string' && /^[\w/-]{1,40}$/.test(i))) return undefined
    return { title: title.slice(0, 60), items: items.slice(0, 60) }
  } catch {
    return undefined
  }
}

export const linkTo = (route: string) => `${window.location.origin}/#/${route.replace(/^\//, '')}`
export const workLink = (work: ClassWork) => linkTo(`work/${workCode(work)}`)

export const whatsappLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

/** Where the back button of a lesson or letter page should go: back to the class work list that opened it. */
const RETURN_KEY = 'word-nest:return-to'
export const setReturnTo = (route: string) => {
  try {
    sessionStorage.setItem(RETURN_KEY, route)
  } catch {
    // The back button just goes to its usual place.
  }
}
export const getReturnTo = () => {
  try {
    return sessionStorage.getItem(RETURN_KEY) ?? ''
  } catch {
    return ''
  }
}
export const clearReturnTo = () => {
  try {
    sessionStorage.removeItem(RETURN_KEY)
  } catch {
    // nothing to clear
  }
}
