import { useRoute } from './lib/router'
import { Home } from './screens/Home'
import { VowelScreen } from './screens/VowelScreen'
import { Lesson } from './screens/Lesson'
import { GrownUps } from './screens/GrownUps'
import type { Vowel } from './data/curriculum'

export function App() {
  const [page, param] = useRoute()

  if (page === 'vowel' && param && 'aeiou'.includes(param)) return <VowelScreen key={param} vowel={param as Vowel} />
  if (page === 'lesson' && param) return <Lesson key={param} id={param} />
  if (page === 'grown-ups') return <GrownUps />
  return <Home />
}
