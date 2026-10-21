import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Sentence } from '../data/course'
import { wordByText } from '../data/vocab'
import { pause, prompt, sfx, word } from '../lib/audio'
import { sentenceClips, sentenceTokens } from '../lib/sentences'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, Picture, RoundButton, fit, shuffle } from '../components/ui'

/** Listen to a sentence, then touch its words in order to build it. */
export function SentenceBuild({
  sentence,
  color,
  intro,
  onDone,
}: {
  sentence: Sentence
  color: string
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const { talking, say } = useVoice()
  const tokens = useMemo(() => sentenceTokens(sentence.text), [sentence.text])
  const tray = useMemo(() => shuffle(tokens.map((t, id) => ({ id, ...t }))), [sentence.text])
  const [placed, setPlaced] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const done = placed.length === tokens.length
  const pics = sentence.pics.map((t) => wordByText(t)).filter(Boolean)

  const hear = () => say(...sentenceClips(sentence.text))
  useEffect(() => {
    if (intro) say(prompt('sentence-build-intro'), pause(200), ...sentenceClips(sentence.text))
    else say(pause(250), ...sentenceClips(sentence.text))
  }, [sentence.text])

  const tap = (t: { id: number; key: string }) => {
    if (done || placed.includes(t.id)) return
    if (t.key === tokens[placed.length].key) {
      const next = [...placed, t.id]
      setPlaced(next)
      if (next.length === tokens.length) {
        sfx.right()
        say(pause(200), ...sentenceClips(sentence.text))
      } else say(word(t.key))
    } else {
      setWrong(t.id)
      setMistakes((m) => m + 1)
      sfx.tryAgain()
      say(word(t.key), pause(250), prompt('try-again'))
      window.setTimeout(() => setWrong(null), 600)
    }
  }

  return (
    <div className="activity sentence-build">
      <div className="build-stage" style={{ position: 'relative' }}>
        {!(tokens.length > 6 && window.innerHeight < 700) &&
          pics.map((p) => (
          <Picture key={p!.text} word={p!} size={fit(tokens.length > 6 ? 72 : 110, 0.12)} />
          ))}
        <RoundButton label="Hear the sentence" onClick={hear}>
          <span style={{ color }}>{Icon.speaker}</span>
        </RoundButton>
        {done && <Confetti pieces={30} />}
      </div>

      <div className="sentence-slots">
        {tokens.map((t, i) => (
          <span key={i} className={`sentence-slot ${i < placed.length ? 'sentence-slot-filled' : ''}`} style={{ borderColor: color }}>
            {i < placed.length ? `${t.shown}${t.punct}` : ''}
          </span>
        ))}
      </div>

      <div className="sentence-tray">
        {tray.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            className="word-choice"
            disabled={placed.includes(t.id)}
            animate={wrong === t.id ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => tap(t)}
          >
            {t.shown}
          </motion.button>
        ))}
      </div>

      <Footer mood={done ? 'cheer' : wrong !== null ? 'think' : talking ? 'talk' : 'idle'}>
        {done && (
          <RoundButton label="Next" color={color} onClick={() => onDone(mistakes)} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}
