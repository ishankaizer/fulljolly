// Proves the course is consistent. Run with: npm run check:course
//  - every word is spelled by its sounds, and only uses sounds taught earlier on the pathway
//  - every sentence only uses words the child has met by then
//  - no two different words share one picture, and no picture is too new for older tablets
import { loadCourse } from './load-course.mjs'

const C = await loadCourse()

const problems = []
const bad = (m) => problems.push(m)
const spell = (parts) => parts.join('').replace(/\d/g, '')

// 1. words are spelled by their parts
for (const word of C.allWords) {
  if (word.parts && spell(word.parts) !== word.text) bad(`parts of "${word.text}" spell "${spell(word.parts)}"`)
}

// 2. each lesson's words are decodable by that point, and have a picture
for (const id of C.pathway) {
  const found = C.findLesson(id)
  if (!found) continue
  const { lesson } = found
  const known = C.knownThrough(id)
  if (lesson.kind === 'sound' || lesson.kind === 'pattern') {
    const words = C.lessonWords(lesson)
    if (lesson.words && words.length !== lesson.words.length) bad(`${id}: a listed word is missing from the vocabulary`)
    if (!words.length && !['l-s', 'l-a', 'l-i'].includes(id)) bad(`${id}: no words to practise`)
    for (const word of words) {
      if (!word.pic && !word.art) bad(`${id}: "${word.text}" has no picture`)
      for (const part of C.partsOf(word)) {
        if (!known.has(part)) bad(`${id}: "${word.text}" uses "${part}" before it is taught`)
      }
      if (lesson.kind === 'sound' && !C.partsOf(word).some((p) => lesson.graphemes.includes(p)))
        bad(`${id}: "${word.text}" does not use this lesson's sound`)
    }
  }
}

// 3. sentences only use words the child has met
let sentenceCount = 0
for (const id of C.pathway) {
  const found = C.findLesson(id)
  const lesson = found?.lesson
  if (!lesson?.sentences) continue
  const known = C.knownThrough(id)
  const tricky = C.trickyThrough(id)
  for (const s of lesson.sentences) {
    sentenceCount++
    const words = C.sentenceWords(s.text)
    for (const t of words) {
      if (tricky.has(t)) continue
      const word = C.wordByText(t)
      if (!word) bad(`${id}: "${t}" in "${s.text}" is not in the vocabulary`)
      else if (C.trickyList.includes(t)) bad(`${id}: "${t}" in "${s.text}" is a tricky word not yet taught`)
      else for (const part of C.partsOf(word)) if (!known.has(part)) bad(`${id}: "${t}" in "${s.text}" uses "${part}" before it is taught`)
    }
    for (const p of s.pics) {
      const word = C.wordByText(p)
      if (!word || !(word.pic || word.art)) bad(`${id}: picture word "${p}" has no picture`)
      if (!words.includes(p)) bad(`${id}: picture word "${p}" is not in "${s.text}"`)
    }
  }
}

// 4. pictures are distinct, and old enough to show on older tablets
const byPic = new Map()
const lessonWordsAll = [...C.allWords]
for (const g of C.groups) for (const l of g.lessons) if (l.keyword) lessonWordsAll.push(l.keyword)
for (const word of lessonWordsAll) {
  if (!word.pic) continue
  const set = byPic.get(word.pic) ?? new Set()
  set.add(word.text)
  byPic.set(word.pic, set)
  for (const ch of word.pic) {
    const cp = ch.codePointAt(0)
    if ((cp >= 0x1faa9 && cp <= 0x1faaf) || cp >= 0x1fab7 || (cp >= 0x1f6dd && cp <= 0x1f6df)) bad(`"${word.text}" uses ${word.pic}, which older tablets cannot show`)
  }
}
for (const [pic, set] of byPic) if (set.size > 1) bad(`${pic} is the picture for ${[...set].join(' and ')}`)

// 5. pathway holds every lesson exactly once
const seen = new Set()
for (const id of C.pathway) {
  if (seen.has(id)) bad(`${id} appears twice on the pathway`)
  seen.add(id)
}
for (const l of C.allLessons) if (!seen.has(l.id)) bad(`${l.id} is not on the pathway`)

const counts = (k) => C.allLessons.filter((l) => l.kind === k).length
console.log(
  `${C.groups.length} groups · ${counts('sound')} sound lessons · ${counts('pattern')} blend lessons · ${counts('tricky')} tricky-word lessons · ${counts('sentences')} sentence lessons`,
)
console.log(`${C.allWords.length} words in the vocabulary · ${sentenceCount} sentences · ${C.pathway.length} steps on the pathway`)
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`)
  for (const p of problems) console.error(' - ' + p)
  process.exit(1)
}
console.log('Course check passed.')
