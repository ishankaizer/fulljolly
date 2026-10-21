import { motion } from 'framer-motion'
import { alphabet } from '../data/alphabet'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { Stars } from '../components/ui'
import { TabShell } from '../components/TabShell'

export const letterColors = ['#ff7a45', '#2fbf71', '#9b6bff', '#2f95d6', '#f2a900', '#e0638a']
export const colorForLetter = (letter: string) => letterColors[(letter.charCodeAt(0) - 97) % letterColors.length]

/** The front door: a card for every letter, A to Z. Opening one shows that letter's page. */
export function AlphabetHome() {
  return (
    <TabShell tab="abc" title="A to Z">
      <Cards />
    </TabShell>
  )
}

function Cards() {
  const progress = loadProgress()
  return (
    <main className="abc-grid">
      {alphabet.map((page, i) => {
        const color = colorForLetter(page.letter)
        return (
          <motion.button
            key={page.letter}
            type="button"
            className="abc-card"
            style={{ ['--accent' as string]: color }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.4), type: 'spring', stiffness: 240, damping: 18 }}
            whileTap={{ scale: 0.93, y: 3 }}
            onClick={() => go(`/alphabet/${page.letter}`)}
            aria-label={`Letter ${page.letter.toUpperCase()}`}
          >
            <span className="abc-card-letters">
              {page.letter.toUpperCase()}
              {page.letter}
            </span>
            <Stars count={progress[`abc-${page.letter}`] ?? 0} size={14} />
          </motion.button>
        )
      })}
    </main>
  )
}
