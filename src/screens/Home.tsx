import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { familyId, units } from '../data/curriculum'
import { prompt } from '../lib/audio'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { Pip } from '../components/Pip'
import { Stars, StaticTile, vowelColor } from '../components/ui'
import { SWAP_LESSON } from './Lesson'

/** The map: one island per vowel, then the "swap the middle sound" challenge. */
export function Home() {
  const progress = loadProgress()
  const { talking, say } = useVoice()

  return (
    <div className="screen home">
      <header className="home-top">
        <div className="brand" onClick={() => say(prompt('welcome', 'Hello! I am Pip. Pick a letter to play!'))}>
          <Pip mood={talking ? 'talk' : 'idle'} size={92} />
          <h1>Word Nest</h1>
        </div>
        <GrownUpsDoor />
      </header>

      <main className="map">
        <svg className="map-path" viewBox="0 0 100 600" preserveAspectRatio="none" aria-hidden>
          <path d="M50 40 C 90 110, 10 170, 50 240 S 90 370, 50 440 S 10 540, 50 590" />
        </svg>
        {units.map((unit, i) => {
          const ids = unit.families.map((f) => familyId(unit.vowel, f.rime))
          const done = ids.filter((id) => progress[id]).length
          const stars = ids.reduce((sum, id) => sum + (progress[id] ?? 0), 0)
          return (
            <motion.button
              key={unit.vowel}
              type="button"
              className={`island island-${i % 2 ? 'right' : 'left'}`}
              style={{ ['--accent' as string]: vowelColor[unit.vowel] }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 14 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => go(`/vowel/${unit.vowel}`)}
              aria-label={`Letter ${unit.vowel}`}
            >
              <span className="island-letter">{unit.vowel}</span>
              <span className="island-pic">{unit.keyword.pic}</span>
              <span className="island-meta">
                <Stars count={Math.round(stars / ids.length)} size={18} />
                <small>
                  {done}/{ids.length}
                </small>
              </span>
            </motion.button>
          )
        })}
        <motion.button
          type="button"
          className="island island-swap"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 14 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => go(`/lesson/${SWAP_LESSON}`)}
          aria-label="Swap the middle sound"
        >
          <span className="swap-demo">
            <StaticTile letter="c" size="md" />
            <span className="swap-q">?</span>
            <StaticTile letter="t" size="md" />
          </span>
          <Stars count={progress[SWAP_LESSON] ?? 0} size={18} />
        </motion.button>
      </main>
    </div>
  )
}

/** Press and hold for 2 seconds to open the grown-ups page, so little fingers don't wander in. */
function GrownUpsDoor() {
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const start = () => {
    timer.current = window.setTimeout(() => go('/grown-ups'), 2000)
  }
  const cancel = () => window.clearTimeout(timer.current)
  return (
    <button
      type="button"
      className="grown-ups-door"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Grown-ups: press and hold"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
      </svg>
    </button>
  )
}
