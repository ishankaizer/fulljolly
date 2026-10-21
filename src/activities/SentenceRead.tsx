import { useEffect, useState } from 'react'
import { trickyList, wordByText } from '../data/vocab'
import type { Sentence } from '../data/course'
import { pause, prompt, word } from '../lib/audio'
import { sentenceTokens } from '../lib/sentences'
import { useVoice } from '../lib/useVoice'
import { Footer, Icon, Picture, RoundButton, fit } from '../components/ui'

/** A sentence to read: the pictures it is about, every word touchable, and a read-to-me button. */
export function SentenceRead({ sentence, color, intro, onDone }: { sentence: Sentence; color: string; intro: boolean; onDone: () => void }) {
  const { talking, say } = useVoice()
  const [active, setActive] = useState(-1)
  const tokens = sentenceTokens(sentence.text)
  const pics = sentence.pics.map((t) => wordByText(t)).filter(Boolean)

  const readAloud = async () => {
    for (let i = 0; i < tokens.length; i++) {
      setActive(i)
      if (!(await say(word(tokens[i].key), pause(120)))) return setActive(-1)
    }
    setActive(-1)
  }

  useEffect(() => {
    setActive(-1)
    void (async () => {
      if (intro) await say(prompt('sentence-read-intro'), pause(200))
      await readAloud()
    })()
  }, [sentence.text])

  return (
    <div className="activity book-page">
      <div className="book-spread">
        <div className="book-pics">
          {pics.map((p) => (
            <button key={p!.text} type="button" onClick={() => say(word(p!.text))} aria-label={p!.text}>
              <Picture word={p!} size={fit(120, 0.18)} />
            </button>
          ))}
        </div>
        <p className="book-sentence">
          {tokens.map((t, i) => (
            <button
              key={i}
              type="button"
              className={`book-word ${trickyList.includes(t.key) ? 'book-word-tricky' : ''} ${active === i ? 'book-word-active' : ''}`}
              onClick={() => say(word(t.key))}
            >
              {t.shown}
              {t.punct && <span className="book-stop">{t.punct}</span>}
            </button>
          ))}
        </p>
      </div>
      <Footer mood={talking ? 'talk' : 'idle'}>
        <RoundButton label="Read to me" onClick={() => void readAloud()}>
          <span style={{ color }}>{Icon.speaker}</span>
        </RoundButton>
        <RoundButton label="Next" color={color} onClick={onDone} pulse={!talking}>
          <span style={{ color: '#fff' }}>{Icon.next}</span>
        </RoundButton>
      </Footer>
    </div>
  )
}
