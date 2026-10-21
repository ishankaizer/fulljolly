import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { familyOfWord, findFamily, vowelSwaps, type Family, type VowelUnit, type Word } from '../data/curriculum'
import {
  allLessons,
  findLesson,
  lessonWords,
  pathway,
  soundLessons,
  SWAP,
  traceLetters,
  type Group,
  type Lesson as LessonData,
  type Sentence,
} from '../data/course'
import { games, isGameId } from '../data/games'
import { letterHint } from '../data/recordingList'
import { allWords, trickyList, wordByText } from '../data/vocab'
import { prompt, sfx, sound } from '../lib/audio'
import { saveStars } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { MeetFamily } from '../activities/MeetFamily'
import { BlendSlide } from '../activities/BlendSlide'
import { BlendingCard } from '../activities/BlendingCard'
import { BlendIntro } from '../activities/BlendIntro'
import { BuildTiles } from '../activities/BuildTiles'
import { PickWord } from '../activities/PickWord'
import { TrickyWord } from '../activities/TrickyWord'
import { SentenceRead } from '../activities/SentenceRead'
import { SentencePick } from '../activities/SentencePick'
import { SentenceBuild } from '../activities/SentenceBuild'
import { TraceLetter } from '../activities/TraceLetter'
import { SoundIntro } from '../activities/SoundIntro'
import { PickLetter } from '../activities/PickLetter'
import { BuildWord } from '../activities/BuildWord'
import { MatchPicture } from '../activities/MatchPicture'
import { VowelSwap } from '../activities/VowelSwap'
import { Pip } from '../components/Pip'
import { Confetti, Icon, Picture, RoundButton, Stars, fit, hasPicture, shuffle, vowelColor } from '../components/ui'
import { go } from '../lib/router'

export const SWAP_LESSON = SWAP

type Step = { key: string; render: (next: (mistakes?: number) => void) => React.ReactNode }

const pictured = (words: Word[]) => words.filter(hasPicture)
const allSentences: Sentence[] = allLessons.flatMap((l) => l.sentences ?? [])

/** Two other written words that look a little like the one being asked for. */
function wordOptions(target: Word, near: Word[]): Word[] {
  const pool = [
    ...shuffle(near.filter((w) => w.text !== target.text)),
    ...shuffle(allWords.filter((w) => hasPicture(w) && Math.abs(w.text.length - target.text.length) <= 1 && w.text !== target.text)),
  ]
  const picked: Word[] = []
  for (const w of pool) if (picked.length < 2 && !picked.some((p) => p.text === w.text)) picked.push(w)
  return shuffle([target, ...picked])
}

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

/** Word practice shared by sound and blend lessons: blend, build from tiles, match, find the written word. */
function wordSteps(color: string, words: Word[], opts: { builds: number; matches: number; picks: number }): Step[] {
  const steps: Step[] = []
  if (!words.length) return steps
  steps.push({ key: 'blending', render: (next) => <BlendingCard words={words.slice(0, 3)} color={color} onDone={() => next()} /> })
  words.slice(0, opts.builds).forEach((w, i) =>
    steps.push({ key: `tiles-${w.text}`, render: (next) => <BuildTiles word={w} color={color} intro={i === 0} onDone={next} /> }),
  )
  words.slice(0, opts.matches).forEach((w, i) =>
    steps.push({
      key: `match-${w.text}`,
      render: (next) => <MatchPicture color={color} word={w} familyWords={words} intro={i === 0} onDone={next} />,
    }),
  )
  if (words.length >= 3)
    words.slice(0, opts.picks).forEach((w, i) => {
      const options = wordOptions(w, words)
      steps.push({
        key: `pick-${w.text}`,
        render: (next) => <PickWord target={w} options={options} color={color} intro={i === 0} onDone={next} />,
      })
    })
  return steps
}

/** One sound: meet it, trace it, pick it out, then blend real words that use it. */
function soundSteps(group: Group, lesson: LessonData): Step[] {
  const color = group.color
  const steps: Step[] = [{ key: 'intro', render: (next) => <SoundIntro lesson={lesson} color={color} onDone={() => next()} /> }]
  for (const l of traceLetters(lesson))
    steps.push({
      key: `trace-${l}`,
      render: (next) => <TraceLetter letter={l} keyword={lesson.keyword!} color={color} onDone={() => next()} />,
    })

  const at = soundLessons.indexOf(lesson)
  const others = (at >= 2 ? soundLessons.slice(0, at) : soundLessons.filter((l) => l !== lesson)).filter((l) => l.label !== lesson.label)
  for (let i = 0; i < 3; i++) {
    const options = shuffle([lesson, ...shuffle(others).slice(0, 2)])
    steps.push({
      key: `pick-${i}`,
      render: (next) => <PickLetter target={lesson} options={options} color={color} intro={i === 0} onDone={next} />,
    })
  }
  const words = shuffle(pictured(lessonWords(lesson)))
  return steps.concat(wordSteps(color, words, { builds: 2, matches: 2, picks: 2 }))
}

/** Two letters that each keep their sound: the step up to four-letter words. */
function patternSteps(group: Group, lesson: LessonData): Step[] {
  const color = group.color
  const words = shuffle(pictured(lessonWords(lesson)))
  return [
    { key: 'intro', render: (next) => <BlendIntro lesson={lesson} color={color} onDone={() => next()} /> } as Step,
  ].concat(wordSteps(color, words, { builds: 3, matches: 2, picks: 2 }))
}

/** Words that are learned by sight, then used in sentences. */
function trickySteps(group: Group, lesson: LessonData): Step[] {
  const color = group.color
  const words = (lesson.words ?? []).map((t) => wordByText(t)).filter((w): w is Word => Boolean(w))
  const steps: Step[] = words.map((w, i) => ({
    key: `tricky-${w.text}`,
    render: (next) => <TrickyWord word={w} color={color} intro={i === 0} onDone={() => next()} />,
  }))
  const seen = trickyList.map((t) => wordByText(t)!).filter(Boolean)
  shuffle(words)
    .slice(0, 4)
    .forEach((w, i) => {
      const options = shuffle([w, ...shuffle(seen.filter((x) => x.text !== w.text)).slice(0, 2)])
      steps.push({
        key: `pick-${w.text}`,
        render: (next) => <PickWord target={w} options={options} color={color} intro={i === 0} onDone={next} />,
      })
    })
  shuffle(lesson.sentences ?? [])
    .slice(0, 3)
    .forEach((s, i) =>
      steps.push({ key: `build-${s.text}`, render: (next) => <SentenceBuild sentence={s} color={color} intro={i === 0} onDone={next} /> }),
    )
  return steps
}

/** Words strung together: read a sentence, match it to its picture, build it in order. */
function sentenceSteps(group: Group, lesson: LessonData): Step[] {
  const color = group.color
  const chosen = shuffle(lesson.sentences ?? []).slice(0, 4)
  const steps: Step[] = chosen.map((s, i) => ({
    key: `read-${s.text}`,
    render: (next) => <SentenceRead sentence={s} color={color} intro={i === 0} onDone={() => next()} />,
  }))
  chosen
    .filter((s) => s.pics.length)
    .slice(0, 3)
    .forEach((s, i) =>
      steps.push({
        key: `pick-${s.text}`,
        render: (next) => <SentencePick sentence={s} others={allSentences} color={color} intro={i === 0} onDone={next} />,
      }),
    )
  chosen.forEach((s, i) =>
    steps.push({ key: `build-${s.text}`, render: (next) => <SentenceBuild sentence={s} color={color} intro={i === 0} onDone={next} /> }),
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

/** Eight random rounds of one practice game. */
function gameSteps(id: string): Step[] {
  if (id === 'game-letters') {
    return shuffle(soundLessons)
      .slice(0, 8)
      .map((target, i) => {
        const options = shuffle([target, ...shuffle(soundLessons.filter((l) => l.label !== target.label)).slice(0, 2)])
        return {
          key: `letter-${target.id}`,
          render: (next) => <PickLetter target={target} options={options} color="#f2a900" intro={i === 0} onDone={next} />,
        }
      })
  }
  if (id === 'game-sentence') {
    return shuffle(allSentences)
      .slice(0, 6)
      .map((s, i) => ({
        key: `sentence-${s.text}`,
        render: (next) => <SentenceBuild sentence={s} color="#2fb7a3" intro={i === 0} onDone={next} />,
      }))
  }
  if (id === 'game-tiles' || id === 'game-pickword') {
    const pool = shuffle(allWords.filter((w) => hasPicture(w) && w.text.length >= 3)).slice(0, 8)
    return pool.map((w, i): Step => {
      if (id === 'game-tiles')
        return { key: `tiles-${w.text}`, render: (next) => <BuildTiles word={w} color="#e0638a" intro={i === 0} onDone={next} /> }
      const options = wordOptions(w, [])
      return { key: `pick-${w.text}`, render: (next) => <PickWord target={w} options={options} color="#7a6ff0" intro={i === 0} onDone={next} /> }
    })
  }
  // The three-letter games use words that belong to a vowel family.
  return shuffle(allWords.filter((w) => hasPicture(w) && familyOfWord(w.text)))
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

export const lessonOrder = pathway

export const isLessonId = (id: string) => id === SWAP || isGameId(id) || Boolean(findFamily(id) || findLesson(id))

const starsFor = (mistakes: number) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1)

const backTo = (kind?: LessonData['kind']) =>
  kind === 'sound' ? '/sounds' : kind === 'pattern' || kind === 'tricky' || kind === 'sentences' ? '/words' : '/games'

export function Lesson({ id }: { id: string }) {
  const family = id === SWAP ? undefined : findFamily(id)
  const course = findLesson(id)
  const [attempt, setAttempt] = useState(0)
  const steps = useMemo(() => {
    if (family) return familySteps(family.unit, family.family)
    if (course) {
      const { group, lesson } = course
      return lesson.kind === 'sound'
        ? soundSteps(group, lesson)
        : lesson.kind === 'pattern'
          ? patternSteps(group, lesson)
          : lesson.kind === 'tricky'
            ? trickySteps(group, lesson)
            : sentenceSteps(group, lesson)
    }
    return id === SWAP ? swapSteps() : gameSteps(id)
  }, [id, attempt])
  const [index, setIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)

  const color = family ? vowelColor[family.unit.vowel] : course ? course.group.color : (games.find((g) => g.id === id)?.color ?? '#ff6b9a')
  const finished = index >= steps.length
  const back = () => go(family ? `/vowel/${family.unit.vowel}` : backTo(course?.lesson.kind))
  const isSound = course?.lesson.kind === 'sound'
  const title = isSound
    ? `Lesson /${course!.lesson.label}/`
    : course?.lesson.kind === 'pattern'
      ? course.lesson.label
      : course?.lesson.kind === 'tricky'
        ? 'Tricky words'
        : course?.lesson.kind === 'sentences'
          ? 'Sentences'
          : ''

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
        {title && <h1 className="lesson-title">{title}</h1>}
        <div className="progress" aria-label={`step ${Math.min(index + 1, steps.length)} of ${steps.length}`}>
          <motion.div
            className="progress-fill"
            style={{ background: color }}
            animate={{ width: `${(Math.min(index, steps.length) / steps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        {isSound && (
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

      {noteOpen && isSound && <LessonNote lesson={course!.lesson} color={color} onClose={() => setNoteOpen(false)} />}
    </div>
  )
}

/** For the grown-up helping: how to make this sound, and a button to hear it. */
function LessonNote({ lesson, color, onClose }: { lesson: LessonData; color: string; onClose: () => void }) {
  const { say } = useVoice()
  return (
    <div className="gate-backdrop" role="dialog" aria-label="How to say this sound" onClick={onClose}>
      <div className="gate" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color }}>Lesson /{lesson.label}/</h2>
        <Picture word={lesson.keyword!} size={fit(110, 0.16)} caption />
        <p className="note-sound">{letterHint(lesson.soundOf!)}</p>
        <button type="button" className="text-btn big" onClick={() => say(sound(lesson.soundOf!))}>
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
  const i = pathway.indexOf(id)
  return i >= 0 ? pathway[i + 1] : undefined
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
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="done-stars">
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
