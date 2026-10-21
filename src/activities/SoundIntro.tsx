import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { LetterLesson } from '../data/letters'
import { pause, prompt, sound, word } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, Icon, Picture, RoundButton, WordText, fit } from '../components/ui'

/** Meet a letter: hear its sound, then a word that starts with it. */
export function SoundIntro({ lesson, color, onDone }: { lesson: LetterLesson; color: string; onDone: () => void }) {
  const { talking, say } = useVoice()
  const hear = () =>
    say(prompt('sound-intro'), pause(200), sound(lesson.soundOf), pause(350), sound(lesson.soundOf), pause(450), word(lesson.keyword.text))

  useEffect(() => {
    hear()
  }, []) // only on arrival

  const size = fit(210, 0.3)

  return (
    <div className="activity sound-intro">
      <div className="sound-intro-stage">
        <motion.button
          type="button"
          className="sound-tile"
          style={{ background: color, width: size, height: size, fontSize: lesson.label.length > 1 ? size * 0.5 : size * 0.72 }}
          initial={{ scale: 0.4, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 11 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => say(sound(lesson.soundOf))}
          aria-label={`Hear the sound for ${lesson.label}`}
        >
          {lesson.label}
        </motion.button>
        <motion.button
          type="button"
          className="sound-keyword"
          initial={{ scale: 0, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => say(word(lesson.keyword.text))}
          aria-label={lesson.keyword.text}
        >
          <Picture word={lesson.keyword} size={fit(150, 0.2)} />
          <WordText text={lesson.keyword.text} size={32} />
        </motion.button>
      </div>

      <Footer mood={talking ? 'talk' : 'idle'}>
        <RoundButton label="Hear it again" onClick={hear}>
          <span style={{ color }}>{Icon.speaker}</span>
        </RoundButton>
        <RoundButton label="Next" color={color} onClick={onDone} pulse={!talking}>
          <span style={{ color: '#fff' }}>{Icon.next}</span>
        </RoundButton>
      </Footer>
    </div>
  )
}
