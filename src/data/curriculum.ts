// All lesson content lives here. To change what the children learn, edit this file:
// add or remove a word, add a new family, or swap a picture. No other code needs to change.
//
// Each word family is a group of words that share an ending ("rime"), e.g. -at: bat, cat, hat.
// Families marked `fromMama: true` are exactly as Mama listed them; the rest are drafts for her to review.

export type Vowel = 'a' | 'e' | 'i' | 'o' | 'u'

export interface Word {
  text: string
  /** Picture shown with the word. Emoji for now; can later point at an illustration. */
  pic?: string
}

export interface Family {
  /** The shared ending, e.g. "at". */
  rime: string
  words: Word[]
  fromMama?: boolean
  /**
   * How the robot voice should say the ending when there's no recording yet.
   * Needed because some voices read "eg" as "e.g." or "op" as "O.P.".
   */
  say?: string
}

export interface VowelUnit {
  vowel: Vowel
  /** Example word the children already know for this vowel sound. */
  keyword: Word
  families: Family[]
}

export const units: VowelUnit[] = [
  {
    vowel: 'a',
    keyword: { text: 'apple', pic: '🍎' },
    families: [
      {
        rime: 'at',
        fromMama: true,
        words: [
          { text: 'bat', pic: '🦇' },
          { text: 'cat', pic: '🐱' },
          { text: 'fat' },
          { text: 'hat', pic: '🎩' },
          { text: 'mat' },
          { text: 'pat' },
          { text: 'rat', pic: '🐀' },
          { text: 'sat', pic: '🪑' },
          { text: 'vat', pic: '🛢️' },
        ],
      },
      {
        rime: 'am',
        fromMama: true,
        words: [
          { text: 'ham', pic: '🍖' },
          { text: 'jam', pic: '🍓' },
          { text: 'mam', pic: '👩' },
          { text: 'ram', pic: '🐏' },
          { text: 'yam', pic: '🍠' },
        ],
      },
      {
        rime: 'an',
        words: [
          { text: 'can', pic: '🥫' },
          { text: 'fan', pic: '🪭' },
          { text: 'man', pic: '👨' },
          { text: 'pan', pic: '🍳' },
          { text: 'ran', pic: '🏃' },
          { text: 'van', pic: '🚐' },
        ],
      },
      {
        rime: 'ap',
        words: [
          { text: 'cap', pic: '🧢' },
          { text: 'map', pic: '🗺️' },
          { text: 'nap', pic: '😴' },
          { text: 'tap', pic: '🚰' },
          { text: 'lap' },
        ],
      },
      {
        rime: 'ad',
        words: [
          { text: 'dad', pic: '👨' },
          { text: 'sad', pic: '😢' },
          { text: 'mad', pic: '😠' },
          { text: 'pad', pic: '📝' },
          { text: 'had' },
        ],
      },
      {
        rime: 'ag',
        say: 'agg',
        words: [
          { text: 'bag', pic: '👜' },
          { text: 'tag', pic: '🏷️' },
          { text: 'wag', pic: '🐕' },
          { text: 'rag' },
        ],
      },
    ],
  },
  {
    vowel: 'e',
    keyword: { text: 'egg', pic: '🥚' },
    families: [
      {
        rime: 'et',
        say: 'ett',
        words: [
          { text: 'jet', pic: '✈️' },
          { text: 'net', pic: '🥅' },
          { text: 'pet', pic: '🐶' },
          { text: 'vet', pic: '🩺' },
          { text: 'wet', pic: '💧' },
          { text: 'get' },
        ],
      },
      {
        rime: 'en',
        words: [
          { text: 'hen', pic: '🐔' },
          { text: 'pen', pic: '🖊️' },
          { text: 'ten', pic: '🔟' },
          { text: 'men', pic: '👬' },
          { text: 'den' },
        ],
      },
      {
        rime: 'ed',
        words: [
          { text: 'bed', pic: '🛏️' },
          { text: 'red', pic: '🔴' },
          { text: 'fed', pic: '🍼' },
          { text: 'led' },
        ],
      },
      {
        rime: 'eg',
        say: 'egg',
        words: [
          { text: 'leg', pic: '🦵' },
          { text: 'peg', pic: '🧷' },
          { text: 'beg', pic: '🙏' },
        ],
      },
    ],
  },
  {
    vowel: 'i',
    keyword: { text: 'insect', pic: '🐜' },
    families: [
      {
        rime: 'it',
        words: [
          { text: 'sit', pic: '🪑' },
          { text: 'kit', pic: '🧰' },
          { text: 'hit', pic: '🏏' },
          { text: 'fit', pic: '💪' },
          { text: 'bit' },
          { text: 'pit' },
        ],
      },
      {
        rime: 'in',
        words: [
          { text: 'bin', pic: '🗑️' },
          { text: 'pin', pic: '📌' },
          { text: 'tin', pic: '🥫' },
          { text: 'win', pic: '🏆' },
          { text: 'fin', pic: '🦈' },
        ],
      },
      {
        rime: 'ip',
        say: 'ipp',
        words: [
          { text: 'lip', pic: '👄' },
          { text: 'zip', pic: '🤐' },
          { text: 'sip', pic: '🥤' },
          { text: 'dip' },
          { text: 'tip' },
        ],
      },
      {
        rime: 'ig',
        say: 'igg',
        words: [
          { text: 'pig', pic: '🐷' },
          { text: 'dig', pic: '⛏️' },
          { text: 'fig', pic: '🫐' },
          { text: 'big', pic: '🐘' },
          { text: 'wig' },
        ],
      },
    ],
  },
  {
    vowel: 'o',
    keyword: { text: 'octopus', pic: '🐙' },
    families: [
      {
        rime: 'ot',
        say: 'ott',
        words: [
          { text: 'cot', pic: '🛏️' },
          { text: 'dot', pic: '⚫' },
          { text: 'hot', pic: '🔥' },
          { text: 'pot', pic: '🍲' },
          { text: 'not' },
        ],
      },
      {
        rime: 'op',
        say: 'opp',
        words: [
          { text: 'hop', pic: '🐇' },
          { text: 'mop', pic: '🧹' },
          { text: 'top', pic: '🔝' },
          { text: 'pop', pic: '🎈' },
        ],
      },
      {
        rime: 'og',
        say: 'ogg',
        words: [
          { text: 'dog', pic: '🐶' },
          { text: 'fog', pic: '🌫️' },
          { text: 'log', pic: '🪵' },
          { text: 'hog', pic: '🐗' },
          { text: 'jog', pic: '🏃' },
        ],
      },
    ],
  },
  {
    vowel: 'u',
    keyword: { text: 'umbrella', pic: '☂️' },
    families: [
      {
        rime: 'ut',
        say: 'utt',
        words: [
          { text: 'cut', pic: '✂️' },
          { text: 'hut', pic: '🛖' },
          { text: 'nut', pic: '🥜' },
          { text: 'but' },
        ],
      },
      {
        rime: 'un',
        words: [
          { text: 'bun', pic: '🍞' },
          { text: 'sun', pic: '☀️' },
          { text: 'run', pic: '🏃' },
          { text: 'fun', pic: '🎉' },
        ],
      },
      {
        rime: 'ug',
        say: 'ugg',
        words: [
          { text: 'bug', pic: '🐛' },
          { text: 'hug', pic: '🤗' },
          { text: 'jug', pic: '🫗' },
          { text: 'mug', pic: '☕' },
          { text: 'rug' },
        ],
      },
      {
        rime: 'um',
        words: [
          { text: 'mum', pic: '👩' },
          { text: 'gum', pic: '🍬' },
          { text: 'hum', pic: '🎶' },
          { text: 'sum', pic: '➕' },
        ],
      },
    ],
  },
]

/**
 * "Change the middle sound" games: the same first and last letter with a different vowel,
 * e.g. c_t → cat, cot, cut. Every word listed must be a real word.
 */
export interface SwapFrame {
  first: string
  last: string
  words: Word[]
}

export const vowelSwaps: SwapFrame[] = [
  { first: 'c', last: 't', words: [{ text: 'cat', pic: '🐱' }, { text: 'cot', pic: '🛏️' }, { text: 'cut', pic: '✂️' }] },
  { first: 'h', last: 't', words: [{ text: 'hat', pic: '🎩' }, { text: 'hit', pic: '🏏' }, { text: 'hot', pic: '🔥' }, { text: 'hut', pic: '🛖' }] },
  { first: 'p', last: 'n', words: [{ text: 'pan', pic: '🍳' }, { text: 'pen', pic: '🖊️' }, { text: 'pin', pic: '📌' }] },
  { first: 'b', last: 'g', words: [{ text: 'bag', pic: '👜' }, { text: 'big', pic: '🐘' }, { text: 'bug', pic: '🐛' }] },
  { first: 'p', last: 't', words: [{ text: 'pet', pic: '🐶' }, { text: 'pit' }, { text: 'pot', pic: '🍲' }] },
  { first: 'b', last: 'd', words: [{ text: 'bad' }, { text: 'bed', pic: '🛏️' }, { text: 'bud', pic: '🌱' }] },
]

export const familyId = (vowel: Vowel, rime: string) => `${vowel}-${rime}`

export function findFamily(id: string): { unit: VowelUnit; family: Family } | undefined {
  for (const unit of units) {
    for (const family of unit.families) {
      if (familyId(unit.vowel, family.rime) === id) return { unit, family }
    }
  }
  return undefined
}
