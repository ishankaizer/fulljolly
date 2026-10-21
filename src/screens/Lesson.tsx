import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { familyId, findFamily, units, vowelSwaps, type Family, type VowelUnit } from '../data/curriculum'
import { prompt, sfx } from '../lib/audio'
import { saveStars } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { MeetFamily } from '../activities/MeetFamily'
import { BlendSlide } from '../activities/BlendSlide'
import { TraceLetter } from '../activities/TraceLetter'
import { BuildWord } from '../activities/BuildWord'
import { MatchPicture } from '../activities/MatchPicture'
import { VowelSwap } from '../activities/VowelSwap'
import { Pip } from '../components/Pip'
import { Confetti, Icon, RoundButton, Stars, fit, hasPicture, shuffle, vowelColor } from '../components/ui'
import { go } from '../lib/router'

export const SWAP_LESSON = 'swap'

type Step = { key: string; render: (next: (mistakes?: number) => void) => React.ReactNode }

function familySteps(unit: VowelUnit, family: Family): Step[] {
  const steps: Step[] = [
    { key: 'meet', render: (next) => <MeetFamily unit={unit} family={family} onDone={() => next()} /> },
    { key: 'trace', render: (next) => <TraceLetter unit={unit} onDone={() => next()} /> },
  ]
  // Blend every word in the family: lots of repetition is how blending sticks.
  family.words.forEach((w, i) =>
    steps.push({
      key: `blend-${w.text}`,
      render: (next) => <BlendSlide unit={unit} word={w} intro={i === 0} onDone={() => next()} />,
    }),
  )
  shuffle(family.words)
    .slice(0, 4)
    .forEach((w, i) =>
      steps.push({
        key: `build-${w.text}`,
        render: (next) => <BuildWord unit={unit} family={family} word={w} intro={i === 0} onDone={next} />,
      }),
    )
  shuffle(family.words.filter(hasPicture))
    .slice(0, 4)
    .forEach((w, i) =>
      steps.push({
        key: `match-${w.text}`,
        render: (next) => (
          <MatchPicture unit={unit} word={w} familyWords={family.words} intro={i === 0} onDone={next} />
        ),
      }),
    )
  return steps
}

function swapSteps(): Step[] {
  return shuffle(vowelSwaps).map((frame, i) => {
    const word = shuffle(frame.words.filter(hasPicture))[0]
    return {
      key: `swap-${word.text}`,
      render: (next) => <VowelSwap frame={frame} word={word} intro={i === 0} onDone={next} />,
    }
  })
}

const starsFor = (mistakes: number) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1)

export function Lesson({ id }: { id: string }) {
  const found = id === SWAP_LESSON ? undefined : findFamily(id)
  const [attempt, setAttempt] = useState(0)
  const steps = useMemo(
    () => (found ? familySteps(found.unit, found.family) : swapSteps()),
    [id, attempt],
  )
  const [index, setIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const color = found ? vowelColor[found.unit.vowel] : '#ff6b9a'
  const finished = index >= steps.length
  const back = () => go(found ? `/vowel/${found.unit.vowel}` : '/')

  const next = (m = 0) => {
    setMistakes((total) => total + m)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    if (finished) saveStars(id, starsFor(mistakes))
  }, [finished])

  return (
    <div className="screen lesson" style={{ ['--accent' as string]: color }}>
      <header className="lesson-top">
        <RoundButton label="Back" onClick={back}>
          <span style={{ color }}>{Icon.back}</span>
        </RoundButton>
        <div className="progress" aria-label={`step ${Math.min(index + 1, steps.length)} of ${steps.length}`}>
          <motion.div
            className="progress-fill"
            style={{ background: color }}
            animate={{ width: `${(Math.min(index, steps.length) / steps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={finished ? 'done' : `${attempt}-${index}-${steps[index].key}`}
          className="lesson-body"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.25 }}
        >
          {finished ? (
            <LessonDone
              stars={starsFor(mistakes)}
              color={color}
              nextId={nextLessonId(id)}
              onAgain={() => {
                setAttempt((a) => a + 1)
                setIndex(0)
                setMistakes(0)
              }}
              onBack={back}
            />
          ) : (
            steps[index].render(next)
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

function nextLessonId(id: string): string | undefined {
  const all = units.flatMap((u) => u.families.map((f) => familyId(u.vowel, f.rime)))
  const i = all.indexOf(id)
  return i >= 0 ? all[i + 1] ?? SWAP_LESSON : undefined
}

function LessonDone({
  stars,
  color,
  nextId,
  onAgain,
  onBack,
}: {
  stars: number
  color: string
  nextId?: string
  onAgain: () => void
  onBack: () => void
}) {
  const { say } = useVoice()
  useEffect(() => {
    sfx.cheer()
    say(prompt('well-done'))
  }, [])

  return (
    <div className="activity done">
      <Confetti pieces={70} />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 10 }}>
        <Pip mood="cheer" size={fit(200, 0.28)} />
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="done-stars"
      >
        <Stars count={stars} size={64} />
      </motion.div>
      <div className="done-actions">
        <RoundButton label="Back to the map" onClick={onBack}>
          <span style={{ color }}>{Icon.home}</span>
        </RoundButton>
        <RoundButton label="Play again" onClick={onAgain}>
          <span style={{ color }}>{Icon.again}</span>
        </RoundButton>
        {nextId && (
          <RoundButton label="Next lesson" color={color} onClick={() => go(`/lesson/${nextId}`)} pulse>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        )}
      </div>
    </div>
  )
}
