import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { Family, VowelUnit } from '../data/curriculum'
import { pause, prompt, rime } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Pip } from '../components/Pip'
import { Icon, Picture, RoundButton, StaticTile, vowelColor } from '../components/ui'

/** "This is the -at family": hear the shared ending and peek at the words to come. */
export function MeetFamily({ unit, family, onDone }: { unit: VowelUnit; family: Family; onDone: () => void }) {
  const { talking, say } = useVoice()
  const color = vowelColor[unit.vowel]
  const ending = rime(family.rime, family.say)

  useEffect(() => {
    say(prompt('meet-family', 'These words all end with'), pause(150), ending, pause(500), ending)
  }, []) // only on arrival

  const pictured = family.words.filter((w) => w.pic).slice(0, 6)
  const half = Math.ceil(pictured.length / 2)

  const row = (words: typeof pictured, offset: number, from: number) => (
    <div className="meet-row">
      {words.map((w, i) => (
        <motion.div
          key={w.text}
          initial={{ opacity: 0, scale: 0, y: from }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3 + (i + offset) * 0.12, type: 'spring', stiffness: 160, damping: 14 }}
        >
          <Picture word={w} size={86} />
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className="activity meet">
      <div className="meet-stack">
        {row(pictured.slice(0, half), 0, 60)}
        <motion.button
          type="button"
          className="family-card"
          style={{ borderColor: color }}
          initial={{ scale: 0.3, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => say(ending)}
          aria-label={`the ${family.rime} family`}
        >
          <span className="family-dash">-</span>
          {family.rime.split('').map((l, i) => (
            <StaticTile key={i} letter={l} />
          ))}
        </motion.button>
        {row(pictured.slice(half), half, -60)}
      </div>

      <div className="activity-footer">
        <Pip mood={talking ? 'talk' : 'idle'} size={120} />
        <RoundButton label="Start" color={color} onClick={onDone} pulse={!talking}>
          <span style={{ color: '#fff' }}>{Icon.next}</span>
        </RoundButton>
      </div>
    </div>
  )
}
