import { sentenceWords } from '../data/course'
import { pause, word, type Clip } from './audio'

/** A sentence split into the words a child touches, keeping the punctuation that follows each one. */
export interface Token {
  /** As written, e.g. "The". */
  shown: string
  /** The word to say, e.g. "the". */
  key: string
  /** A full stop, question mark and so on right after the word. */
  punct: string
}

export function sentenceTokens(text: string): Token[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const shown = raw.replace(/[.,!?]/g, '')
      return { shown, key: shown === 'I' ? 'I' : shown.toLowerCase(), punct: raw.match(/[.,!?]$/)?.[0] ?? '' }
    })
}

/** Say a whole sentence one word at a time. */
export const sentenceClips = (text: string): Clip[] => sentenceWords(text).flatMap((w) => [word(w), pause(150)])
