import { motion } from 'framer-motion'
import { books } from '../data/books'
import { allWords } from '../data/vocab'
import { go } from '../lib/router'
import { loadProgress } from '../lib/settings'
import { Picture, Stars } from '../components/ui'
import { TabShell } from '../components/TabShell'

/** Books tab: short picture readers, one per vowel, made only of words the child can read. */
export function BooksTab() {
  return (
    <TabShell tab="books" title="Books">
      <Shelf />
    </TabShell>
  )
}

function Shelf() {
  const progress = loadProgress()
  return (
    <main className="banners">
      {books.map((book, i) => {
        const cover = allWords.find((w) => w.text === book.cover)
        return (
          <motion.button
            key={book.id}
            type="button"
            className="banner"
            style={{ ['--accent' as string]: book.color }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 220, damping: 18 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => go(`/book/${book.id}`)}
            aria-label={book.title}
          >
            {cover && <Picture word={cover} size={92} />}
            <span className="banner-label">{book.title}</span>
            <span className="banner-info">
              <Stars count={progress[`book-${book.id}`] ?? 0} size={22} />
            </span>
          </motion.button>
        )
      })}
    </main>
  )
}
