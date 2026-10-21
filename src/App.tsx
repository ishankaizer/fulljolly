import { useRoute } from './lib/router'
import { Home } from './screens/Home'
import { VowelScreen } from './screens/VowelScreen'
import { Lesson, SWAP_LESSON } from './screens/Lesson'
import { GrownUps } from './screens/GrownUps'
import { Scenery } from './components/Scenery'
import { findFamily, type Vowel } from './data/curriculum'

export function App() {
  const [page, param] = useRoute()

  let screen
  if (page === 'vowel' && param && 'aeiou'.includes(param)) screen = <VowelScreen key={param} vowel={param as Vowel} />
  else if (page === 'lesson' && param && (param === SWAP_LESSON || findFamily(param))) screen = <Lesson key={param} id={param} />
  else if (page === 'grown-ups') screen = <GrownUps />
  else screen = <Home />

  return (
    <>
      <Scenery />
      {screen}
    </>
  )
}
