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

/** Home: one big Play button that carries on where the child left off, and a banner for each vowel. */
export function Home() {
  const progress = loadProgress()
  const { talking, say } = useVoice()

  const allIds = units.flatMap((u) => u.families.map((f) => familyId(u.vowel, f.rime)))
  const nextId = allIds.find((id) => !progress[id]) ?? SWAP_LESSON
  const started = allIds.some((id) => progress[id])

  return (
    <div className="screen home">
      <header className="home-top">
        <h1 className="home-title">Word Nest</h1>
        <GrownUpsDoor />
      </header>

      <section className="home-hero">
        <button
          type="button"
          className="pip-button"
          onClick={() => say(prompt('welcome', 'Hello! I am Pip. Press play to start!'))}
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

      <main className="banners">
        {units.map((unit, i) => {
          const ids = unit.families.map((f) => familyId(unit.vowel, f.rime))
          const stars = ids.reduce((sum, id) => sum + (progress[id] ?? 0), 0)
          return (
            <motion.button
              key={unit.vowel}
              type="button"
              className="banner"
              style={{ ['--accent' as string]: vowelColor[unit.vowel] }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 220, damping: 18 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => go(`/vowel/${unit.vowel}`)}
              aria-label={`Letter ${unit.vowel}`}
            >
              <span className="banner-tile">{unit.vowel}</span>
              <span className="banner-pic">{unit.keyword.pic}</span>
              <span className="banner-info">
                <span className="banner-chips">
                  {unit.families.map((f, j) => (
                    <i key={f.rime} className={progress[ids[j]] ? 'chip-done' : ''}>
                      {f.rime}
                    </i>
                  ))}
                </span>
                <Stars count={Math.round(stars / ids.length)} size={20} />
              </span>
            </motion.button>
          )
        })}

        <motion.button
          type="button"
          className="banner banner-swap"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 220, damping: 18 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => go(`/lesson/${SWAP_LESSON}`)}
          aria-label="Swap the middle sound"
        >
          <span className="swap-demo">
            <StaticTile letter="c" size="md" />
            <span className="swap-q">?</span>
            <StaticTile letter="t" size="md" />
          </span>
          <span className="banner-pic">🐱</span>
          <span className="banner-info">
            <Stars count={progress[SWAP_LESSON] ?? 0} size={20} />
          </span>
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
