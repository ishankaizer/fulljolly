// Little readers. Every word is one the child can sound out from the lessons, plus a few "tricky"
// words (the, a, on...) that are learned by sight. Pictures come from the nouns listed on each page.

export interface BookPage {
  sentence: string
  /** Words from the lessons whose pictures to show above the sentence. */
  pics: string[]
}

export interface Book {
  id: string
  title: string
  color: string
  /** Word whose picture is the cover. */
  cover: string
  pages: BookPage[]
}

export const trickyWords = ['a', 'the', 'on', 'is', 'in', 'has', 'to', 'I']

export const books: Book[] = [
  {
    id: 'a',
    title: 'The Cat Sat',
    color: '#ff7a45',
    cover: 'cat',
    pages: [
      { sentence: 'The cat sat on a mat.', pics: ['cat', 'mat'] },
      { sentence: 'A rat sat on a hat.', pics: ['rat', 'hat'] },
      { sentence: 'The bat has a cap.', pics: ['bat', 'cap'] },
      { sentence: 'Dad has a van.', pics: ['dad', 'van'] },
    ],
  },
  {
    id: 'e',
    title: 'The Hen',
    color: '#2fbf71',
    cover: 'hen',
    pages: [
      { sentence: 'The hen is in a pen.', pics: ['hen', 'pen'] },
      { sentence: 'A pet is in the net.', pics: ['pet', 'net'] },
      { sentence: 'The jet is red.', pics: ['jet', 'red'] },
      { sentence: 'The vet has a hen.', pics: ['vet', 'hen'] },
    ],
  },
  {
    id: 'i',
    title: 'The Pig',
    color: '#9b6bff',
    cover: 'pig',
    pages: [
      { sentence: 'The pig is big.', pics: ['pig'] },
      { sentence: 'A kit is in the bin.', pics: ['kit', 'bin'] },
      { sentence: 'The pig can dig.', pics: ['pig', 'dig'] },
      { sentence: 'I hit the bin.', pics: ['bin', 'hit'] },
    ],
  },
  {
    id: 'o',
    title: 'The Dog',
    color: '#2f95d6',
    cover: 'dog',
    pages: [
      { sentence: 'The dog is hot.', pics: ['dog', 'hot'] },
      { sentence: 'A pot is on top.', pics: ['pot', 'top'] },
      { sentence: 'The dog can hop.', pics: ['dog', 'hop'] },
      { sentence: 'The log is in the fog.', pics: ['log', 'fog'] },
    ],
  },
  {
    id: 'u',
    title: 'The Bug',
    color: '#f2a900',
    cover: 'bug',
    pages: [
      { sentence: 'The sun is hot.', pics: ['sun', 'hot'] },
      { sentence: 'A bug is on a mug.', pics: ['bug', 'mug'] },
      { sentence: 'A nut is in the hut.', pics: ['nut', 'hut'] },
      { sentence: 'I hug the bug.', pics: ['hug', 'bug'] },
    ],
  },
]

export const findBook = (id: string) => books.find((b) => b.id === id)

/** The separate words of a sentence, without punctuation. */
export const tokens = (sentence: string) => sentence.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean)

const lower = (w: string) => (w === 'I' ? 'I' : w.toLowerCase())

/** Every word used in the books (lower case), for the recording studio. */
export const readerWords = [...new Set(books.flatMap((b) => b.pages.flatMap((p) => tokens(p.sentence).map(lower))))]

export const isTricky = (word: string) => trickyWords.includes(word) || trickyWords.includes(word.toLowerCase())
