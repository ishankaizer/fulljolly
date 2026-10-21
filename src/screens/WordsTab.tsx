import { motion } from 'framer-motion'
import { familyId, units } from '../data/curriculum'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { Stars, vowelColor } from '../components/ui'
import { GroupGrid } from '../components/GroupGrid'
import { TabShell } from '../components/TabShell'

/** Words tab: one banner per vowel, each leading to its word families (-at, -am, ...). */
export function WordsTab() {
  return (
    <TabShell tab="words" title="Words">
      <Banners />
      <GroupGrid tab="words" />
      <GroupGrid tab="sentences" />
    </TabShell>
  )
}

function Banners() {
  const progress = loadProgress()
  return (
    <main className="banners">
      {units.map((unit, i) => {
        const ids = unit.families.map((f) => familyId(unit.vowel, f.rime))
        const stars = ids.reduce((sum, id) => sum + (progress[id] ?? 0), 0)
        return (
          <motion.button
            key={unit.vowel}
            type="button"
            className="banner"
            style={{ ['--accent' as string]: vowelColor[unit.vowel] }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 220, damping: 18 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => go(`/vowel/${unit.vowel}`)}
            aria-label={`Letter ${unit.vowel}`}
          >
            <span className="banner-tile">{unit.vowel}</span>
            <span className="banner-pic">{unit.keyword.pic}</span>
            <span className="banner-info">
              <span className="banner-chips">
                {unit.families.map((f, j) => (
                  <i key={f.rime} className={progress[ids[j]] ? 'chip-done' : ''}>
                    {f.rime}
                  </i>
                ))}
              </span>
              <Stars count={Math.round(stars / ids.length)} size={20} />
            </span>
          </motion.button>
        )
      })}
    </main>
  )
}
