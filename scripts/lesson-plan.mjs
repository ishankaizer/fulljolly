// Writes docs/LESSON_PLAN.md from the course data, so the written plan always matches the app.
//   npm run plan
import { mkdirSync, writeFileSync } from 'node:fs'
import { loadCourse } from './load-course.mjs'

const C = await loadCourse()
const lines = []
const out = (s = '') => lines.push(s)

out('# Word Nest lesson plan')
out()
out('Generated from `src/data/course.ts`. Do not edit by hand: change the data and run `npm run plan`.')
out()
out('Children move along the course in order. Every word only uses sounds taught before it (checked by `npm run check:course`),')
out('so a child can always sound it out. Suggested pace: one lesson a day, ten to fifteen minutes, with a Games session')
out('every few lessons to revisit.')
out()
out('## How each kind of lesson runs')
out()
out('| Lesson | What the child does |')
out('|---|---|')
out('| Sound | Hear the sound with a keyword, trace the letters, pick the letter that makes a sound (x3), blend a card of words by touching a dot under each sound, build two words from tiles, match two pictures, find two words by ear |')
out('| Three-letter family | Meet the ending, trace the vowel, slide to blend every word, build the first sound of four words, match four pictures |')
out('| Four-letter words | Hear two letters that keep both their sounds, blend a card of words, build three from tiles, match two pictures, find two words by ear |')
out('| Tricky words | See and hear each word, find it by ear, build short sentences that use it |')
out('| Sentences | Read four sentences, match three to pictures, build all four in order |')
out()

let n = 0
C.stages.forEach((stage, i) => {
  out(`## Stage ${i + 1}: ${stage.title}`)
  out()
  out(`**Goal:** ${stage.goal}`)
  out()
  for (const id of stage.ids) {
    n++
    const fam = C.findFamily?.(id)
    if (fam) {
      out(`${n}. **${fam.unit.vowel} -${fam.family.rime}**: ${fam.family.words.map((w) => w.text).join(', ')}`)
      continue
    }
    if (id === 'swap') {
      out(`${n}. **Swap the middle sound**: cat / cot / cut, hat / hit / hot / hut, pan / pen / pin, bag / big / bug`)
      continue
    }
    const { lesson } = C.findLesson(id)
    if (lesson.kind === 'sentences') {
      out(`${n}. **${lesson.label}**`)
      for (const s of lesson.sentences) out(`    - ${s.text}`)
    } else if (lesson.kind === 'tricky') {
      out(`${n}. **Tricky: ${lesson.words.join(', ')}**. Sentences: ${lesson.sentences.map((s) => s.text).join(' ')}`)
    } else {
      const words = C.lessonWords(lesson).map((w) => w.text)
      const name = lesson.kind === 'sound' ? `/${lesson.label}/${lesson.caption ? ` (${lesson.caption})` : ''}` : lesson.label
      out(`${n}. **${name}**: ${words.length ? words.join(', ') : 'no words yet (too few letters to blend)'}`)
    }
  }
  out()
})

mkdirSync('docs', { recursive: true })
writeFileSync('docs/LESSON_PLAN.md', lines.join('\n') + '\n')
console.log(`Wrote docs/LESSON_PLAN.md (${n} lessons)`)
