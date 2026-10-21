import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Family, VowelUnit, Word } from '../data/curriculum'
import { pause, prompt, sfx, sound, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, fit, Confetti, Icon, LetterTile, Picture, RoundButton, StaticTile, shuffle, vowelColor } from '../components/ui'

const spareConsonants = 'bcdfghjklmnprstvwz'.split('')

/** Hear a word, then pick the first sound that makes it: _ a t → c a t. */
export function BuildWord({
  unit,
  family,
  word,
  intro,
  onDone,
}: {
  unit: VowelUnit
  family: Family
  word: Word
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const color = vowelColor[unit.vowel]
  const { talking, say } = useVoice()
  const onset = word.text.slice(0, word.text.length - family.rime.length)
  const [placed, setPlaced] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const choices = useMemo(() => {
    // Prefer letters that make other real words in the family (b → bat), so the
    // child has to really listen for the first sound.
    const familyOnsets = family.words
      .map((w) => w.text.slice(0, w.text.length - family.rime.length))
      .filter((o) => o !== onset && o.length === 1)
    const pool = shuffle(familyOnsets)
    for (const c of shuffle(spareConsonants)) if (c !== onset && !pool.includes(c)) pool.push(c)
    return shuffle([onset, ...pool.slice(0, 2)])
  }, [word.text])

  useEffect(() => {
    if (intro) say(prompt('build-intro', 'Listen. What sound does it start with?'), pause(200), wordClip(word.text))
    else say(pause(300), wordClip(word.text))
  }, [word.text])

  const pick = (letter: string) => {
    if (placed) return
    if (letter === onset) {
      setPlaced(true)
      sfx.right()
      say(pause(350), sound(onset), pause(100), wordClip(word.text))
    } else {
      setWrong(letter)
      setMistakes((m) => m + 1)
      sfx.tryAgain()
      say(sound(letter), pause(250), prompt('try-again', 'Listen again'), pause(100), wordClip(word.text))
      window.setTimeout(() => setWrong(null), 600)
    }
  }

  return (
    <div className="activity build">
      <div className="build-stage">
        <AnimatePresence>
          {placed && (
            <motion.div
              initial={{ scale: 0, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 12 }}
              style={{ position: 'relative' }}
            >
              <Picture word={word} size={fit(150)} />
              <Confetti pieces={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {!placed && (
          <RoundButton label="Hear the word" onClick={() => say(wordClip(word.text))} className="round-btn-xl">
            <span style={{ color }}>{Icon.speaker}</span>
          </RoundButton>
        )}
      </div>

      <div className="tile-row">
        <div className={`slot ${placed ? 'slot-filled' : ''}`} style={{ borderColor: color }}>
          {placed && (
            <motion.span layoutId={`choice-${onset}`} className="slot-inner">
              <StaticTile letter={onset} />
            </motion.span>
          )}
        </div>
        {family.rime.split('').map((l, i) => (
          <LetterTile key={i} letter={l} onTap={() => say(sound(l))} />
        ))}
      </div>

      <div className="choices">
        {choices.map((c) =>
          placed && c === onset ? (
            <div key={c} className="choice-gap" />
          ) : (
            <motion.div
              key={c}
              layoutId={`choice-${c}`}
              animate={wrong === c ? { x: [0, -14, 14, -10, 10, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <LetterTile letter={c} dim={placed} onTap={() => pick(c)} />
            </motion.div>
          ),
        )}
      </div>

      <Footer mood={placed ? 'cheer' : wrong ? 'think' : talking ? 'talk' : 'idle'}>
        {placed && (
          <RoundButton label="Next" color={color} onClick={() => onDone(mistakes)} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}
