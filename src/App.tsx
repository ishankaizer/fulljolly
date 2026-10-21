import { useRoute } from './lib/router'
import { Home } from './screens/Home'
import { VowelScreen } from './screens/VowelScreen'
import { Lesson, isLessonId } from './screens/Lesson'
import { GrownUps } from './screens/GrownUps'
import { Studio } from './screens/Studio'
import { Plan } from './screens/Plan'
import { WordsTab } from './screens/WordsTab'
import { SentencesTab } from './screens/SentencesTab'
import { GamesTab } from './screens/GamesTab'
import { BooksTab } from './screens/BooksTab'
import { BookScreen } from './screens/BookScreen'
import { findBook } from './data/books'
import { Scenery } from './components/Scenery'
import type { Vowel } from './data/curriculum'

export function App() {
  const [page, param] = useRoute()

  let screen
  if (page === 'vowel' && param && 'aeiou'.includes(param)) screen = <VowelScreen key={param} vowel={param as Vowel} />
  else if (page === 'lesson' && param && isLessonId(param)) screen = <Lesson key={param} id={param} />
  else if (page === 'grown-ups') screen = <GrownUps />
  else if (page === 'studio') screen = <Studio />
  else if (page === 'plan') screen = <Plan />
  else if (page === 'words') screen = <WordsTab />
  else if (page === 'sentences') screen = <SentencesTab />
  else if (page === 'games') screen = <GamesTab />
  else if (page === 'books') screen = <BooksTab />
  else if (page === 'book' && param && findBook(param)) screen = <BookScreen key={param} id={param} />
  else screen = <Home />

  return (
    <>
      <Scenery />
      {screen}
    </>
  )
}
