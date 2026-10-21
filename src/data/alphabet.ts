// The Nursery alphabet: one page per letter, A to Z. Each page shows the capital and small letter, how to
// write them, and some words that start with the letter's sound (the short sound for a vowel).
// These words are for looking at and listening to, not for blending, so they are free of the
// "only taught sounds" rule that the reading lessons follow.

export interface AlphabetPage {
  letter: string
  /** Words starting with the sound, each a word in the vocabulary (so each has a picture). */
  words: string[]
  /** For letters whose sound is not at the start of a word. */
  note?: string
}

export const alphabet: AlphabetPage[] = [
  { letter: 'a', words: ['apple', 'alligator', 'ambulance', 'anchor', 'arrow'] },
  { letter: 'b', words: ['ball', 'banana', 'bus', 'bat', 'bed'] },
  { letter: 'c', words: ['cat', 'cap', 'car', 'cow', 'cake'] },
  { letter: 'd', words: ['dog', 'duck', 'drum', 'door', 'deer'] },
  { letter: 'e', words: ['egg', 'elephant', 'elf', 'envelope'] },
  { letter: 'f', words: ['fish', 'fan', 'frog', 'fox', 'fork'] },
  { letter: 'g', words: ['goat', 'girl', 'gift', 'grapes', 'guitar'] },
  { letter: 'h', words: ['hat', 'hen', 'horse', 'house', 'hand'] },
  { letter: 'i', words: ['insect', 'ink', 'iguana', 'infant'] },
  { letter: 'j', words: ['jam', 'jet', 'jug', 'jeep', 'juice'] },
  { letter: 'k', words: ['kite', 'key', 'king', 'kangaroo', 'koala'] },
  { letter: 'l', words: ['lion', 'leaf', 'lemon', 'lamp', 'leg'] },
  { letter: 'm', words: ['monkey', 'moon', 'milk', 'map', 'mug'] },
  { letter: 'n', words: ['net', 'nut', 'nap', 'nose', 'nine'] },
  { letter: 'o', words: ['octopus', 'ox', 'orange', 'otter'] },
  { letter: 'p', words: ['penguin', 'pig', 'pen', 'pot', 'pear'] },
  { letter: 'q', words: ['queen', 'quiz'] },
  { letter: 'r', words: ['rainbow', 'rat', 'rabbit', 'ring', 'robot'] },
  { letter: 's', words: ['snake', 'sun', 'sock', 'star', 'sandwich'] },
  { letter: 't', words: ['tennis', 'tiger', 'tent', 'tree', 'tap'] },
  { letter: 'u', words: ['umbrella', 'unicorn'] },
  { letter: 'v', words: ['van', 'vest', 'violin', 'volcano'] },
  { letter: 'w', words: ['web', 'watch', 'watermelon', 'wolf'] },
  { letter: 'x', words: ['box', 'fox', 'six'], note: 'x is usually at the end of a word' },
  { letter: 'y', words: ['yellow', 'yo-yo', 'yam', 'yawn'] },
  { letter: 'z', words: ['zebra', 'zip', 'zero', 'zap'] },
]

export const findAlphabetPage = (letter: string) => alphabet.find((p) => p.letter === letter)
