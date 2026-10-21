import { motion } from 'framer-motion'
import { games, SWAP_ID } from '../data/games'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { Stars, StaticTile } from '../components/ui'
import { TabShell } from '../components/TabShell'

/** Games tab: practice games that never run out, using every word the child can sound out. */
export function GamesTab() {
  return (
    <TabShell tab="games" title="Games">
      <GameBanners />
    </TabShell>
  )
}

function GameBanners() {
  const progress = loadProgress()
  return (
    <main className="banners">
      {games.map((g, i) => (
        <motion.button
          key={g.id}
          type="button"
          className="banner"
          style={{ ['--accent' as string]: g.color }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 220, damping: 18 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => go(`/lesson/${g.id}`)}
          aria-label={g.label}
        >
          {g.id === SWAP_ID ? (
            <span className="swap-demo">
              <StaticTile letter="c" size="md" />
              <span className="swap-q">?</span>
              <StaticTile letter="t" size="md" />
            </span>
          ) : (
            <span className="banner-tile game-tile">{g.pic}</span>
          )}
          <span className="banner-label">{g.label}</span>
          <span className="banner-info">
            <Stars count={progress[g.id] ?? 0} size={22} />
          </span>
        </motion.button>
      ))}
    </main>
  )
}
