import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Word } from '../data/curriculum'
import { pause, prompt, sfx, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, Picture, RoundButton, fit, hasPicture } from '../components/ui'

/** Hear a word, then find it written down. Reading, not guessing from a picture. */
export function PickWord({
  target,
  options,
  color,
  intro,
  onDone,
}: {
  target: Word
  options: Word[]
  color: string
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const { talking, say } = useVoice()
  const [found, setFound] = useState(false)
  const [wrong, setWrong] = useState<string[]>([])

  const hear = () => say(wordClip(target.text))
  useEffect(() => {
    if (intro) say(prompt('pickword-intro'), pause(200), wordClip(target.text))
    else say(pause(300), wordClip(target.text))
  }, [target.text])

  const pick = (o: Word) => {
    if (found) return
    if (o.text === target.text) {
      setFound(true)
      sfx.right()
      say(wordClip(target.text))
    } else {
      setWrong((w) => [...w, o.text])
      sfx.tryAgain()
      say(wordClip(o.text), pause(250), prompt('look-again'), pause(100), wordClip(target.text))
    }
  }

  return (
    <div className="activity pickword">
      <div className="build-stage">
        {found && hasPicture(target) ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }} style={{ position: 'relative' }}>
            <Picture word={target} size={fit(130)} />
            <Confetti pieces={24} />
          </motion.div>
        ) : (
          <RoundButton label="Hear the word" onClick={hear} className="round-btn-xl">
            <span style={{ color }}>{Icon.speaker}</span>
          </RoundButton>
        )}
      </div>

      <div className="word-choices">
        {options.map((o) => {
          const isWrong = wrong.includes(o.text)
          const isRight = found && o.text === target.text
          return (
            <motion.button
              key={o.text}
              type="button"
              className={`word-choice ${isRight ? 'word-choice-right' : ''}`}
              style={isRight ? { borderColor: color } : undefined}
              animate={isWrong ? { x: [0, -12, 12, -8, 8, 0], opacity: 0.35 } : found && !isRight ? { opacity: 0.3 } : { opacity: 1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.45 }}
              onClick={() => pick(o)}
            >
              {o.text}
            </motion.button>
          )
        })}
      </div>

      <Footer mood={found ? 'cheer' : wrong.length ? 'think' : talking ? 'talk' : 'idle'}>
        {found && (
          <RoundButton label="Next" color={color} onClick={() => onDone(wrong.length)} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}
