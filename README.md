# Word Nest

Phonics games that teach young children to read three-letter words (cat, cot, cut), built around
how Mama teaches: one vowel at a time, one word family at a time (‑at: bat, cat, hat… ‑am: ham, jam, ram…).
Pip the bird guides every lesson.

## The course

The whole course is data (`src/data/course.ts`) in eight stages, from letter sounds to sentences. The written plan is in
[`docs/LESSON_PLAN.md`](docs/LESSON_PLAN.md) and is also shown inside the app (grown-ups page, then "Open the lesson plan").

1. **Letter sounds:** 24 lessons in four groups, covering all 26 letters.
2. **Three-letter words:** the vowel word families (-at, -am, ...).
3. **First sentences:** tricky words (I, the, a, is, to, has) and "The cat sat on a mat."
4. **Two letters, one sound:** sh, ch, th, ng, qu.
5. **Four-letter words:** two consonants side by side (clap, frog, hand, lamp).
6. **Two vowels back to back:** ai, ee, oa, oo, ar, or, er, ow, oi, ou, ay, ea, igh.
7. **Longer sentences:** "He is a boy." and "I like to play in the rain."
8. **Practice:** swap the middle sound (cat, cot, cut).

Five tabs: **Sounds**, **Words**, **Sentences**, **Games** (eight practice games) and **Books** (picture readers).

`npm run check:course` proves every word only uses sounds taught before it, every sentence only uses words the child
has met, and no two words share a picture. Run it after changing the course. `npm run plan` rewrites the written plan.

## How a word-family lesson works

Each word family is one lesson:

1. **Meet the family:** see and hear the shared ending, e.g. "‑at".
2. **Blend:** for every word in the family, the child slides a ball under the letters. Each sound plays as the
   ball passes it, then the sounds join into the word and its picture pops up. Tapping the ball slides it
   automatically for children who find dragging hard. Lots of repetition on purpose: that's how blending sticks.
3. **Build:** hear a word and pick its first letter: _ a t → c a t.
4. **Read and match:** read the word (tap any letter to hear its sound) and tap the matching picture.
5. **Stars:** 1–3 stars depending on how many tries it took, saved on the device.

There is also a **Swap the middle sound** challenge (c _ t → cat, cot, cut) on the map.

Wrong answers never buzz. The child hears what they picked, then hears the word again.

## Changing the words

All lesson content is in [`src/data/curriculum.ts`](src/data/curriculum.ts). Add or remove words, add families,
or change pictures there. Families marked `fromMama: true` are exactly Mama's lists. The others are drafts for her to check.

## Voices and recordings

Until recordings exist, the device's built-in voice speaks everything. It says whole words well but can't
make pure letter sounds ("sss", not "ess"), so **recording the letter sounds is the most important next step**.
Put audio files in [`src/audio/`](src/audio/README.md) (for example `sounds/s.mp3` or `words/cat.mp3`) and they
replace the built-in voice automatically. The grown-ups page lists what's still missing.

**Grown-ups page:** press and hold the gear for 2 seconds, then answer the sum. From there you can pick the voice, change the
speed, turn sound effects on or off, see the recordings checklist and clear stars.

## Running it

```sh
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
```

It's a static site: React + Vite + TypeScript, Framer Motion for animation, and Howler for audio. It installs to
a tablet's home screen and works offline (PWA). Vercel detects Vite automatically: import the repo and deploy.

Pictures are emoji for now and will be replaced with our own illustrations.
