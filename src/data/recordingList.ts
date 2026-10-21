import { units, vowelSwaps, type Word } from './curriculum'
import { readerWords } from './books'
import { letterGroups } from './letters'
import { promptLines } from './prompts'

// Everything that can be recorded, with the guidance shown to whoever is recording.

export type ClipGroup = 'sounds' | 'rimes' | 'words' | 'prompts'

export interface RecordItem {
  /** Storage key, e.g. "sounds/s". Matches the file layout under src/audio/. */
  key: string
  group: ClipGroup
  name: string
  /** What the child will see. */
  word?: Word
  hint: string
  /** How long to listen before stopping on its own. */
  maxMs: number
}

export const groupTitles: Record<ClipGroup, string> = {
  sounds: 'Letter sounds',
  rimes: 'Word endings',
  words: 'Words',
  prompts: "Pip's instructions",
}

const vowelHints: Record<string, string> = {
  a: "The short sound, like the start of “apple”. Not the letter name “ay”.",
  e: "The short sound, like the start of “egg”. Not the letter name “ee”.",
  i: "The short sound, like the start of “insect”. Not the letter name “eye”.",
  o: "The short sound, like the start of “octopus”. Not the letter name “oh”.",
  u: "The short sound, like the start of “umbrella”. Not the letter name “you”.",
}
const holdable = new Set('fhlmnrsvz')
export const letterHint = (l: string) =>
  vowelHints[l] ??
  (holdable.has(l)
    ? `Make the sound and hold it for a moment, like “${l.repeat(3)}”. Not the letter name.`
    : `Say it quick and crisp, with no “uh” on the end. Just the sound, not the letter name.`)

const letters = [
  ...new Set(
    units.flatMap((u) => [u.vowel, ...u.families.flatMap((f) => f.words.flatMap((w) => w.text.split('')))]),
  ),
].sort((a, b) => Number('aeiou'.includes(b)) - Number('aeiou'.includes(a)) || a.localeCompare(b))

const wordMap = new Map<string, Word>()
for (const u of units) {
  wordMap.set(u.keyword.text, u.keyword)
  for (const f of u.families) for (const w of f.words) wordMap.set(w.text, w)
}
for (const s of vowelSwaps) for (const w of s.words) wordMap.set(w.text, w)
for (const g of letterGroups) for (const l of g.lessons) wordMap.set(l.keyword.text, l.keyword)
for (const t of readerWords) if (!wordMap.has(t)) wordMap.set(t, { text: t })

export const recordItems: RecordItem[] = [
  ...letters.map((l): RecordItem => ({ key: `sounds/${l}`, group: 'sounds', name: l, hint: letterHint(l), maxMs: 3000 })),
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
        key: `words/${w.text}`,
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
