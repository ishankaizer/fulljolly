import { motion } from 'framer-motion'
import { alphabet } from '../data/alphabet'
import { go } from '../lib/router'
import { currentProfile, loadProgress } from '../lib/settings'
import { prompt } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Pip } from '../components/Pip'
import { Icon, Stars } from '../components/ui'
import { TabShell } from '../components/TabShell'

export const letterColors = ['#ff6b5e', '#2fb86a', '#7c5cff', '#2e8bff', '#f29a12', '#e85d8f']
export const colorForLetter = (letter: string) => letterColors[(letter.charCodeAt(0) - 97) % letterColors.length]

/** The front door: a card for every letter, A to Z. Opening one shows that letter's page. */
export function AlphabetHome() {
  return (
    <TabShell tab="abc" title="A to Z">
      <Welcome />
      <Cards />
    </TabShell>
  )
}

/** Pip says hello and offers the next letter the child has not finished yet. */
function Welcome() {
  const progress = loadProgress()
  const { talking, say } = useVoice()
  const next = alphabet.find((p) => !progress[`abc-${p.letter}`]) ?? alphabet[0]
  const started = alphabet.some((p) => progress[`abc-${p.letter}`])
  return (
    <section className="welcome">
      <button type="button" className="pip-button" onClick={() => say(prompt('welcome'))} aria-label="Talk to Pip">
        <Pip mood={talking ? 'talk' : 'idle'} size={84} />
      </button>
      <div className="welcome-text">
        <h2>Hi, {currentProfile().name}!</h2>
        <p>{started ? 'Ready for your next letter?' : 'Tap a letter to begin.'}</p>
      </div>
      <motion.button
        type="button"
        className="go-btn"
        whileTap={{ scale: 0.94, y: 3 }}
        onClick={() => go(`/alphabet/${next.letter}`)}
        aria-label={`${started ? 'Keep going' : 'Start'} with letter ${next.letter.toUpperCase()}`}
      >
        <span className="go-btn-letters">
          {next.letter.toUpperCase()}
          {next.letter}
        </span>
        {Icon.play}
      </motion.button>
    </section>
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
