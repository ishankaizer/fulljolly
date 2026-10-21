# Word Nest

Phonics games that teach young children to read three-letter words (cat, cot, cut), built around
how Mama teaches: one vowel at a time, one word family at a time (‑at: bat, cat, hat… ‑am: ham, jam, ram…).
Pip the bird guides every lesson.

## The four tabs

- **Letters:** 18 letter lessons in three groups (s a t i p n / ck e h r m d / g o u l f b). Each one: hear the sound,
  finger-trace the letter, pick the letter that makes a sound, then a Blending card (touch the dot under each letter
  to hear its sound, and the word blends and its picture appears). Words only use letters already taught.
- **Words:** the vowel word families (-at, -am, ...) described below.
- **Games:** swap the middle sound, match the picture, build the word, slide and blend, which letter.
- **Books:** short picture readers made only of words the child can sound out, plus a few tricky words.

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
