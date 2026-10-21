import { motion } from 'framer-motion'
import { groups, type TabName } from '../data/course'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { Stars } from './ui'

/** The lesson cards for a tab, in colour-coded groups. */
export function GroupGrid({ tab }: { tab: TabName }) {
  const progress = loadProgress()
  const shown = groups.filter((g) => g.tab === tab)
  return (
    <main className="groups">
      {shown.map((group, gi) => (
        <motion.section
          key={group.id}
          className="group"
          style={{ ['--accent' as string]: group.color }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 + gi * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
        >
          <div className="group-head">
            <span className="group-animal" aria-hidden>
              {group.animals[0]}
            </span>
            <h2>{group.title}</h2>
            <span className="group-animal" aria-hidden>
              {group.animals[1]}
            </span>
          </div>
          <div className="group-tiles">
            {group.lessons.map((l) => {
              const text = l.icon ?? l.label
              const size = l.icon ? 'icon' : text.length <= 2 ? 'big' : text.length <= 4 ? 'mid' : 'small'
              return (
                <motion.button
                  key={l.id}
                  type="button"
                  className="letter-card"
                  whileTap={{ scale: 0.93, y: 3 }}
                  onClick={() => go(`/lesson/${l.id}`)}
                  aria-label={l.kind === 'sound' ? `Letter ${l.label}${l.caption ? ` as in ${l.caption}` : ''}` : l.label}
                >
                  <span className={`letter-card-letter letter-card-${size}`}>{text}</span>
                  {l.caption && <span className="letter-card-caption">{l.caption}</span>}
                  <Stars count={progress[l.id] ?? 0} size={16} />
                </motion.button>
              )
            })}
          </div>
        </motion.section>
      ))}
    </main>
  )
}
