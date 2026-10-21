// Practice games anyone can play at any time. Each one runs eight random rounds.
export interface Game {
  id: string
  color: string
  pic: string
  label: string
}

export const SWAP_ID = 'swap'

export const games: Game[] = [
  { id: SWAP_ID, color: '#ff6b9a', pic: '🐱', label: 'Swap the middle sound' },
  { id: 'game-match', color: '#2f95d6', pic: '🖼️', label: 'Match the picture' },
  { id: 'game-build', color: '#2fbf71', pic: '🧱', label: 'Build the word' },
  { id: 'game-blend', color: '#9b6bff', pic: '🛝', label: 'Slide and blend' },
  { id: 'game-letters', color: '#f2a900', pic: '🔊', label: 'Which letter?' },
]

export const isGameId = (id: string) => games.some((g) => g.id === id)
