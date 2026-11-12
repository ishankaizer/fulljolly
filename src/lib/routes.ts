import { alphabet, findAlphabetPage } from '../data/alphabet'
import { allLessons, findLesson, pathway, soundLessons, SWAP } from '../data/course'
import { familyId, findFamily, units } from '../data/curriculum'
import { books, findBook } from '../data/books'
import { games } from '../data/games'

/** A page that can go in a class-work list. */
export interface Page {
  /** Route without the leading slash, e.g. "alphabet/a". */
  route: string
  label: string
  /** Section it belongs to, for grouping in the class-work builder. */
  section: 'Letters A to Z' | 'Sounds' | 'Word families' | 'Words and sentences' | 'Books' | 'Games'
  /** Progress id used for stars. */
  progressId?: string
}

const upper = (l: string) => l.toUpperCase()

const letterPages: Page[] = alphabet.map((p) => ({
  route: `alphabet/${p.letter}`,
  label: `${upper(p.letter)}${p.letter}`,
  section: 'Letters A to Z',
  progressId: `abc-${p.letter}`,
}))

const soundPages: Page[] = soundLessons.map((l) => ({
  route: `lesson/${l.id}`,
  label: l.caption ? `${l.label} (${l.caption})` : l.label,
  section: 'Sounds',
  progressId: l.id,
}))

const familyPages: Page[] = units.flatMap((u) =>
  u.families.map((f) => ({ route: `lesson/${familyId(u.vowel, f.rime)}`, label: `-${f.rime}`, section: 'Word families' as const, progressId: familyId(u.vowel, f.rime) })),
)

const wordPages: Page[] = allLessons
  .filter((l) => l.kind !== 'sound')
  .map((l) => ({
    route: `lesson/${l.id}`,
    label: l.kind === 'pattern' ? l.label : l.kind === 'tricky' ? `Tricky words ${l.id.split('-')[1]}` : `Sentences ${l.id.split('-')[1]}`,
    section: 'Words and sentences' as const,
    progressId: l.id,
  }))

const bookPages: Page[] = books.map((b) => ({ route: `book/${b.id}`, label: b.title, section: 'Books', progressId: `book-${b.id}` }))
const gamePages: Page[] = games.map((g) => ({ route: `lesson/${g.id}`, label: g.label, section: 'Games', progressId: g.id }))

export const allPages: Page[] = [...letterPages, ...soundPages, ...familyPages, ...wordPages, ...bookPages, ...gamePages]
export const pageByRoute = (route: string) => allPages.find((p) => p.route === route)

/** A readable name for any route, for the class-work list and the share message. */
export function describe(route: string): string {
  const known = pageByRoute(route)
  if (known) {
    if (known.section === 'Letters A to Z') return `Letter ${known.label}`
    if (known.section === 'Sounds') return `Sound ${known.label}`
    if (known.section === 'Word families') return `The ${known.label} family`
    return known.label
  }
  const [kind, id] = route.split('/')
  if (kind === 'vowel') return `Vowel ${id}`
  if (kind === 'alphabet' && findAlphabetPage(id)) return `Letter ${upper(id)}${id}`
  if (kind === 'book') return findBook(id)?.title ?? 'Book'
  if (kind === 'lesson') {
    const f = findFamily(id)
    if (f) return `The -${f.family.rime} family`
    const l = findLesson(id)
    if (l) return l.lesson.label
    if (id === SWAP) return 'Swap the middle sound'
  }
  return 'Page'
}

export const sections: Page['section'][] = ['Letters A to Z', 'Sounds', 'Word families', 'Words and sentences', 'Books', 'Games']

/** How far a child has got: lessons with at least one star, out of how many there are. */
export function progressSummary(stars: Record<string, number>) {
  const done = (pages: Page[]) => pages.filter((p) => (stars[p.progressId!] ?? 0) > 0).length
  return sections.map((s) => {
    const pages = allPages.filter((p) => p.section === s)
    return { section: s, done: done(pages), total: pages.length }
  })
}

export { pathway }
