import { useEffect, useState } from 'react'
import { findAlphabetPage, alphabet } from '../data/alphabet'
import { wordByText } from '../data/vocab'
import { sound, word } from '../lib/audio'
import { go } from '../lib/router'
import { saveStars } from '../lib/settings'
import { useVoice } from '../lib/useVoice'
import { Icon, Picture, RoundButton, fit } from '../components/ui'
import { StrokeDemo } from '../components/StrokeDemo'
import { StrokeTrace } from '../components/StrokeTrace'
import { colorForLetter } from './AlphabetHome'

/** Highlight the letter this page is about: the first letter of the word, or the x in box. */
function Highlighted({ text, letter }: { text: string; letter: string }) {
  const at = letter === 'x' ? text.indexOf('x') : 0
  return (
    <span className="abc-word-text">
      {text.slice(0, at)}
      <b>{text[at]}</b>
      {text.slice(at + 1)}
    </span>
  )
}

/** One letter's page: capital and small, how to write them, a go at tracing, and words that start with the sound. */
export function AlphabetPage({ letter }: { letter: string }) {
  const page = findAlphabetPage(letter)!
  const upper = letter.toUpperCase()
  const color = colorForLetter(letter)
  const { say } = useVoice()
  const [capDone, setCapDone] = useState(false)
  const [smallDone, setSmallDone] = useState(false)
  const words = page.words.map((t) => wordByText(t)!).filter(Boolean)
  const at = alphabet.findIndex((p) => p.letter === letter)
  const prev = alphabet[at - 1]
  const next = alphabet[at + 1]
  const complete = capDone && smallDone
  const guide = Math.min(190, Math.floor((window.innerWidth - 110) / 2))

  useEffect(() => {
    if (complete) saveStars(`abc-${letter}`, 3)
  }, [complete])

  return (
    <div className="screen abc-page" style={{ ['--accent' as string]: color }}>
      <header className="lesson-top">
        <RoundButton label="Back to A to Z" onClick={() => go('/')}>
          <span style={{ color }}>{Icon.back}</span>
        </RoundButton>
        <h1 className="abc-title" style={{ color }}>
          {upper}
          {letter}
        </h1>
        <div className="abc-nav">
          {prev && (
            <RoundButton label={`Letter ${prev.letter.toUpperCase()}`} onClick={() => go(`/alphabet/${prev.letter}`)}>
              <span className="abc-nav-letter" style={{ color }}>
                {prev.letter.toUpperCase()}
              </span>
            </RoundButton>
          )}
          {next && (
            <RoundButton label={`Letter ${next.letter.toUpperCase()}`} onClick={() => go(`/alphabet/${next.letter}`)} color={color}>
              <span className="abc-nav-letter" style={{ color: '#fff' }}>
                {next.letter.toUpperCase()}
              </span>
            </RoundButton>
          )}
        </div>
      </header>

      <main className="abc-stack">
        <section className="abc-panel">
          <h2>Meet the letter</h2>
          <div className="abc-pair">
            {[upper, letter].map((l) => (
              <button
                key={l}
                type="button"
                className="abc-tile"
                style={{ background: color }}
                onClick={() => say(sound(letter))}
                aria-label={`Hear the sound for ${l}`}
              >
                {l}
              </button>
            ))}
            <RoundButton label="Hear the sound" onClick={() => say(sound(letter))}>
              <span style={{ color }}>{Icon.speaker}</span>
            </RoundButton>
          </div>
          {words[0] && (
            <p className="abc-for">
              {upper}
              {letter} is for <strong>{words[0].text}</strong>
            </p>
          )}
        </section>

        <section className="abc-panel">
          <h2>How to write it</h2>
          <p className="abc-hint">Start at the red dot and follow the numbers. Touch the page to watch again.</p>
          <div className="abc-pair abc-pair-write">
            <figure>
              <StrokeDemo letter={upper} color={color} size={guide} />
              <figcaption>Capital {upper}</figcaption>
            </figure>
            <figure>
              <StrokeDemo letter={letter} color={color} size={guide} />
              <figcaption>Small {letter}</figcaption>
            </figure>
          </div>
        </section>

        <section className="abc-panel">
          <h2>Your turn</h2>
          <p className="abc-hint">Trace each letter with your finger.</p>
          <div className="abc-pair abc-pair-write">
            <figure>
              <StrokeTrace letter={upper} color={color} size={guide} onDone={() => setCapDone(true)} />
              <figcaption>Capital {upper}</figcaption>
            </figure>
            <figure>
              <StrokeTrace letter={letter} color={color} size={guide} onDone={() => setSmallDone(true)} />
              <figcaption>Small {letter}</figcaption>
            </figure>
          </div>
          {complete && <p className="abc-complete">⭐ Page complete! Well done.</p>}
        </section>

        <section className="abc-panel">
          <h2>
            {page.note ? `Words with ${upper}` : `Words that start with ${upper}`}
          </h2>
          {page.note && <p className="abc-hint">{page.note}.</p>}
          <div className="abc-words">
            {words.map((w) => (
              <button key={w.text} type="button" className="abc-word" onClick={() => say(word(w.text))} aria-label={w.text}>
                <Picture word={w} size={fit(104, 0.14)} />
                <Highlighted text={w.text} letter={letter} />
              </button>
            ))}
          </div>
        </section>

        <div className="abc-footer">
          {prev ? (
            <button type="button" className="text-btn big" onClick={() => go(`/alphabet/${prev.letter}`)}>
              ← {prev.letter.toUpperCase()}
              {prev.letter}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button type="button" className="text-btn big keep" onClick={() => go(`/alphabet/${next.letter}`)}>
              {next.letter.toUpperCase()}
              {next.letter} →
            </button>
          ) : (
            <button type="button" className="text-btn big keep" onClick={() => go('/')}>
              All letters
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
