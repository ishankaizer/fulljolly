import { motion } from 'framer-motion'
import { go } from '../lib/router'
import { prompt } from '../lib/audio'
import { loadProgress } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { Pip } from '../components/Pip'
import { GroupGrid } from '../components/GroupGrid'
import { TabShell } from '../components/TabShell'
import { lessonOrder } from './Lesson'

/** Letters tab: lessons in colour-coded groups, and one big Play button that carries on where the child left off. */
export function Home() {
  return (
    <TabShell tab="sounds" title="Word Nest">
      <Letters />
    </TabShell>
  )
}

function Letters() {
  const progress = loadProgress()
  const { talking, say } = useVoice()
  const nextId = lessonOrder.find((id) => !progress[id]) ?? lessonOrder[0]
  const started = lessonOrder.some((id) => progress[id])

  return (
    <>
      <section className="home-hero">
        <button
          type="button"
          className="pip-button"
          onClick={() => say(prompt('welcome'))}
          aria-label="Talk to Pip"
        >
          <Pip mood={talking ? 'talk' : 'idle'} size={150} />
        </button>
        <motion.button
          type="button"
          className="play-btn"
          onClick={() => go(`/lesson/${nextId}`)}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          whileTap={{ scale: 0.92, y: 5 }}
          aria-label={started ? 'Keep playing' : 'Play'}
        >
          <svg viewBox="0 0 24 24" width="64" height="64" fill="#fff">
            <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
          </svg>
        </motion.button>
      </section>

      <GroupGrid tab="sounds" />
    </>
  )
}
