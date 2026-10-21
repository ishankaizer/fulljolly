import { units, type Word } from './curriculum'

// Letter lessons, taught in groups the way phonics is usually ordered: a few letters at a time,
// so that children can blend real words as early as possible. Each lesson is one sound.

export interface LetterLesson {
  /** Route id, e.g. "l-s". */
  id: string
  /** Text on the tile: one letter, or "ck". */
  label: string
  /** The letters this lesson teaches (ck teaches both c and k). */
  letters: string[]
  /** Letter whose recorded sound is played for this lesson. */
  soundOf: string
  /** A word that starts with the sound, with its picture. */
  keyword: Word
}

export interface LetterGroup {
  n: number
  color: string
  animals: [string, string]
  lessons: LetterLesson[]
}

const lesson = (label: string, keyword: Word, soundOf = label[0]): LetterLesson => ({
  id: `l-${label}`,
  label,
  letters: label.split(''),
  soundOf,
  keyword,
})

export const letterGroups: LetterGroup[] = [
  {
    n: 1,
    color: '#ff6f6f',
    animals: ['🦩', '🐯'],
    lessons: [
      lesson('s', { text: 'snake', pic: '🐍' }),
      lesson('a', { text: 'apple', pic: '🍎' }),
      lesson('t', { text: 'tennis', pic: '🎾' }),
      lesson('i', { text: 'insect', pic: '🐜' }),
      lesson('p', { text: 'penguin', pic: '🐧' }),
      lesson('n', { text: 'net', pic: '🥅' }),
    ],
  },
  {
    n: 2,
    color: '#b86be0',
    animals: ['🐨', '🦒'],
    lessons: [
      lesson('ck', { text: 'duck', pic: '🦆' }, 'c'),
      lesson('e', { text: 'egg', pic: '🥚' }),
      lesson('h', { text: 'house', pic: '🏠' }),
      lesson('r', { text: 'rainbow', pic: '🌈' }),
      lesson('m', { text: 'monkey', pic: '🐒' }),
      lesson('d', { text: 'dinosaur', pic: '🦕' }),
    ],
  },
  {
    n: 3,
    color: '#2fb7a3',
    animals: ['🦜', '🐘'],
    lessons: [
      lesson('g', { text: 'goat', pic: '🐐' }),
      lesson('o', { text: 'octopus', pic: '🐙' }),
      lesson('u', { text: 'umbrella', pic: '☂️' }),
      lesson('l', { text: 'lion', pic: '🦁' }),
      lesson('f', { text: 'frog', pic: '🐸' }),
      lesson('b', { text: 'ball', pic: '⚽' }),
    ],
  },
]

export const letterLessons = letterGroups.flatMap((g) => g.lessons)

export function findLetterLesson(id: string) {
  for (const group of letterGroups) {
    const lesson = group.lessons.find((l) => l.id === id)
    if (lesson) return { group, lesson }
  }
  return undefined
}

const everyWord = [...new Map(units.flatMap((u) => u.families.flatMap((f) => f.words)).map((w) => [w.text, w])).values()]

/** Real words the child can already sound out that use this lesson's letter. */
export function blendableWords(target: LetterLesson): Word[] {
  const known = new Set(letterLessons.slice(0, letterLessons.indexOf(target) + 1).flatMap((l) => l.letters))
  return everyWord.filter((w) => {
    const letters = w.text.split('')
    return letters.every((l) => known.has(l)) && letters.some((l) => target.letters.includes(l))
  })
}

/** Every word that can be sounded out using only letters taught in the lessons. */
export const letterWords = everyWord
