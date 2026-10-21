import { partsOf } from '../data/graphemes'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Word } from '../data/curriculum'
import { pause, prompt, sfx, sound, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, LetterTile, Picture, RoundButton, fit } from '../components/ui'

/**
 * A card of words, each with a dot under every letter. Touch the dots one by one to hear each sound,
 * then the sounds blend into the word and its picture appears.
 */
export function BlendingCard({ words, color, onDone }: { words: Word[]; color: string; onDone: () => void }) {
  const { talking, say } = useVoice()
  const [finished, setFinished] = useState<Set<string>>(new Set())
  const allDone = finished.size === words.length

  useEffect(() => {
    say(prompt('dots-intro'))
  }, []) // only on arrival

  const complete = (w: Word) => {
    sfx.right()
    setFinished((f) => new Set(f).add(w.text))
  }

  return (
    <div className="activity blending">
      <h2 className="card-title">Blending</h2>
      <div className="blending-list">
        {words.map((w) => (
          <BlendRow
            key={w.text}
            word={w}
            color={color}
            say={say}
            done={finished.has(w.text)}
            onComplete={() => complete(w)}
          />
        ))}
      </div>

      <Footer mood={allDone ? 'cheer' : talking ? 'talk' : 'idle'}>
        {!allDone && (
          <RoundButton label="Hear the instruction" onClick={() => say(prompt('dots-intro'))}>
            <span style={{ color }}>{Icon.speaker}</span>
          </RoundButton>
        )}
        {allDone && (
          <RoundButton label="Next" color={color} onClick={onDone} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}

function BlendRow({
  word,
  color,
  say,
  done,
  onComplete,
}: {
  word: Word
  color: string
  say: ReturnType<typeof useVoice>['say']
  done: boolean
  onComplete: () => void
}) {
  const letters = partsOf(word)
  const [lit, setLit] = useState(0)
  const [wobble, setWobble] = useState(-1)

  const tapDot = (i: number) => {
    sfx.tap()
    say(sound(letters[i]))
    if (i === lit) {
      setLit(i + 1)
      if (i + 1 === letters.length) {
        onComplete()
        say(sound(letters[i]), pause(450), wordClip(word.text), pause(300), wordClip(word.text))
      }
    } else if (i > lit) {
      // Skipped ahead: shake the dot that is next, so the child sees where to go.
      setWobble(lit)
      window.setTimeout(() => setWobble(-1), 500)
    }
  }

  return (
    <div className={`blend-row ${done ? 'blend-row-done' : ''}`}>
      <div className="blend-letters">
        {letters.map((l, i) => (
          <div className="blend-col" key={i}>
            <LetterTile letter={l} size="md" lit={done || i < lit} onTap={() => say(sound(l))} />
            <motion.button
              type="button"
              className={`dot ${i < lit ? 'dot-on' : ''}`}
              style={i < lit ? { background: color } : undefined}
              animate={wobble === i ? { scale: [1, 1.35, 1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => tapDot(i)}
              aria-label={`sound ${i + 1}: ${l}`}
            />
          </div>
        ))}
      </div>
      <div className="blend-pic">
        {done ? (
          <motion.button
            type="button"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
            onClick={() => say(wordClip(word.text))}
            aria-label={word.text}
            style={{ position: 'relative' }}
          >
            <Picture word={word} size={fit(82, 0.1)} />
            <Confetti pieces={14} />
          </motion.button>
        ) : (
          <span className="blend-pic-slot" style={{ borderColor: color }} />
        )}
      </div>
    </div>
  )
}
