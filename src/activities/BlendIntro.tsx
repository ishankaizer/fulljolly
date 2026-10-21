import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { Lesson } from '../data/course'
import { pause, prompt, sound } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, Icon, LetterTile, Picture, RoundButton, WordText, fit } from '../components/ui'

/** Two letters side by side keep both their sounds: hear each one, then say them quickly together. */
export function BlendIntro({ lesson, color, onDone }: { lesson: Lesson; color: string; onDone: () => void }) {
  const { talking, say } = useVoice()
  const tiles = lesson.tiles ?? []
  const both = (tile: string) => [sound(tile[0]), pause(380), sound(tile[1]), pause(550), sound(tile[0]), pause(60), sound(tile[1])]
  const intro = () => say(prompt('pattern-intro'), pause(250), ...both(tiles[0]))

  useEffect(() => {
    intro()
  }, []) // only on arrival

  return (
    <div className="activity blend-intro">
      <div className="blend-intro-tiles">
        {tiles.map((t, i) => (
          <motion.div
            key={t}
            initial={{ scale: 0.4, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 220, damping: 14 }}
          >
            <LetterTile letter={t} onTap={() => say(...both(t))} />
          </motion.div>
        ))}
      </div>
      {lesson.keyword && (
        <div className="sound-keyword">
          <Picture word={lesson.keyword} size={fit(120, 0.17)} />
          <WordText text={lesson.keyword.text} size={30} />
        </div>
      )}
      <Footer mood={talking ? 'talk' : 'idle'}>
        <RoundButton label="Hear it again" onClick={intro}>
          <span style={{ color }}>{Icon.speaker}</span>
        </RoundButton>
        <RoundButton label="Next" color={color} onClick={onDone} pulse={!talking}>
          <span style={{ color: '#fff' }}>{Icon.next}</span>
        </RoundButton>
      </Footer>
    </div>
  )
}
