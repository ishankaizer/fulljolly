import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { LetterLesson } from '../data/letters'
import { pause, prompt, sfx, sound } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, LetterTile, RoundButton, fit } from '../components/ui'

/** Hear a sound, then pick the letter that makes it. */
export function PickLetter({
  target,
  options,
  color,
  intro,
  onDone,
}: {
  target: LetterLesson
  options: LetterLesson[]
  color: string
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const { talking, say } = useVoice()
  const [found, setFound] = useState(false)
  const [wrong, setWrong] = useState<string[]>([])

  const hear = () => say(sound(target.soundOf))
  useEffect(() => {
    if (intro) say(prompt('pick-intro'), pause(250), sound(target.soundOf))
    else say(pause(300), sound(target.soundOf))
  }, [target.id])

  const pick = (o: LetterLesson) => {
    if (found) return
    if (o.id === target.id) {
      setFound(true)
      sfx.right()
      say(sound(target.soundOf))
    } else {
      setWrong((w) => [...w, o.id])
      sfx.tryAgain()
      say(sound(o.soundOf), pause(250), prompt('try-again'), pause(100), sound(target.soundOf))
    }
  }

  return (
    <div className="activity pick">
      <RoundButton label="Hear the sound" onClick={hear} className="round-btn-xl">
        <span style={{ color }}>{Icon.speaker}</span>
      </RoundButton>

      <div className="choices">
        {options.map((o) => {
          const isWrong = wrong.includes(o.id)
          return (
            <motion.div
              key={o.id}
              style={{ position: 'relative' }}
              animate={isWrong ? { x: [0, -12, 12, -8, 8, 0], opacity: 0.4 } : found && o.id !== target.id ? { opacity: 0.3 } : { opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              <LetterTile
                letter={o.label}
                lit={found && o.id === target.id}
                style={o.label.length > 1 ? { fontSize: `${fit(60, 0.09)}px` } : undefined}
                onTap={() => pick(o)}
              />
              {found && o.id === target.id && <Confetti pieces={22} />}
            </motion.div>
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
