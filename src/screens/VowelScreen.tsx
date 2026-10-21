import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { familyId, units, type Vowel } from '../data/curriculum'
import { pause, sound, word } from '../lib/audio'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { Pip } from '../components/Pip'
import { Icon, Picture, RoundButton, Stars, StaticTile, hasPicture, vowelColor } from '../components/ui'

/** One vowel: hear its sound with a keyword (a… apple), then pick a word family. */
export function VowelScreen({ vowel }: { vowel: Vowel }) {
  const unit = units.find((u) => u.vowel === vowel)!
  const color = vowelColor[vowel]
  const progress = loadProgress()
  const { talking, say } = useVoice()
  const hear = () => say(sound(vowel), pause(300), sound(vowel), pause(300), word(unit.keyword.text))

  useEffect(() => {
    hear()
  }, [vowel])

  return (
    <div className="screen vowel" style={{ ['--accent' as string]: color }}>
      <header className="lesson-top">
        <RoundButton label="Back to the map" onClick={() => go('/')}>
          <span style={{ color }}>{Icon.back}</span>
        </RoundButton>
      </header>

      <section className="vowel-hero">
        <motion.button
          type="button"
          className="vowel-big"
          style={{ background: color }}
          initial={{ scale: 0.4, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 11 }}
          whileTap={{ scale: 0.92 }}
          onClick={hear}
          aria-label={`Hear ${vowel}`}
        >
          {vowel}
          <span className="vowel-keyword">{unit.keyword.pic}</span>
        </motion.button>
        <Pip mood={talking ? 'talk' : 'idle'} size={110} />
      </section>

      <main className="families">
        {unit.families.map((f, i) => {
          const id = familyId(vowel, f.rime)
          return (
            <motion.button
              key={f.rime}
              type="button"
              className="family-tile"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 220, damping: 18 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => go(`/lesson/${id}`)}
              aria-label={`the ${f.rime} family`}
            >
              <span className="family-tile-rime">
                {f.rime.split('').map((l, j) => (
                  <StaticTile key={j} letter={l} size="md" />
                ))}
              </span>
              <span className="family-tile-pics">
                {f.words
                  .filter(hasPicture)
                  .slice(0, 4)
                  .map((w) => (
                    <Picture key={w.text} word={w} size={46} />
                  ))}
              </span>
              <Stars count={progress[id] ?? 0} size={20} />
            </motion.button>
          )
        })}
      </main>
    </div>
  )
}
