import { units, vowelSwaps, type Word } from './curriculum'
import type { ArtId } from '../components/art'

// Every word in the course. The three-letter words live in curriculum.ts (grouped by word family);
// everything else is here. Each row is "<sounds joined by -> <picture>", e.g. "sh-i-p 🚢".
// "art:jug" means a hand-drawn picture. A row with no picture is a plain reading word.

const rows = `
w-e-b 🕸️        b-o-x 📦        f-o-x 🦊        s-i-x 6️⃣        f-i-x 🔧        z-a-p ⚡        y-u-m 😋        qu-i-z ❓
sh-i-p 🚢       sh-o-p 🏪       f-i-sh 🐟       d-i-sh 🍽️       c-a-sh 💵       w-i-sh 🌠
ch-i-p 🍟       ch-o-p 🪓       ch-a-t 💬       ch-i-ck 🐥      ch-e-ck ✅      r-i-ch 🤑
b-a-th 🛁       p-a-th 🛤️       th-i-n-k 💭     m-a-th 🧮
r-i-ng 💍       k-i-ng 🤴       s-o-ng 🎵       b-a-ng 💥       s-i-ng 🎤
r-ai-n 🌧️       m-ai-l 📬       t-r-ai-n 🚂     s-n-ai-l 🐌     p-ai-n-t 🎨     ch-ai-n ⛓️
b-ee 🐝         t-r-ee 🌳       f-ee-t 🦶       sh-ee-p 🐑      g-r-ee-n 🟢     j-ee-p 🚙       th-r-ee 3️⃣     qu-ee-n 👸
b-oa-t ⛵       c-oa-t 🧥       g-oa-t 🐐       r-oa-d 🛣️       s-oa-p 🧼
m-oo-n 🌙       s-p-oo-n 🥄     b-oo-t 🥾       f-oo-d 🍔       t-oo-th 🦷      p-oo-l 🏊
b-oo2-k 📖      l-oo2-k 👀      g-oo2-d 👌      w-oo2-l 🧶      c-oo2-k 👨‍🍳
c-ar 🚗         s-t-ar ⭐       f-ar-m 🚜       c-ar-d 🃏       d-ar-t 🎯       s-c-ar-f 🧣
f-or-k 🍴       c-or-n 🌽       s-t-or-m ⛈️     h-or-n 📯       t-or-ch 🔦      f-or-t 🏰
f-er-n 🌿       sh-ir-t 👕      s-k-ir-t 👗     b-ir-d 🐦       g-ir-l 👧       s-ur-f 🏄       ch-ur-ch ⛪     h-ur-t 🤕
c-ow 🐄         ow-l 🦉         d-ow-n ⬇️       c-l-ow-n 🤡     b-r-ow-n 🟤     c-r-ow-n 👑
c-oi-n 🪙       b-oi-l ♨️       t-oy 🧸         b-oy 👦         j-oy 🥳
c-l-ou-d ☁️     sh-ou-t 📣      c-ou-n-t 🔢     s-ou-n-d 🔊     r-ou-n-d ⚪
p-l-ay 🎮       c-l-ay 🏺       h-ay 🌾         p-ay 💰         c-r-ay-o-n 🖍️
l-ea-f 🍃       t-ea 🍵         s-ea 🌊         m-ea-t 🥩       p-ea-ch 🍑      b-ea-ch 🏖️
l-igh-t 💡      n-igh-t 🌃      f-igh-t 🥊      h-igh ⬆️        p-ie 🥧         t-ie 👔
c-l-a-p 👏      c-l-i-p 📎      c-l-o-ck 🕐     f-l-a-g 🚩      p-l-u-g 🔌
s-l-e-d 🛷      b-l-a-ck ⬛     b-l-u-sh 😊
b-r-i-ck 🧱     b-r-u-sh 🖌️     c-r-a-b 🦀      d-r-u-m 🥁
g-r-i-n 😁      t-r-a-p 🪤      t-r-a-m 🚋      t-r-u-ck 🚚
s-t-o-p 🛑      s-t-e-p 👣      s-p-i-n 🌀
s-k-u-n-k 🦨    s-n-a-ck 🍿     s-w-a-n 🦢
h-a-n-d ✋      t-e-n-t ⛺      b-a-n-k 🏦      w-i-n-d 🌬️
l-a-m-p 🪔      c-a-m-p 🏕️      g-i-f-t 🎁      m-i-l-k 🥛      m-a-s-k 🎭      v-e-s-t 🦺
y-e-ll-ow 🟡    z-e-b-r-a 🦓    f-r-o-g 🐸
`

/** Reading words that have no picture: little words used inside sentences. */
const plain = 'in on at an it up am as us if and but not get got let did had him run sit see chips'

/** Words learned by sight: they cannot be sounded out. */
export const trickyList = 'I the a is to has he she we me be you they my her was are said have like do go'.split(' ')

function parse(row: string): Word {
  const [spec, pic] = row.split(' ')
  const parts = spec.split('-')
  const word: Word = { text: parts.join('').replace(/\d/g, ''), parts }
  if (pic?.startsWith('art:')) word.art = pic.slice(4) as ArtId
  else if (pic) word.pic = pic
  return word
}

const bank: Word[] = rows
  .split(/\s{2,}|\n/)
  .map((r) => r.trim())
  .filter(Boolean)
  .map(parse)
  .concat(
    plain
      .split(' ')
      .map((t): Word => ({ text: t, parts: t === 'see' ? ['s', 'ee'] : t === 'chips' ? ['ch', 'i', 'p', 's'] : t.split('') })),
  )
  .concat(trickyList.map((t): Word => ({ text: t })))

const byText = new Map<string, Word>()
// Three-letter words first, so their pictures and families win over any duplicate.
for (const u of units) for (const f of u.families) for (const w of f.words) byText.set(w.text, w)
for (const s of vowelSwaps) for (const w of s.words) if (!byText.has(w.text)) byText.set(w.text, w)
for (const w of bank) if (!byText.has(w.text)) byText.set(w.text, w)

/** Every word in the course, by its spelling. */
export const wordByText = (text: string): Word | undefined => byText.get(text)
export const allWords: Word[] = [...byText.values()]
