import { familyId, units, type Word } from './curriculum'
import { partsOf, shownPart } from './graphemes'
import { wordByText } from './vocab'

// The whole course, in one place. A child moves along `pathway`; each lesson only uses sounds and
// tricky words taught earlier on it (scripts/check-course.mjs proves that for every word).
//
//   sound      a letter, or letters that make one sound (sh, ai, igh): hear it, trace it, blend words
//   pattern    two letters that each keep their sound (cl, st, nd): the step up to four-letter words
//   tricky     words that can't be sounded out and are learned by sight (the, he, you)
//   sentences  words strung together: read them, match them to pictures, build them in order

export type LessonKind = 'sound' | 'pattern' | 'tricky' | 'sentences'
export type TabName = 'sounds' | 'words' | 'sentences'

export interface Sentence {
  text: string
  /** Words whose pictures show what the sentence says. */
  pics: string[]
}

export interface Lesson {
  /** Route id: "l-s", "p-1", "t-1", "s-1". */
  id: string
  kind: LessonKind
  /** Text on the lesson's card and tile. */
  label: string
  /** Shown instead of the label (sentence lessons). */
  icon?: string
  /** Small text under the label, to tell two "oo" cards apart. */
  caption?: string
  /** The parts this lesson newly teaches. */
  graphemes: string[]
  /** Which sound recording to play for it. */
  soundOf?: string
  keyword?: Word
  /** Letters to trace; by default the letters of the label. */
  trace?: string[]
  /** Blend tiles of a pattern lesson. */
  tiles?: string[]
  /** The words it practises. Letter lessons from group 1 to 3 work theirs out. */
  words?: string[]
  sentences?: Sentence[]
}

export interface Group {
  id: string
  tab: TabName
  title: string
  color: string
  animals: [string, string]
  /** What the child can do after this group, for the lesson plan. */
  goal: string
  lessons: Lesson[]
}

const w = (text: string, pic: string): Word => ({ text, pic })
const sent = (text: string, pics = ''): Sentence => ({ text, pics: pics.split(' ').filter(Boolean) })

function sound(label: string, keyword: Word, extra: Partial<Lesson> = {}): Lesson {
  const letters = shownPart(label)
  return {
    id: `l-${label}`,
    kind: 'sound',
    label: letters,
    graphemes: [label],
    soundOf: label,
    keyword,
    ...extra,
  }
}

function pattern(n: number, tiles: string[], words: string[]): Lesson {
  return {
    id: `p-${n}`,
    kind: 'pattern',
    label: tiles.join(' '),
    graphemes: [],
    tiles,
    words,
    keyword: wordByText(words[0]),
  }
}

export const groups: Group[] = [
  {
    id: 'g1',
    tab: 'sounds',
    title: 'Group 1',
    color: '#ff6f6f',
    animals: ['🦩', '🐯'],
    goal: 'First sounds. Enough letters to blend the first real words.',
    lessons: [
      sound('s', w('snake', '🐍')),
      sound('a', w('apple', '🍎')),
      sound('t', w('tennis', '🎾')),
      sound('i', w('insect', '🐜')),
      sound('p', w('penguin', '🐧')),
      sound('n', w('net', '🥅')),
    ],
  },
  {
    id: 'g2',
    tab: 'sounds',
    title: 'Group 2',
    color: '#b86be0',
    animals: ['🐨', '🦒'],
    goal: 'Blend and read short words such as cat, hen, mat and red.',
    lessons: [
      sound('ck', w('duck', '🦆'), { graphemes: ['c', 'k', 'ck'], soundOf: 'c' }),
      sound('e', w('egg', '🥚')),
      sound('h', w('house', '🏠')),
      sound('r', w('rainbow', '🌈')),
      sound('m', w('monkey', '🐒')),
      sound('d', w('dinosaur', '🦕')),
    ],
  },
  {
    id: 'g3',
    tab: 'sounds',
    title: 'Group 3',
    color: '#2fb7a3',
    animals: ['🦜', '🐘'],
    goal: 'All five short vowels. Read three-letter words in every family.',
    lessons: [
      sound('g', w('goat', '🐐')),
      sound('o', w('octopus', '🐙')),
      sound('u', w('umbrella', '☂️')),
      sound('l', w('lion', '🦁')),
      sound('f', w('frog', '🐸')),
      sound('b', w('ball', '⚽')),
    ],
  },
  {
    id: 'g4',
    tab: 'sounds',
    title: 'Group 4',
    color: '#f2a900',
    animals: ['🦘', '🐻'],
    goal: 'The rest of the alphabet: all 26 letter sounds.',
    lessons: [
      { ...sound('j', w('jet', '✈️')), words: ['jam', 'jet', 'jug'] },
      { ...sound('v', w('van', '🚐')), words: ['van', 'vet', 'vat'] },
      { ...sound('w', w('web', '🕸️')), words: ['web', 'wet', 'win', 'wag'] },
      { ...sound('x', w('fox', '🦊')), words: ['box', 'fox', 'six', 'fix'] },
      { ...sound('y', w('yellow', '🟡')), words: ['yam', 'yum'] },
      { ...sound('z', w('zebra', '🦓')), words: ['zip', 'zap'] },
    ],
  },
  {
    id: 'g5',
    tab: 'sounds',
    title: 'Group 5',
    color: '#2f95d6',
    animals: ['🐬', '🦀'],
    goal: 'Two letters, one sound: sh, ch, th, ng and qu.',
    lessons: [
      { ...sound('qu', w('queen', '👸')), words: ['quiz'] },
      { ...sound('sh', w('ship', '🚢')), words: ['ship', 'shop', 'fish', 'dish', 'cash', 'wish'] },
      { ...sound('ch', w('chip', '🍟')), words: ['chip', 'chop', 'chat', 'chick', 'check', 'rich'] },
      { ...sound('th', w('thumb', '👍')), words: ['bath', 'path', 'think', 'math'] },
      { ...sound('ng', w('ring', '💍')), words: ['ring', 'king', 'song', 'bang', 'sing'] },
    ],
  },
  {
    id: 'g6',
    tab: 'sounds',
    title: 'Group 6',
    color: '#2fbf71',
    animals: ['🦉', '🐢'],
    goal: 'Two vowels back to back that make one sound: ai, ee, oa and oo.',
    lessons: [
      { ...sound('ai', w('rain', '🌧️')), words: ['rain', 'mail', 'train', 'snail', 'paint', 'chain'] },
      { ...sound('ee', w('bee', '🐝')), words: ['bee', 'tree', 'feet', 'sheep', 'green', 'jeep', 'three', 'queen'] },
      { ...sound('oa', w('boat', '⛵')), words: ['boat', 'coat', 'goat', 'road', 'soap'] },
      {
        ...sound('oo', w('moon', '🌙')),
        caption: 'moon',
        words: ['moon', 'spoon', 'boot', 'food', 'tooth', 'pool'],
      },
      {
        ...sound('oo2', w('book', '📖'), { soundOf: 'oo2', trace: ['o'] }),
        label: 'oo',
        caption: 'book',
        words: ['book', 'look', 'good', 'wool', 'cook'],
      },
    ],
  },
  {
    id: 'g7',
    tab: 'sounds',
    title: 'Group 7',
    color: '#e0638a',
    animals: ['🦊', '🐼'],
    goal: 'Vowels with r, and the sounds of cow, coin and cloud.',
    lessons: [
      { ...sound('ar', w('car', '🚗')), words: ['car', 'star', 'farm', 'card', 'dart', 'scarf'] },
      { ...sound('or', w('fork', '🍴')), words: ['fork', 'corn', 'storm', 'horn', 'torch', 'fort'] },
      {
        ...sound('er', w('fern', '🌿'), { graphemes: ['er', 'ir', 'ur'] }),
        words: ['fern', 'shirt', 'skirt', 'bird', 'girl', 'surf', 'church', 'hurt'],
      },
      { ...sound('ow', w('cow', '🐄')), words: ['cow', 'owl', 'down', 'clown', 'brown', 'crown'] },
      {
        ...sound('oi', w('coin', '🪙'), { graphemes: ['oi', 'oy'] }),
        words: ['coin', 'boil', 'toy', 'boy', 'joy'],
      },
      { ...sound('ou', w('cloud', '☁️')), words: ['cloud', 'shout', 'count', 'sound', 'round'] },
    ],
  },
  {
    id: 'g8',
    tab: 'sounds',
    title: 'Group 8',
    color: '#7a6ff0',
    animals: ['🦄', '🐧'],
    goal: 'More ways to spell long vowel sounds: ay, ea, igh and ie.',
    lessons: [
      { ...sound('ay', w('hay', '🌾')), words: ['play', 'clay', 'hay', 'pay', 'crayon'] },
      { ...sound('ea', w('leaf', '🍃')), words: ['leaf', 'tea', 'sea', 'meat', 'peach', 'beach'] },
      {
        ...sound('igh', w('light', '💡'), { graphemes: ['igh', 'ie'] }),
        words: ['light', 'night', 'fight', 'high', 'pie', 'tie'],
      },
    ],
  },
  {
    id: 'blends-start',
    tab: 'words',
    title: 'Four-letter words: starts',
    color: '#ff8a3d',
    animals: ['🐸', '🥁'],
    goal: 'Blend two consonants at the start of a word: clap, frog, stop.',
    lessons: [
      pattern(1, ['cl', 'fl', 'pl'], ['clap', 'clip', 'clock', 'flag', 'plug']),
      pattern(2, ['sl', 'bl'], ['sled', 'black', 'blush']),
      pattern(3, ['br', 'cr', 'dr'], ['brick', 'brush', 'crab', 'drum']),
      pattern(4, ['fr', 'gr', 'tr'], ['frog', 'grin', 'trap', 'tram', 'truck']),
      pattern(5, ['st', 'sp'], ['stop', 'step', 'spin']),
      pattern(6, ['sk', 'sn', 'sw'], ['skunk', 'snack', 'swan']),
    ],
  },
  {
    id: 'blends-end',
    tab: 'words',
    title: 'Four-letter words: endings',
    color: '#3a9bdc',
    animals: ['⛺', '🏦'],
    goal: 'Blend two consonants at the end of a word: hand, lamp, milk.',
    lessons: [
      pattern(7, ['nd', 'nt', 'nk'], ['hand', 'tent', 'bank', 'wind']),
      pattern(8, ['mp', 'ft', 'lk', 'sk', 'st'], ['lamp', 'camp', 'gift', 'milk', 'mask', 'vest']),
    ],
  },
  {
    id: 'tricky',
    tab: 'sentences',
    title: 'Tricky words',
    color: '#8a5cd0',
    animals: ['🦉', '🦋'],
    goal: 'Common words that cannot be sounded out, learned by sight.',
    lessons: [
      {
        id: 't-1',
        kind: 'tricky',
        label: 'the',
        caption: 'tricky',
        graphemes: [],
        words: ['I', 'the', 'a', 'is', 'to', 'has'],
        sentences: [sent('The cat has a hat.', 'cat hat'), sent('I sit on the mat.', 'mat'), sent('A dog is in the bed.', 'dog bed')],
      },
      {
        id: 't-2',
        kind: 'tricky',
        label: 'he',
        caption: 'tricky',
        graphemes: [],
        words: ['he', 'she', 'we', 'me', 'be'],
        sentences: [sent('He is a vet.', 'vet'), sent('She has a hat.', 'hat'), sent('We can hop.', 'hop'), sent('Me and Dad can run.', 'dad')],
      },
      {
        id: 't-3',
        kind: 'tricky',
        label: 'my',
        caption: 'tricky',
        graphemes: [],
        words: ['you', 'they', 'my', 'her', 'was'],
        sentences: [sent('My dog was big.', 'dog'), sent('You can see me.'), sent('Her hat is red.', 'hat red'), sent('They sit on a log.', 'log')],
      },
      {
        id: 't-4',
        kind: 'tricky',
        label: 'are',
        caption: 'tricky',
        graphemes: [],
        words: ['are', 'said', 'have', 'like', 'do', 'go'],
        sentences: [sent('We are in the van.', 'van'), sent('I like the cat.', 'cat'), sent('Go to the shop.', 'shop'), sent('Do you like fish?', 'fish')],
      },
    ],
  },
  {
    id: 'sentences',
    tab: 'sentences',
    title: 'Sentences',
    color: '#2fbf71',
    animals: ['📖', '✏️'],
    goal: 'String words together: read a sentence, match it to its picture, and build it.',
    lessons: [
      {
        id: 's-1',
        kind: 'sentences',
        label: 'S1',
        icon: '🐱',
        caption: 'sentences',
        graphemes: [],
        sentences: [
          sent('The cat sat on a mat.', 'cat mat'),
          sent('A rat is in the bin.', 'rat bin'),
          sent('The pig is big.', 'pig'),
          sent('A dog is on the log.', 'dog log'),
          sent('I sit on a bed.', 'bed'),
          sent('A bug is on the mug.', 'bug mug'),
        ],
      },
      {
        id: 's-2',
        kind: 'sentences',
        label: 'S2',
        icon: '👦',
        caption: 'sentences',
        graphemes: [],
        sentences: [
          sent('He is a vet.', 'vet'),
          sent('She has a hat.', 'hat'),
          sent('We can run to the hut.', 'hut'),
          sent('He can hop on the mat.', 'hop mat'),
          sent('She is in the bath.', 'bath'),
          sent('Me and Dad sit on the bed.', 'dad bed'),
        ],
      },
      {
        id: 's-3',
        kind: 'sentences',
        label: 'S3',
        icon: '🐸',
        caption: 'sentences',
        graphemes: [],
        sentences: [
          sent('My dog is big.', 'dog'),
          sent('You can see the sun.', 'sun'),
          sent('They sit in a boat.', 'boat'),
          sent('She was in the rain.', 'rain'),
          sent('He is a boy.', 'boy'),
          sent('She is a girl.', 'girl'),
          sent('We see a bee on a tree.', 'bee tree'),
          sent('Her hat is red.', 'hat red'),
        ],
      },
      {
        id: 's-4',
        kind: 'sentences',
        label: 'S4',
        icon: '🐑',
        caption: 'sentences',
        graphemes: [],
        sentences: [
          sent('I have a green coat.', 'green coat'),
          sent('The sheep are on the farm.', 'sheep farm'),
          sent('I like to play in the rain.', 'play rain'),
          sent('We like the beach.', 'beach'),
          sent('The king has a crown.', 'king crown'),
          sent('Go to the shop.', 'shop'),
          sent('Do you like fish and chips?', 'fish'),
          sent('I can see a frog on the road.', 'frog road'),
        ],
      },
    ],
  },
]

export const SWAP = 'swap'

export const allLessons: Lesson[] = groups.flatMap((g) => g.lessons)
export const soundLessons = allLessons.filter((l) => l.kind === 'sound')

export function findLesson(id: string): { group: Group; lesson: Lesson } | undefined {
  for (const group of groups) {
    const lesson = group.lessons.find((l) => l.id === id)
    if (lesson) return { group, lesson }
  }
  return undefined
}

const ids = (groupIds: string[]) => groups.filter((g) => groupIds.includes(g.id)).flatMap((g) => g.lessons.map((l) => l.id))
const families = units.flatMap((u) => u.families.map((f) => familyId(u.vowel, f.rime)))

export interface Stage {
  title: string
  /** What the child can do by the end of it. */
  goal: string
  /** Lesson ids in order: course lessons, three-letter families, or the swap game. */
  ids: string[]
}

/**
 * The course in the order a child moves through it. Each step only needs what came before it:
 * letters, the three-letter families, first sentences, two-letter sounds, four-letter words,
 * vowels back to back, then longer sentences.
 */
export const stages: Stage[] = [
  { title: 'Letter sounds', goal: 'Knows the sound of every letter, can trace it, and blends three-letter words.', ids: ids(['g1', 'g2', 'g3', 'g4']) },
  { title: 'Three-letter words', goal: 'Reads and builds words in every vowel family: cat, hen, pig, dog, bug.', ids: families },
  { title: 'First sentences', goal: 'Reads a few tricky words by sight and a short sentence: "The cat sat on a mat."', ids: ['t-1', 's-1'] },
  { title: 'Two letters, one sound', goal: 'Reads sh, ch, th, ng and qu in words: ship, chip, bath, ring.', ids: [...ids(['g5']), 't-2', 's-2'] },
  { title: 'Four-letter words', goal: 'Blends two consonants together: clap, frog, stop, hand, lamp.', ids: ids(['blends-start', 'blends-end']) },
  { title: 'Two vowels back to back', goal: 'Reads vowel teams and r-vowels: rain, bee, boat, moon, car, fork, cow.', ids: ids(['g6', 'g7', 'g8']) },
  { title: 'Longer sentences', goal: 'Reads and builds sentences such as "He is a boy." and "I like to play in the rain."', ids: ['t-3', 's-3', 't-4', 's-4'] },
  { title: 'Practice', goal: 'Plays with the vowel in the middle of a word: cat, cot, cut.', ids: [SWAP] },
]

export const pathway: string[] = stages.flatMap((s) => s.ids)

/** Sound parts the child has been taught by the end of this lesson. */
export function knownThrough(lessonId: string): Set<string> {
  const known = new Set<string>()
  for (const id of pathway) {
    const found = findLesson(id)
    found?.lesson.graphemes.forEach((g) => known.add(g))
    if (id === lessonId) break
  }
  return known
}

/** The words a lesson practises. */
export function lessonWords(lesson: Lesson): Word[] {
  if (lesson.words) return lesson.words.map((t) => wordByText(t)).filter((x): x is Word => Boolean(x))
  // Groups 1 to 3: every three-letter word using only letters taught so far, with this lesson's letter.
  const known = knownThrough(lesson.id)
  const seen = new Set<string>()
  const out: Word[] = []
  for (const u of units)
    for (const f of u.families)
      for (const word of f.words) {
        const parts = partsOf(word)
        if (seen.has(word.text)) continue
        if (parts.every((p) => known.has(p)) && parts.some((p) => lesson.graphemes.includes(p))) {
          seen.add(word.text)
          out.push(word)
        }
      }
  return out
}

/** Letters to trace for a sound lesson. */
export const traceLetters = (lesson: Lesson): string[] => lesson.trace ?? [...new Set(shownPart(lesson.label).split(''))]

/** Words of a sentence without punctuation, lower case (except I). */
export const sentenceWords = (text: string): string[] =>
  text
    .replace(/[.,!?]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t === 'I' ? 'I' : t.toLowerCase()))

/** The tricky words taught on the way to a lesson. */
export function trickyThrough(lessonId: string): Set<string> {
  const out = new Set<string>()
  for (const id of pathway) {
    const found = findLesson(id)
    if (found?.lesson.kind === 'tricky') found.lesson.words?.forEach((t) => out.add(t))
    if (id === lessonId) break
  }
  return out
}
