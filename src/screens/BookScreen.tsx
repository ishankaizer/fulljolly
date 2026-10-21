import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { findBook, isTricky, tokens } from '../data/books'
import { allWords } from '../data/vocab'
import { pause, prompt, sfx, word } from '../lib/audio'
import { go } from '../lib/router'
import { saveStars } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { Confetti, Icon, Picture, RoundButton, fit } from '../components/ui'
import { Pip } from '../components/Pip'

/** A little reader: tap any word to hear it, or have the page read aloud word by word. */
export function BookScreen({ id }: { id: string }) {
  const book = findBook(id)!
  const [page, setPage] = useState(0)
  const [active, setActive] = useState(-1)
  const { talking, say } = useVoice()
  const last = page === book.pages.length - 1
  const [theEnd, setTheEnd] = useState(false)

  const current = book.pages[page]
  const words = tokens(current.sentence)
  const pics = current.pics.map((t) => allWords.find((w) => w.text === t)).filter(Boolean)

  const readAloud = async () => {
    for (let i = 0; i < words.length; i++) {
      setActive(i)
      const lower = words[i] === 'I' ? 'I' : words[i].toLowerCase()
      if (!(await say(word(lower), pause(120)))) return setActive(-1)
    }
    setActive(-1)
  }

  useEffect(() => {
    setActive(-1)
    // Read each new page to the child, so they can follow along with the words.
    void readAloud()
  }, [page])

  const turn = (by: number) => {
    sfx.pop()
    if (by > 0 && last) {
      saveStars(`book-${book.id}`, 3)
      setTheEnd(true)
      void say(prompt('well-done'))
      return
    }
    setPage((p) => Math.max(0, Math.min(book.pages.length - 1, p + by)))
  }

  return (
    <div className="screen lesson" style={{ ['--accent' as string]: book.color }}>
      <header className="lesson-top">
        <RoundButton label="Back to the books" onClick={() => go('/books')}>
          <span style={{ color: book.color }}>{Icon.back}</span>
        </RoundButton>
        <h1 className="lesson-title">{book.title}</h1>
        <div className="progress" aria-label={`page ${page + 1} of ${book.pages.length}`}>
          <div
            className="progress-fill"
            style={{ background: book.color, width: `${((page + 1) / book.pages.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="lesson-body">
        <div className="activity book-page">
          <AnimatePresence mode="wait">
            <motion.div
              key={theEnd ? 'end' : page}
              className="book-spread"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.25 }}
            >
              {theEnd ? (
                <>
                  <Confetti pieces={60} />
                  <Pip mood="cheer" size={fit(180, 0.26)} />
                  <p className="book-end">The end</p>
                </>
              ) : (
                <>
                  <div className="book-pics">
                    {pics.map((w) => (
                      <button key={w!.text} type="button" onClick={() => say(word(w!.text))} aria-label={w!.text}>
                        <Picture word={w!} size={fit(130, 0.2)} />
                      </button>
                    ))}
                  </div>
                  <p className="book-sentence">
                    {words.map((w, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`book-word ${isTricky(w) ? 'book-word-tricky' : ''} ${active === i ? 'book-word-active' : ''}`}
                        onClick={() => say(word(w === 'I' ? 'I' : w.toLowerCase()))}
                      >
                        {w}
                      </button>
                    ))}
                    <span className="book-stop">.</span>
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="activity-footer">
            <Pip mood={theEnd ? 'cheer' : talking ? 'talk' : 'idle'} size={fit(110, 0.15)} />
            <div className="footer-actions">
              {theEnd ? (
                <>
                  <RoundButton label="Read it again" onClick={() => { setTheEnd(false); setPage(0) }}>
                    <span style={{ color: book.color }}>{Icon.again}</span>
                  </RoundButton>
                  <RoundButton label="Back to the books" color={book.color} onClick={() => go('/books')}>
                    <span style={{ color: '#fff' }}>{Icon.home}</span>
                  </RoundButton>
                </>
              ) : (
                <>
                  {page > 0 && (
                    <RoundButton label="Previous page" onClick={() => turn(-1)}>
                      <span style={{ color: book.color, display: 'inline-flex' }}>{Icon.back}</span>
                    </RoundButton>
                  )}
                  <RoundButton label="Read to me" onClick={() => void readAloud()}>
                    <span style={{ color: book.color }}>{Icon.speaker}</span>
                  </RoundButton>
                  <RoundButton label={last ? 'Finish' : 'Next page'} color={book.color} onClick={() => turn(1)} pulse={!talking}>
                    <span style={{ color: '#fff' }}>{Icon.next}</span>
                  </RoundButton>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
