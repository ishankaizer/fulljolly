import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { Family, VowelUnit } from '../data/curriculum'
import { pause, prompt, rime, word } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, fit, Icon, Picture, RoundButton, StaticTile, WordText, hasPicture, vowelColor } from '../components/ui'

/** "This is the -at family": hear the shared ending, then meet every word with its picture. */
export function MeetFamily({ unit, family, onDone }: { unit: VowelUnit; family: Family; onDone: () => void }) {
  const { talking, say } = useVoice()
  const color = vowelColor[unit.vowel]
  const ending = rime(family.rime, family.say)
  // Narrow phones fit five pictures per row, so nine words take two rows instead of three.
  const pictureSize = Math.min(fit(84, 0.105), Math.floor((window.innerWidth - 60) / 5.2))
  const intro = () => say(prompt('meet-family', 'These words all end with'), pause(150), ending, pause(500), ending)

  useEffect(() => {
    intro()
  }, []) // only on arrival

  return (
    <div className="activity meet">
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

      <div className="meet-words">
        {family.words.filter(hasPicture).map((w, i) => (
          <motion.button
            key={w.text}
            type="button"
            className="meet-word"
            initial={{ opacity: 0, scale: 0.4, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 220, damping: 15 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => say(word(w.text))}
            aria-label={w.text}
          >
            <Picture word={w} size={pictureSize} />
            <WordText text={w.text} size={28} />
          </motion.button>
        ))}
      </div>

      <Footer mood={talking ? 'talk' : 'idle'}>
        <RoundButton label="Hear it again" onClick={intro}>
          <span style={{ color }}>{Icon.speaker}</span>
        </RoundButton>
        <RoundButton label="Start" color={color} onClick={onDone} pulse={!talking}>
          <span style={{ color: '#fff' }}>{Icon.next}</span>
        </RoundButton>
      </Footer>
    </div>
  )
}
