import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { Word } from '../data/curriculum'
import { pause, prompt, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Footer, Icon, RoundButton } from '../components/ui'

/** A word learned by sight: see it, hear it, touch it as many times as you like. */
export function TrickyWord({ word, color, intro, onDone }: { word: Word; color: string; intro: boolean; onDone: () => void }) {
  const { talking, say } = useVoice()
  const hear = () => say(wordClip(word.text), pause(400), wordClip(word.text))

  useEffect(() => {
    if (intro) say(prompt('tricky-intro'), pause(250), wordClip(word.text))
    else say(pause(250), wordClip(word.text))
  }, [word.text])

  return (
    <div className="activity tricky">
      <motion.button
        type="button"
        className="tricky-card"
        style={{ borderColor: color }}
        initial={{ scale: 0.5, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        whileTap={{ scale: 0.94 }}
        onClick={hear}
        aria-label={word.text}
      >
        {word.text}
      </motion.button>
      <p className="tricky-note">A tricky word: we know it by sight.</p>
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
