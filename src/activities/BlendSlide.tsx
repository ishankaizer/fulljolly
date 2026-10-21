import { animate, motion, useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { VowelUnit, Word } from '../data/curriculum'
import { pause, prompt, sfx, sound, word as wordClip } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, fit, Icon, LetterTile, Picture, RoundButton, vowelColor } from '../components/ui'

/**
 * Slide the ball under the letters: each sound plays as the ball passes it,
 * and at the end the sounds blend into the word and its picture pops up.
 */
export function BlendSlide({
  unit,
  word,
  intro,
  onDone,
}: {
  unit: VowelUnit
  word: Word
  intro: boolean
  onDone: () => void
}) {
  const letters = word.text.split('')
  const color = vowelColor[unit.vowel]
  const { talking, say } = useVoice()
  const [lit, setLit] = useState(-1)
  const [revealed, setRevealed] = useState(false)
  const [touched, setTouched] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
  const x = useMotionValue(0)
  const reached = useRef(-1)
  const done = useRef(false)

  useEffect(() => {
    if (intro) say(prompt('blend-intro', 'Slide the ball under the letters. Say each sound!'))
  }, []) // only on arrival

  // Where along the track (in px from the start) each letter sits.
  const TRACK_PADDING = 6
  const tileStops = () => {
    const track = trackRef.current?.getBoundingClientRect()
    const ball = ballRef.current?.getBoundingClientRect()
    if (!track || !ball) return { stops: [], max: 0 }
    const stops = tileRefs.current.map((t) => {
      const r = t!.getBoundingClientRect()
      return r.left + r.width / 2 - track.left - TRACK_PADDING - ball.width / 2
    })
    return { stops, max: track.width - 2 * TRACK_PADDING - ball.width }
  }

  useEffect(() => {
    return x.on('change', (v) => {
      if (done.current) return
      const { stops, max } = tileStops()
      let i = reached.current
      while (i + 1 < stops.length && v >= stops[i + 1] - 4) i++
      if (i > reached.current) {
        reached.current = i
        setLit(i)
        say(sound(letters[i]))
      }
      if (max > 0 && v >= max - 6 && reached.current === letters.length - 1) finish()
    })
  }, [word.text])

  const finish = () => {
    if (done.current) return
    done.current = true
    setLit(letters.length)
    setRevealed(true)
    sfx.right()
    say(pause(250), wordClip(word.text), pause(400), wordClip(word.text))
  }

  const reset = () => {
    if (done.current) return
    reached.current = -1
    setLit(-1)
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 26 })
  }

  // A tap on the ball slides it along by itself, for children who find dragging hard.
  const autoSlide = () => {
    if (done.current) return
    const { max } = tileStops()
    reached.current = -1
    x.set(0)
    animate(x, max, { duration: 0.9 * letters.length, ease: 'linear' })
  }

  // After the word is found: hear it again, sound by sound.
  const replay = async () => {
    for (let i = 0; i < letters.length; i++) {
      setLit(i)
      if (!(await say(sound(letters[i])))) return
    }
    setLit(letters.length)
    await say(pause(150), wordClip(word.text))
  }

  return (
    <div className="activity blend">
      <div className="blend-stage">
        <motion.div
          className="blend-reveal"
          animate={revealed ? { scale: [1, 1.3, 1.1], rotate: [0, -8, 6, 0] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Picture word={word} size={fit(170)} />
          {revealed && <Confetti pieces={28} />}
        </motion.div>
      </div>

      <div className="blend-board">
        <div className={`tile-row ${revealed ? 'tile-row-joined' : ''}`}>
          {letters.map((l, i) => (
            <LetterTile
              key={i}
              ref={(el) => {
                tileRefs.current[i] = el
              }}
              letter={l}
              lit={lit === i || lit === letters.length}
              onTap={() => say(sound(l))}
            />
          ))}
        </div>
        <div className="track" ref={trackRef} style={{ ['--accent' as string]: color }}>
          <div className="track-dots">
            {letters.map((_, i) => (
              <span key={i} className={`track-dot ${i <= lit ? 'track-dot-on' : ''}`} />
            ))}
          </div>
          {!touched && !revealed && (
            <motion.span
              className="hint-hand"
              aria-hidden
              animate={{ left: ['2%', '70%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
            >
              👆
            </motion.span>
          )}
          <motion.div
            ref={ballRef}
            className="ball"
            style={{ x, background: color }}
            drag={revealed ? false : 'x'}
            dragConstraints={trackRef}
            dragElastic={0}
            dragMomentum={false}
            onPointerDown={() => setTouched(true)}
            onDragStart={() => {
              reached.current = -1
            }}
            onDragEnd={() => {
              if (!done.current) reset()
            }}
            onTap={autoSlide}
            whileTap={{ scale: 1.15 }}
            animate={revealed ? {} : { boxShadow: ['0 0 0 0 rgba(255,255,255,.7)', '0 0 0 16px rgba(255,255,255,0)'] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </motion.div>
        </div>
      </div>

      <Footer mood={revealed ? 'cheer' : talking ? 'talk' : 'idle'}>
        {revealed ? (
          <>
            <RoundButton label="Hear it again" onClick={replay}>
              <span style={{ color }}>{Icon.speaker}</span>
            </RoundButton>
            <RoundButton label="Next" color={color} onClick={onDone} pulse={!talking}>
              <span style={{ color: '#fff' }}>{Icon.next}</span>
            </RoundButton>
          </>
        ) : (
          <RoundButton label="Hear the instruction" onClick={() => say(prompt('blend-intro', 'Slide the ball under the letters. Say each sound!'))}>
            <span style={{ color }}>{Icon.speaker}</span>
          </RoundButton>
        )}
      </Footer>
    </div>
  )
}
