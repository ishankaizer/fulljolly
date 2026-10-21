import { Howl } from 'howler'
import { promptLines } from '../data/prompts'
import { soundKeyOf } from '../data/graphemes'
import { userClipUrl } from './recordings'
import { loadSettings } from './settings'

// Recorded audio lives in src/audio/{sounds,rimes,words,prompts}/<name>.mp3 (or .m4a/.wav/.ogg).
// Anything that has a recording plays the recording. Anything that doesn't falls back to the
// device's built-in voice, so the app works before every sound has been recorded.
const files = import.meta.glob('../audio/**/*.{mp3,m4a,wav,ogg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const recordings = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const m = path.match(/audio\/(\w+)\/([^/]+)\.\w+$/)
  if (m) recordings.set(`${m[1]}/${m[2].toLowerCase()}`, url)
}

/**
 * What the built-in voice says for a letter sound until a real recording exists.
 * Robot voices can't make pure phonics sounds well, so these are rough stand-ins.
 * Recording them (src/audio/sounds/a.mp3 etc.) is the most important audio job.
 */
const soundFallback: Record<string, string> = {
  a: 'a', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'hhh', i: 'ih',
  j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', o: 'o', p: 'puh', q: 'kwuh', r: 'rrr',
  s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
  // letter combinations
  sh: 'shh', ch: 'ch', th: 'thh', ng: 'ng', qu: 'kw', ai: 'ay', ee: 'ee', oa: 'oh', oo: 'oo',
  oo2: 'uh', ar: 'ar', or: 'or', er: 'er', ow: 'ow', oi: 'oy', ou: 'ow', ay: 'ay', ea: 'ee', igh: 'eye',
}

export type Clip =
  | { kind: 'sound'; letter: string }
  | { kind: 'rime'; rime: string; say?: string }
  | { kind: 'word'; text: string }
  | { kind: 'prompt'; id: string; text: string }
  | { kind: 'pause'; ms: number }

function clipKey(clip: Clip): string | undefined {
  switch (clip.kind) {
    case 'sound': return `sounds/${soundKeyOf(clip.letter)}`
    case 'rime': return `rimes/${clip.rime}`
    case 'word': return `words/${clip.text.toLowerCase()}`
    case 'prompt': return `prompts/${clip.id}`
    default: return undefined
  }
}

/** A recording made in the app wins over a bundled file, which wins over the built-in voice. */
function recordingFor(clip: Clip): string | undefined {
  const key = clipKey(clip)
  return key ? (userClipUrl(key) ?? recordings.get(key)) : undefined
}

function fallbackText(clip: Clip): string {
  switch (clip.kind) {
    case 'sound': return soundFallback[soundKeyOf(clip.letter)] ?? clip.letter
    case 'rime': return clip.say ?? clip.rime
    case 'word': return clip.text
    case 'prompt': return clip.text
    default: return ''
  }
}

export const hasRecording = (clip: Clip) => recordingFor(clip) !== undefined

/** Whether a recording (made in the app or bundled) exists for a storage key like "sounds/sh". */
export const hasRecordedKey = (key: string) => (userClipUrl(key) ?? recordings.get(key)) !== undefined

// Only one thing talks at a time: starting a new clip cancels whatever was playing.
let generation = 0
let current: Howl | undefined
const howls = new Map<string, Howl>()

export function stopAudio() {
  generation++
  current?.stop()
  current = undefined
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

function playFile(url: string, gen: number): Promise<void> {
  return new Promise((resolve) => {
    let howl = howls.get(url)
    if (!howl) {
      // Recordings made in the app are stored as WAV behind blob: URLs that have no file extension.
      howl = new Howl({ src: [url], ...(url.startsWith('blob:') ? { format: ['wav'] } : {}) })
      howls.set(url, howl)
    }
    if (gen !== generation) return resolve()
    current = howl
    const h = howl
    const events = ['end', 'stop', 'loaderror', 'playerror'] as const
    const done = () => {
      events.forEach((e) => h.off(e, done))
      resolve()
    }
    events.forEach((e) => h.on(e, done))
    h.play()
  })
}

let voices: SpeechSynthesisVoice[] = []
function refreshVoices() {
  if ('speechSynthesis' in window) voices = window.speechSynthesis.getVoices()
}
if ('speechSynthesis' in window) {
  refreshVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

export function englishVoices() {
  refreshVoices()
  return voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const { voiceURI } = loadSettings()
  const english = englishVoices()
  return (
    english.find((v) => v.voiceURI === voiceURI) ??
    english.find((v) => v.lang === 'en-GB') ??
    english.find((v) => v.lang === 'en-IN') ??
    english[0]
  )
}

function speak(text: string, gen: number, slow = false): Promise<void> {
  return new Promise((resolve) => {
    if (gen !== generation || !('speechSynthesis' in window)) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    const voice = pickVoice()
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
    }
    u.rate = loadSettings().speechRate * (slow ? 0.85 : 1)
    u.pitch = 1.1
    // Some browsers never fire `end`, so don't let a lesson hang waiting for it.
    const timer = window.setTimeout(resolve, 900 + text.length * 160)
    u.onend = u.onerror = () => {
      window.clearTimeout(timer)
      resolve()
    }
    window.speechSynthesis.speak(u)
  })
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

/** Play clips one after another. Resolves `false` if something else interrupted it. */
export async function play(...clips: Clip[]): Promise<boolean> {
  stopAudio()
  const gen = generation
  // Chrome sometimes drops speech that starts in the same instant as a cancel().
  await wait(60)
  for (const clip of clips) {
    if (gen !== generation) return false
    if (clip.kind === 'pause') {
      await wait(clip.ms)
      continue
    }
    const url = recordingFor(clip)
    if (url) await playFile(url, gen)
    else await speak(fallbackText(clip), gen, clip.kind === 'sound')
  }
  return gen === generation
}

export const sound = (letter: string): Clip => ({ kind: 'sound', letter })
export const word = (text: string): Clip => ({ kind: 'word', text })
export const rime = (r: string, say?: string): Clip => ({ kind: 'rime', rime: r, say })
export const prompt = (id: string): Clip => ({ kind: 'prompt', id, text: promptLines[id] ?? id })
export const pause = (ms: number): Clip => ({ kind: 'pause', ms })

/** Short sound effects, synthesised so there are no extra files to manage. */
let ctx: AudioContext | undefined
function tone(freqs: number[], step = 0.09, type: OscillatorType = 'sine', gain = 0.12) {
  if (!loadSettings().effects) return
  try {
    ctx ??= new AudioContext()
    const t0 = ctx.currentTime
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator()
      const g = ctx!.createGain()
      osc.type = type
      osc.frequency.value = f
      const start = t0 + i * step
      g.gain.setValueAtTime(0, start)
      g.gain.linearRampToValueAtTime(gain, start + 0.015)
      g.gain.exponentialRampToValueAtTime(0.001, start + step * 2.2)
      osc.connect(g).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + step * 2.4)
    })
  } catch {
    // Sound effects are a nice-to-have; never break a lesson over them.
  }
}

export const sfx = {
  tap: () => tone([660], 0.06, 'triangle', 0.08),
  pop: () => tone([520, 880], 0.05, 'triangle', 0.1),
  right: () => tone([523, 659, 784, 1047], 0.08),
  tryAgain: () => tone([392, 330], 0.12, 'triangle', 0.08),
  cheer: () => tone([523, 659, 784, 1047, 784, 1047, 1319], 0.09),
}
