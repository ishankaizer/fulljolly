import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Sentence } from '../data/course'
import { wordByText } from '../data/vocab'
import { pause, prompt, sfx, word } from '../lib/audio'
import { sentenceClips, sentenceTokens } from '../lib/sentences'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, Picture, RoundButton, fit, shuffle } from '../components/ui'

const picsOf = (s: Sentence) => s.pics.map((t) => wordByText(t)).filter((w): w is NonNullable<typeof w> => Boolean(w))
const keyOf = (s: Sentence) => s.pics.join(' ')

/** Picture size so three cards fit side by side on a phone, and in the height left on a short screen. */
const sceneSize = (count: number) =>
  Math.max(40, Math.min(fit(count > 1 ? 90 : 120, 0.15), Math.floor((window.innerWidth - 100) / 3 / count)))

/** Read a sentence on your own, then pick the picture it is about. */
export function SentencePick({
  sentence,
  others,
  color,
  intro,
  onDone,
}: {
  sentence: Sentence
  others: Sentence[]
  color: string
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const { talking, say } = useVoice()
  const [found, setFound] = useState(false)
  const [wrong, setWrong] = useState<string[]>([])
  const tokens = sentenceTokens(sentence.text)

  const options = useMemo(() => {
    const pool = shuffle(others.filter((o) => o.pics.length && keyOf(o) !== keyOf(sentence)))
    const picked: Sentence[] = []
    for (const o of pool) if (picked.length < 2 && !picked.some((p) => keyOf(p) === keyOf(o))) picked.push(o)
    return shuffle([sentence, ...picked])
  }, [sentence.text])

  useEffect(() => {
    if (intro) say(prompt('sentence-pick-intro'))
  }, [sentence.text])

  const pick = (o: Sentence) => {
    if (found) return
    if (keyOf(o) === keyOf(sentence)) {
      setFound(true)
      sfx.right()
      say(...sentenceClips(sentence.text))
    } else {
      setWrong((w) => [...w, keyOf(o)])
      sfx.tryAgain()
      say(prompt('look-again'))
    }
  }

  return (
    <div className="activity sentence-pick">
      <p className="book-sentence">
        {tokens.map((t, i) => (
          <button key={i} type="button" className="book-word" onClick={() => say(word(t.key))}>
            {t.shown}
            {t.punct && <span className="book-stop">{t.punct}</span>}
          </button>
        ))}
      </p>
      <div className="match-options">
        {options.map((o) => {
          const isWrong = wrong.includes(keyOf(o))
          const isRight = found && keyOf(o) === keyOf(sentence)
          return (
            <motion.button
              key={keyOf(o)}
              type="button"
              className={`match-card scene ${isRight ? 'match-right' : ''}`}
              style={isRight ? { borderColor: color } : undefined}
              onClick={() => pick(o)}
              whileTap={{ scale: 0.94 }}
              animate={isWrong ? { x: [0, -12, 12, -8, 8, 0], opacity: 0.35 } : found && !isRight ? { opacity: 0.3 } : { opacity: 1 }}
              transition={{ duration: 0.45 }}
              aria-label={o.pics.join(' and ')}
            >
              {picsOf(o).map((p) => (
                <Picture key={p.text} word={p} size={sceneSize(picsOf(o).length)} />
              ))}
              {isRight && <Confetti pieces={22} />}
            </motion.button>
          )
        })}
      </div>
      <Footer mood={found ? 'cheer' : wrong.length ? 'think' : talking ? 'talk' : 'idle'}>
        {!found && (
          <RoundButton label="Read to me" onClick={() => say(...sentenceClips(sentence.text), pause(10))}>
            <span style={{ color }}>{Icon.speaker}</span>
          </RoundButton>
        )}
        {found && (
          <RoundButton label="Next" color={color} onClick={() => onDone(wrong.length)} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}
