import { alphabet } from '../data/alphabet'
import { findFamily } from '../data/curriculum'
import { findLesson, lessonWords, stages, type Lesson } from '../data/course'
import { go } from '../lib/router'
import { Icon, RoundButton } from '../components/ui'

const how: [string, string][] = [
  ['Sound lessons', 'Hear the sound with a keyword, trace the letters, pick the letter that makes a sound (three times), blend a card of words by touching a dot under each sound, build two words from tiles, match two pictures, then find two words by ear.'],
  ['Three-letter families', 'Meet the ending, trace the vowel, slide to blend every word, build the first sound of four words, match four pictures.'],
  ['Four-letter words', 'Hear two letters that keep both their sounds, blend a card of words, build three from tiles, match two pictures, find two words by ear.'],
  ['Tricky words', 'See and hear each word, find it by ear, then build short sentences that use it.'],
  ['Sentences', 'Read four sentences (every word can be touched), match three to their pictures, then build all four in order.'],
]

function describe(id: string): { name: string; detail: string } {
  const fam = findFamily(id)
  if (fam) return { name: `${fam.unit.vowel}  -${fam.family.rime}`, detail: fam.family.words.map((w) => w.text).join(', ') }
  if (id === 'swap') return { name: 'Swap the middle sound', detail: 'cat, cot, cut · hat, hit, hot, hut · pan, pen, pin · bag, big, bug · pet, pot · bed, bud' }
  const found = findLesson(id)!.lesson
  return { name: found.kind === 'sound' ? `/${found.label}/${found.caption ? ` (${found.caption})` : ''}` : found.label, detail: detail(found) }
}

function detail(l: Lesson): string {
  if (l.kind === 'sentences') return l.sentences!.map((s) => s.text).join('  ')
  if (l.kind === 'tricky') return `${l.words!.join(', ')}  ·  ${l.sentences!.length} sentences`
  const words = lessonWords(l)
  return words.length ? words.map((w) => w.text).join(', ') : 'No words yet: too few letters to blend.'
}

/** The whole course on one page, for the grown-up planning lessons. Built from the same data the app runs on. */
export function Plan() {
  let n = 0
  return (
    <div className="screen grown-ups">
      <header className="lesson-top">
        <RoundButton label="Back" onClick={() => go('/grown-ups')}>
          <span>{Icon.back}</span>
        </RoundButton>
        <h1>Lesson plan</h1>
      </header>

      <main className="panel-stack">
        <section className="panel">
          <h2>How it works</h2>
          <p>
            Children move along the course in order. Every word only uses sounds taught before it, so a child can
            always sound it out. The big green Play button on the Sounds tab picks up where they left off. Suggested
            pace: one lesson a day, ten to fifteen minutes, with a Games session every few lessons to revisit.
          </p>
          {how.map(([title, text]) => (
            <p key={title} className="plan-how">
              <strong>{title}.</strong> {text}
            </p>
          ))}
          <p className="plan-how">
            <strong>Stars.</strong> Three stars for a lesson with at most one slip, two for up to four, one otherwise.
            Playing again can only improve it.
          </p>
        </section>

        <section className="panel">
          <h2>Nursery: A to Z</h2>
          <p>
            The front page of the app. A card for every letter. Each letter page shows the capital and small letter, how to
            write them (animated, with the stroke order), tracing, the sound, and words that start with it.
          </p>
          <ol className="plan-list">
            {alphabet.map((a) => (
              <li key={a.letter} className="plan-item">
                <button type="button" className="plan-name" onClick={() => go(`/alphabet/${a.letter}`)} aria-label={`Open ${a.letter.toUpperCase()}`}>
                  {a.letter.toUpperCase()}
                  {a.letter}
                </button>
                <span className="plan-detail">{a.words.join(', ')}</span>
              </li>
            ))}
          </ol>
        </section>

        {stages.map((stage, si) => (
          <section className="panel" key={stage.title}>
            <h2>
              Stage {si + 1}: {stage.title}
            </h2>
            <p>{stage.goal}</p>
            <ol className="plan-list" start={n + 1}>
              {stage.ids.map((id) => {
                n++
                const d = describe(id)
                return (
                  <li key={id} className="plan-item">
                    <button type="button" className="plan-name" onClick={() => go(`/lesson/${id}`)} aria-label={`Open ${d.name}`}>
                      {d.name}
                    </button>
                    <span className="plan-detail">{d.detail}</span>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </main>
    </div>
  )
}
