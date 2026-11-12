// Practice games anyone can play at any time. Each one runs eight random rounds.
export interface Game {
  id: string
  color: string
  pic: string
  label: string
}

export const SWAP_ID = 'swap'

export const games: Game[] = [
  { id: SWAP_ID, color: '#e85d8f', pic: '🐱', label: 'Swap the middle sound' },
  { id: 'game-match', color: '#2e8bff', pic: '🖼️', label: 'Match the picture' },
  { id: 'game-build', color: '#2fb86a', pic: '🧱', label: 'Build the word' },
  { id: 'game-blend', color: '#7c5cff', pic: '🛝', label: 'Slide and blend' },
  { id: 'game-letters', color: '#f29a12', pic: '🔊', label: 'Which sound?' },
  { id: 'game-tiles', color: '#e85d8f', pic: '🧩', label: 'Build it from sounds' },
  { id: 'game-pickword', color: '#7c5cff', pic: '👂', label: 'Which word did you hear?' },
  { id: 'game-sentence', color: '#17b3a3', pic: '📝', label: 'Build the sentence' },
]

export const isGameId = (id: string) => games.some((g) => g.id === id)
