import type { Word } from './curriculum'

// A word is a row of "parts": the single sounds a child blends. Most parts are one letter, but some
// are two or three letters that make ONE sound (sh, ai, igh). A trailing digit tells apart two
// sounds spelled the same way: "oo" is moon, "oo2" is book. It is never shown.

export const partsOf = (w: Word): string[] => w.parts ?? w.text.split('')

/** What a part looks like on a tile. */
export const shownPart = (part: string) => part.replace(/\d+$/, '')

/** Spellings that share the sound (and the recording) of another one. */
const sameSound: Record<string, string> = {
  ck: 'c',
  ll: 'l',
  ss: 's',
  ir: 'er',
  ur: 'er',
  oy: 'oi',
  ie: 'igh',
}

/** The key of the sound clip to play for a part, e.g. "ur" plays the "er" recording. */
export const soundKeyOf = (part: string) => sameSound[part] ?? part

/** Every sound that has its own recording: the 26 letters and the letter combinations. */
export const letterSounds = 'abcdefghijklmnopqrstuvwxyz'.split('')
export const comboSounds = ['sh', 'ch', 'th', 'ng', 'qu', 'ai', 'ee', 'oa', 'oo', 'oo2', 'ar', 'or', 'er', 'ow', 'oi', 'ou', 'ay', 'ea', 'igh']
export const allSounds = [...letterSounds, ...comboSounds]
