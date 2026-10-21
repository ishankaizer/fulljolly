import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { familyId, familyOfWord, findFamily, units, vowelSwaps, type Family, type VowelUnit } from '../data/curriculum'
import { games, isGameId } from '../data/games'
import {
  blendableWords,
  findLetterLesson,
  letterLessons,
  letterWords,
  type LetterGroup,
  type LetterLesson,
} from '../data/letters'
import { letterHint } from '../data/recordingList'
import { prompt, sfx, sound } from '../lib/audio'
import { saveStars } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { MeetFamily } from '../activities/MeetFamily'
import { BlendSlide } from '../activities/BlendSlide'
import { BlendingCard } from '../activities/BlendingCard'
import { TraceLetter } from '../activities/TraceLetter'
import { SoundIntro } from '../activities/SoundIntro'
import { PickLetter } from '../activities/PickLetter'
import { BuildWord } from '../activities/BuildWord'
import { MatchPicture } from '../activities/MatchPicture'
import { VowelSwap } from '../activities/VowelSwap'
import { Pip } from '../components/Pip'
import { Confetti, Icon, Picture, RoundButton, Stars, fit, hasPicture, shuffle, vowelColor } from '../components/ui'
import { go } from '../lib/router'

export const SWAP_LESSON = 'swap'

type Step = { key: string; render: (next: (mistakes?: number) => void) => React.ReactNode }

function familySteps(unit: VowelUnit, family: Family): Step[] {
  const steps: Step[] = [
    { key: 'meet', render: (next) => <MeetFamily unit={unit} family={family} onDone={() => next()} /> },
    {
      key: 'trace',
      render: (next) => (
        <TraceLetter letter={unit.vowel} keyword={unit.keyword} color={vowelColor[unit.vowel]} onDone={() => next()} />
      ),
    },
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
          <MatchPicture color={vowelColor[unit.vowel]} word={w} familyWords={family.words} intro={i === 0} onDone={next} />
        ),
      }),
    )
  return steps
}

/** One sound: meet it, trace it, pick it out, then blend real words that use it. */
function letterSteps(group: LetterGroup, lesson: LetterLesson): Step[] {
  const color = group.color
  const steps: Step[] = [
    { key: 'intro', render: (next) => <SoundIntro lesson={lesson} color={color} onDone={() => next()} /> },
  ]
  lesson.letters.forEach((l) =>
    steps.push({
      key: `trace-${l}`,
      render: (next) => <TraceLetter letter={l} keyword={lesson.keyword} color={color} onDone={() => next()} />,
    }),
  )

  const at = letterLessons.indexOf(lesson)
  const others = at >= 2 ? letterLessons.slice(0, at) : letterLessons.filter((l) => l !== lesson)
  for (let i = 0; i < 3; i++) {
    const options = shuffle([lesson, ...shuffle(others).slice(0, 2)])
    steps.push({
      key: `pick-${i}`,
      render: (next) => <PickLetter target={lesson} options={options} color={color} intro={i === 0} onDone={next} />,
    })
  }

  const words = shuffle(blendableWords(lesson))
  if (words.length) {
    const card = words.slice(0, 3)
    steps.push({ key: 'blending', render: (next) => <BlendingCard words={card} color={color} onDone={() => next()} /> })
    words.slice(0, 2).forEach((w, i) =>
      steps.push({
        key: `match-${w.text}`,
        render: (next) => <MatchPicture color={color} word={w} familyWords={words} intro={i === 0} onDone={next} />,
      }),
    )
  }
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

/** Eight random rounds of one practice game, drawn from every word the child can sound out. */
function gameSteps(id: string): Step[] {
  if (id === 'game-letters') {
    return shuffle(letterLessons)
      .slice(0, 8)
      .map((target, i) => {
        const options = shuffle([target, ...shuffle(letterLessons.filter((l) => l !== target)).slice(0, 2)])
        return {
          key: `letter-${target.id}`,
          render: (next) => <PickLetter target={target} options={options} color="#f2a900" intro={i === 0} onDone={next} />,
        }
      })
  }
  return shuffle(letterWords.filter((w) => familyOfWord(w.text)))
    .slice(0, 8)
    .map((w, i): Step => {
      const { unit, family } = familyOfWord(w.text)!
      const color = vowelColor[unit.vowel]
      if (id === 'game-match')
        return {
          key: `match-${w.text}`,
          render: (next) => <MatchPicture color={color} word={w} familyWords={family.words} intro={i === 0} onDone={next} />,
        }
      if (id === 'game-build')
        return {
          key: `build-${w.text}`,
          render: (next) => <BuildWord unit={unit} family={family} word={w} intro={i === 0} onDone={next} />,
        }
      return {
        key: `blend-${w.text}`,
        render: (next) => <BlendSlide unit={unit} word={w} intro={i === 0} onDone={() => next()} />,
      }
    })
}

/** The order children move through the lessons: every letter, then every word family, then the swap game. */
export const lessonOrder = [
  ...letterLessons.map((l) => l.id),
  ...units.flatMap((u) => u.families.map((f) => familyId(u.vowel, f.rime))),
  SWAP_LESSON,
]

export const isLessonId = (id: string) =>
  id === SWAP_LESSON || isGameId(id) || Boolean(findFamily(id) || findLetterLesson(id))

const starsFor = (mistakes: number) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1)

export function Lesson({ id }: { id: string }) {
  const family = id === SWAP_LESSON ? undefined : findFamily(id)
  const letter = findLetterLesson(id)
  const [attempt, setAttempt] = useState(0)
  const steps = useMemo(
    () =>
      family
        ? familySteps(family.unit, family.family)
        : letter
          ? letterSteps(letter.group, letter.lesson)
          : id === SWAP_LESSON
            ? swapSteps()
            : gameSteps(id),
    [id, attempt],
  )
  const [index, setIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)

  const color = family
    ? vowelColor[family.unit.vowel]
    : letter
      ? letter.group.color
      : (games.find((g) => g.id === id)?.color ?? '#ff6b9a')
  const finished = index >= steps.length
  const back = () => go(family ? `/vowel/${family.unit.vowel}` : letter ? '/' : '/games')

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
        {letter && <h1 className="lesson-title">Lesson /{letter.lesson.label}/</h1>}
        <div className="progress" aria-label={`step ${Math.min(index + 1, steps.length)} of ${steps.length}`}>
          <motion.div
            className="progress-fill"
            style={{ background: color }}
            animate={{ width: `${(Math.min(index, steps.length) / steps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        {letter && (
          <RoundButton label="How to say this sound" onClick={() => setNoteOpen(true)}>
            <span style={{ color }}>{Icon.book}</span>
          </RoundButton>
        )}
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

      {noteOpen && letter && <LessonNote lesson={letter.lesson} color={color} onClose={() => setNoteOpen(false)} />}
    </div>
  )
}

/** For the grown-up helping: how to make this sound, and a button to hear it. */
function LessonNote({ lesson, color, onClose }: { lesson: LetterLesson; color: string; onClose: () => void }) {
  const { say } = useVoice()
  return (
    <div className="gate-backdrop" role="dialog" aria-label="How to say this sound" onClick={onClose}>
      <div className="gate" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color }}>Lesson /{lesson.label}/</h2>
        <Picture word={lesson.keyword} size={fit(110, 0.16)} caption />
        <p className="note-sound">{letterHint(lesson.soundOf)}</p>
        <button type="button" className="text-btn big" onClick={() => say(sound(lesson.soundOf))}>
          ▶ Hear the sound
        </button>
        <button type="button" className="text-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function nextLessonId(id: string): string | undefined {
  const i = lessonOrder.indexOf(id)
  return i >= 0 ? lessonOrder[i + 1] : undefined
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
