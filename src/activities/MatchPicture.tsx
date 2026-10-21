import { partsOf } from '../data/graphemes'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { units, type Word } from '../data/curriculum'
import { pause, prompt, sfx, sound, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, fit, Confetti, Icon, LetterTile, Picture, RoundButton, hasPicture, pictureKey, shuffle } from '../components/ui'

const everyPictured = units.flatMap((u) => u.families.flatMap((f) => f.words)).filter(hasPicture)

/** Read the word (tap letters for help), then tap the picture that matches. */
export function MatchPicture({
  color,
  word,
  familyWords,
  intro,
  onDone,
}: {
  color: string
  word: Word
  familyWords: Word[]
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const { talking, say } = useVoice()
  const [found, setFound] = useState(false)
  const [wrong, setWrong] = useState<string[]>([])

  const options = useMemo(() => {
    // Rhyming pictures first (cat vs hat): reading the first letter is what counts.
    const differentPic = (w: Word) => w.text !== word.text && pictureKey(w) !== pictureKey(word)
    const near = shuffle(familyWords.filter((w) => hasPicture(w) && differentPic(w)))
    const far = shuffle(everyPictured.filter((w) => differentPic(w) && !near.includes(w)))
    const picked: Word[] = []
    for (const w of [...near, ...far]) {
      if (picked.length === 2) break
      if (!picked.some((p) => pictureKey(p) === pictureKey(w))) picked.push(w)
    }
    return shuffle([word, ...picked])
  }, [word.text])

  useEffect(() => {
    if (intro) say(prompt('match-intro'))
  }, [word.text])

  const pick = (w: Word) => {
    if (found) return
    if (w.text === word.text) {
      setFound(true)
      sfx.right()
      say(wordClip(word.text))
    } else {
      setWrong((ws) => [...ws, w.text])
      sfx.tryAgain()
      say(wordClip(w.text), pause(200), prompt('look-again'))
    }
  }

  return (
    <div className="activity match">
      <div className="tile-row">
        {partsOf(word).map((l, i) => (
          <LetterTile key={i} letter={l} lit={found} onTap={() => say(sound(l))} />
        ))}
      </div>

      <div className="match-options">
        {options.map((w) => {
          const isWrong = wrong.includes(w.text)
          const isRight = found && w.text === word.text
          return (
            <motion.button
              key={w.text}
              type="button"
              className={`match-card ${isRight ? 'match-right' : ''}`}
              style={isRight ? { borderColor: color } : undefined}
              onClick={() => pick(w)}
              whileTap={{ scale: 0.92 }}
              animate={
                isWrong
                  ? { x: [0, -12, 12, -8, 8, 0], opacity: 0.35 }
                  : isRight
                    ? { scale: [1, 1.18, 1.1] }
                    : found
                      ? { opacity: 0.3, scale: 0.9 }
                      : {}
              }
              transition={{ duration: 0.45 }}
              aria-label={w.text}
            >
              <Picture word={w} size={fit(130, 0.18)} />
              {isRight && <Confetti pieces={24} />}
            </motion.button>
          )
        })}
      </div>

      <Footer mood={found ? 'cheer' : wrong.length ? 'think' : talking ? 'talk' : 'idle'}>
        {!found && (
          <RoundButton label="Hear the instruction" onClick={() => say(prompt('match-intro'))}>
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
