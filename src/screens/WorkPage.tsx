import { motion } from 'framer-motion'
import { go } from '../lib/router'
import { loadProgress, currentProfile } from '../lib/settings'
import { describe, pageByRoute } from '../lib/routes'
import { setReturnTo, type ClassWork } from '../lib/teacher'
import { Pip } from '../components/Pip'
import { Icon, Stars } from '../components/ui'

/** What a class-work link opens: the teacher's list of pages, each one tap away, with ticks for the ones done. */
export function WorkPage({ work, code }: { work: ClassWork; code: string }) {
  const progress = loadProgress()
  const doneCount = work.items.filter((r) => (progress[pageByRoute(r)?.progressId ?? ''] ?? 0) > 0).length
  const open = (route: string) => {
    setReturnTo(`/work/${code}`)
    go(`/${route}`)
  }
  return (
    <div className="screen work">
      <header className="home-top">
        <button type="button" className="text-btn" onClick={() => go('/')}>
          {Icon.home} Home
        </button>
      </header>
      <main className="work-card">
        <div className="work-hero">
          <Pip mood={doneCount === work.items.length ? 'cheer' : 'idle'} size={96} />
          <div>
            <h1>{work.title}</h1>
            <p>
              {currentProfile().name}, {doneCount === work.items.length ? 'you finished everything!' : `${doneCount} of ${work.items.length} done. Tap the next one.`}
            </p>
          </div>
        </div>
        <ol className="work-list">
          {work.items.map((route, i) => {
            const stars = progress[pageByRoute(route)?.progressId ?? ''] ?? 0
            return (
              <motion.li key={route} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <button type="button" className={`work-item ${stars ? 'work-item-done' : ''}`} onClick={() => open(route)}>
                  <span className="work-num">{stars ? Icon.check : i + 1}</span>
                  <span className="work-name">{describe(route)}</span>
                  <Stars count={stars} size={18} />
                </button>
              </motion.li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}
