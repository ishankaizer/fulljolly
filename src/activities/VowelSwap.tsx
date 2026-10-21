import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { SwapFrame, Vowel, Word } from '../data/curriculum'
import { pause, prompt, sfx, sound, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, Confetti, Icon, LetterTile, Picture, RoundButton, StaticTile, vowelColor } from '../components/ui'

const vowels: Vowel[] = ['a', 'e', 'i', 'o', 'u']

/** c _ t: which middle sound turns it into the word in the picture? (cat, cot, cut) */
export function VowelSwap({
  frame,
  word,
  intro,
  onDone,
}: {
  frame: SwapFrame
  word: Word
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const target = word.text[1] as Vowel
  const { talking, say } = useVoice()
  const [middle, setMiddle] = useState<Vowel | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const found = middle === target

  useEffect(() => {
    if (intro) say(prompt('swap-intro', 'Change the middle sound to make the word.'), pause(200), wordClip(word.text))
    else say(pause(300), wordClip(word.text))
  }, [word.text])

  const pick = (v: Vowel) => {
    if (found) return
    setMiddle(v)
    if (v === target) {
      sfx.right()
      say(pause(300), sound(frame.first), sound(v), sound(frame.last), pause(150), wordClip(word.text))
    } else {
      setMistakes((m) => m + 1)
      sfx.tryAgain()
      say(sound(frame.first), sound(v), sound(frame.last), pause(300), prompt('try-again', 'Listen again'), pause(100), wordClip(word.text))
    }
  }

  return (
    <div className="activity swap">
      <div className="build-stage">
        <motion.button
          type="button"
          className="match-card"
          onClick={() => say(wordClip(word.text))}
          whileTap={{ scale: 0.94 }}
          aria-label="Hear the word"
        >
          <Picture word={{ text: '?', pic: word.pic, art: word.art }} size={150} />
          {found && <Confetti pieces={28} />}
        </motion.button>
      </div>

      <div className="tile-row">
        <LetterTile letter={frame.first} onTap={() => say(sound(frame.first))} />
        <div
          className={`slot ${middle ? 'slot-filled' : ''}`}
          style={{ borderColor: middle ? vowelColor[middle] : '#c7d3e0' }}
        >
          <AnimatePresence mode="popLayout">
            {middle && (
              <motion.span
                key={middle + mistakes}
                className="slot-inner"
                initial={{ y: 60, scale: 0.5, opacity: 0 }}
                animate={found ? { y: 0, scale: 1, opacity: 1 } : { y: 0, scale: 1, opacity: 1, x: [0, -10, 10, -6, 6, 0] }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <StaticTile letter={middle} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <LetterTile letter={frame.last} onTap={() => say(sound(frame.last))} />
      </div>

      <div className="choices vowel-choices">
        {vowels.map((v) => (
          <motion.button
            key={v}
            type="button"
            className="vowel-key"
            style={{ background: vowelColor[v] }}
            whileTap={{ scale: 0.88, y: 4 }}
            onClick={() => pick(v)}
            disabled={found}
            aria-label={v}
          >
            {v}
          </motion.button>
        ))}
      </div>

      <Footer mood={found ? 'cheer' : middle ? 'think' : talking ? 'talk' : 'idle'}>
        {!found && (
          <RoundButton
            label="Hear the instruction"
            color="#fff"
            onClick={() => say(prompt('swap-intro', 'Change the middle sound to make the word.'), pause(200), wordClip(word.text))}
          >
            <span style={{ color: vowelColor[target] }}>{Icon.speaker}</span>
          </RoundButton>
        )}
        {found && (
          <RoundButton label="Next" color={vowelColor[target]} onClick={() => onDone(mistakes)} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}
