import { units, type Word } from './curriculum'
import { soundLessons } from './course'
import { allSounds, shownPart } from './graphemes'
import { promptLines } from './prompts'
import { readerWords } from './books'
import { allWords } from './vocab'

// Everything that can be recorded into the sound library, with the guidance shown to whoever is recording.

export type ClipGroup = 'sounds' | 'rimes' | 'words' | 'prompts'

export interface RecordItem {
  /** Storage key, e.g. "sounds/sh". Matches the file layout under src/audio/. */
  key: string
  group: ClipGroup
  /** What it is called in lists, e.g. "sh" or "oo (book)". */
  name: string
  /** Text for the tile shown while recording a sound. */
  tile?: string
  /** A word that starts with (or contains) the sound, with its picture. */
  keyword?: Word
  /** What the child will see, for word recordings. */
  word?: Word
  hint: string
  /** How long to listen before stopping on its own. */
  maxMs: number
}

export const groupTitles: Record<ClipGroup, string> = {
  sounds: 'Letter sounds and combinations',
  rimes: 'Word endings',
  words: 'Words',
  prompts: "Pip's instructions",
}

const vowelHints: Record<string, string> = {
  a: 'The short sound, like the start of “apple”. Not the letter name “ay”.',
  e: 'The short sound, like the start of “egg”. Not the letter name “ee”.',
  i: 'The short sound, like the start of “insect”. Not the letter name “eye”.',
  o: 'The short sound, like the start of “octopus”. Not the letter name “oh”.',
  u: 'The short sound, like the start of “umbrella”. Not the letter name “you”.',
}

const specialHints: Record<string, string> = {
  w: 'Round your lips, like the start of “web”. Not the letter name “double-you”.',
  y: 'The sound at the start of “yellow”. Not the letter name “why”.',
  x: 'Two quick sounds, “ks”, as at the end of “box”. Not the letter name.',
  q: 'The letter q always comes with u. Say “kw”, as at the start of “queen”.',
  j: 'Quick and crisp, as at the start of “jet”. No “uh” on the end.',
  sh: 'A soft, long “shhh”, like asking someone to be quiet. As in “ship”.',
  ch: 'A quick “ch”, like a sneeze or a train going “ch ch ch”. As in “chip”.',
  th: 'Put the tip of your tongue gently between your teeth and blow: “thh”. As in “thumb”.',
  ng: 'The sound at the end of “ring”. The back of your tongue rises and the sound goes through your nose.',
  qu: 'Two quick sounds together: “kw”. As in “queen”.',
  ai: 'The long “ay” sound, as in “rain”. Two vowels that make one sound.',
  ee: 'The long “ee” sound, as in “bee”. Two vowels that make one sound.',
  oa: 'The long “oh” sound, as in “boat”. Two vowels that make one sound.',
  oo: 'The long “oo” sound, as in “moon”.',
  oo2: 'The short “oo” sound, as in “book”. Lips rounded and relaxed.',
  ar: 'An open “ar” sound, as in “car”.',
  or: 'The “or” sound, as in “fork”.',
  er: 'The “er” sound, as in “fern”. It is the same sound for er, ir and ur.',
  ow: 'The “ow” sound, as in “cow”, like when something hurts.',
  oi: 'The “oi” sound, as in “coin”. It is spelled oi or oy.',
  ou: 'The “ow” sound, as in “cloud”, spelled ou.',
  ay: 'The long “ay” sound, as in “hay”. The same sound as ai, spelled ay at the end of words.',
  ea: 'The long “ee” sound, as in “leaf”. The same sound as ee.',
  igh: 'The long “eye” sound, as in “light”. It is spelled igh or ie.',
}

const holdable = new Set('fhlmnrsvz')

/** Guidance for making a sound: a letter, or a combination of letters. */
export const letterHint = (key: string) =>
  specialHints[key] ??
  vowelHints[key] ??
  (holdable.has(key)
    ? `Make the sound and hold it for a moment, like “${key.repeat(3)}”. Not the letter name.`
    : 'Say it quick and crisp, with no “uh” on the end. Just the sound, not the letter name.')

const nameOf = (key: string) => (key === 'oo' ? 'oo (moon)' : key === 'oo2' ? 'oo (book)' : key)

/** A word that shows the sound off, taken from the lesson that teaches it. */
const keywordFor = (key: string): Word | undefined =>
  (soundLessons.find((l) => l.soundOf === key) ?? soundLessons.find((l) => l.graphemes.includes(key)) ?? soundLessons.find((l) => l.label === 'qu' && key === 'q'))?.keyword

const wordMap = new Map<string, Word>()
for (const w of allWords) wordMap.set(w.text, w)
for (const l of soundLessons) if (l.keyword) wordMap.set(l.keyword.text, l.keyword)
for (const t of readerWords) if (!wordMap.has(t)) wordMap.set(t, { text: t })

export const recordItems: RecordItem[] = [
  ...allSounds.map(
    (key): RecordItem => ({
      key: `sounds/${key}`,
      group: 'sounds',
      name: nameOf(key),
      tile: shownPart(key),
      keyword: keywordFor(key),
      hint: letterHint(key),
      maxMs: 3000,
    }),
  ),
  ...units.flatMap((u) =>
    u.families.map(
      (f): RecordItem => ({
        key: `rimes/${f.rime}`,
        group: 'rimes',
        name: f.rime,
        hint: `Say the ending as one smooth sound, like the end of “${f.words[0].text}”.`,
        maxMs: 3000,
      }),
    ),
  ),
  ...[...wordMap.values()]
    .sort((a, b) => a.text.localeCompare(b.text))
    .map(
      (w): RecordItem => ({
        key: `words/${w.text.toLowerCase()}`,
        group: 'words',
        name: w.text,
        word: w,
        hint: 'Say the whole word clearly, the way you would say it to a child.',
        maxMs: 4000,
      }),
    ),
  ...Object.entries(promptLines).map(
    ([id, text]): RecordItem => ({
      key: `prompts/${id}`,
      group: 'prompts',
      name: text,
      hint: 'Say this warmly and slowly, as Pip would.',
      maxMs: 10000,
    }),
  ),
]
