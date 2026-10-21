import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../data/curriculum'
import { partsOf, shownPart } from '../data/graphemes'
import { pause, prompt, sfx, sound, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, LetterTile, Picture, RoundButton, StaticTile, fit, shuffle } from '../components/ui'

const spare = ['s', 't', 'p', 'n', 'm', 'd', 'b', 'l', 'r', 'c', 'f', 'h', 'g', 'sh', 'ch', 'th', 'ai', 'ee', 'oa', 'oo', 'ar', 'or']

/** Hear a word and see its picture, then touch the sounds in order to build it. */
export function BuildTiles({
  word,
  color,
  intro,
  onDone,
}: {
  word: Word
  color: string
  intro: boolean
  onDone: (mistakes: number) => void
}) {
  const parts = partsOf(word)
  const { talking, say } = useVoice()
  const [placed, setPlaced] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const done = placed.length === parts.length

  // The word's own sounds plus a couple of others, so the child has to listen for the right ones.
  const tray = useMemo(() => {
    const extra = shuffle(spare.filter((p) => !parts.includes(p))).slice(0, parts.length >= 4 ? 2 : 3)
    return shuffle([...parts, ...extra].map((part, id) => ({ id, part })))
  }, [word.text])

  useEffect(() => {
    if (intro) say(prompt('tiles-intro'), pause(200), wordClip(word.text))
    else say(pause(300), wordClip(word.text))
  }, [word.text])

  const tap = (tile: { id: number; part: string }) => {
    if (done || placed.includes(tile.id)) return
    if (tile.part === parts[placed.length]) {
      const next = [...placed, tile.id]
      setPlaced(next)
      if (next.length === parts.length) {
        sfx.right()
        say(sound(tile.part), pause(300), wordClip(word.text))
      } else say(sound(tile.part))
    } else {
      setWrong(tile.id)
      setMistakes((m) => m + 1)
      sfx.tryAgain()
      say(sound(tile.part), pause(250), prompt('try-again'), pause(100), wordClip(word.text))
      window.setTimeout(() => setWrong(null), 600)
    }
  }

  return (
    <div className="activity build-tiles">
      <div className="build-stage">
        <div style={{ position: 'relative' }}>
          <Picture word={word} size={fit(140)} />
          {done && <Confetti pieces={26} />}
        </div>
        <RoundButton label="Hear the word" onClick={() => say(wordClip(word.text))}>
          <span style={{ color }}>{Icon.speaker}</span>
        </RoundButton>
      </div>

      <div className="tiles-board">
        <div className="tile-row">
          {parts.map((part, i) =>
            i < placed.length ? (
              <StaticTile key={i} letter={part} size="md" />
            ) : (
              <span key={i} className={`build-slot ${shownPart(part).length > 1 ? 'build-slot-wide' : ''}`} style={{ borderColor: color }} />
            ),
          )}
        </div>
        <div className="tile-row tray">
          {tray.map((tile) => (
            <motion.div
              key={tile.id}
              animate={wrong === tile.id ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LetterTile letter={tile.part} size="md" dim={placed.includes(tile.id)} onTap={() => tap(tile)} />
            </motion.div>
          ))}
        </div>
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
