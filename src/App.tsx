import { useState } from 'react'
import { go, useRoute } from './lib/router'
import { parseWork, useTeacher } from './lib/teacher'
import { PinPad } from './components/PinPad'
import { TeacherBar } from './components/TeacherBar'
import { WorkPage } from './screens/WorkPage'
import { Home } from './screens/Home'
import { AlphabetHome } from './screens/AlphabetHome'
import { AlphabetPage } from './screens/AlphabetPage'
import { findAlphabetPage } from './data/alphabet'
import { VowelScreen } from './screens/VowelScreen'
import { Lesson, isLessonId } from './screens/Lesson'
import { Teacher } from './screens/Teacher'
import { Studio } from './screens/Studio'
import { Plan } from './screens/Plan'
import { WordsTab } from './screens/WordsTab'
import { GamesTab } from './screens/GamesTab'
import { BooksTab } from './screens/BooksTab'
import { BookScreen } from './screens/BookScreen'
import { findBook } from './data/books'
import { Scenery } from './components/Scenery'
import type { Vowel } from './data/curriculum'

export function App() {
  const [page, param] = useRoute()
  const teacher = useTeacher()
  const [, setUnlocked] = useState(0)
  const desk = ['teacher', 'grown-ups', 'studio', 'plan'].includes(page ?? '')

  let screen
  if (page === 'vowel' && param && 'aeiou'.includes(param)) screen = <VowelScreen key={param} vowel={param as Vowel} />
  else if (page === 'lesson' && param && isLessonId(param)) screen = <Lesson key={param} id={param} />
  else if (desk && !teacher) screen = <PinPad onPass={() => setUnlocked((n) => n + 1)} onCancel={() => go('/')} />
  else if (page === 'teacher' || page === 'grown-ups') screen = <Teacher />
  else if (page === 'studio') screen = <Studio />
  else if (page === 'plan') screen = <Plan />
  else if (page === 'work' && param && parseWork(param)) screen = <WorkPage key={param} code={param} work={parseWork(param)!} />
  else if (page === 'words') screen = <WordsTab />
  else if (page === 'sentences') screen = <WordsTab />
  else if (page === 'sounds') screen = <Home />
  else if (page === 'alphabet' && param && findAlphabetPage(param)) screen = <AlphabetPage key={param} letter={param} />
  else if (page === 'games') screen = <GamesTab />
  else if (page === 'books') screen = <BooksTab />
  else if (page === 'book' && param && findBook(param)) screen = <BookScreen key={param} id={param} />
  else screen = <AlphabetHome />

  const theme = ['abc', 'sounds', 'words', 'games', 'books'].includes(page ?? '') ? page : page === 'vowel' || page === 'sentences' ? 'words' : page === 'alphabet' || !page ? 'abc' : page === 'book' ? 'books' : page === 'lesson' || page === 'work' ? 'meadow' : 'abc'
  return (
    <>
      <Scenery theme={theme} />
      {teacher && <TeacherBar route={`/${[page, param].filter(Boolean).join('/')}`} />}
      {screen}
    </>
  )
}
