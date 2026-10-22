# Word Nest: working rules

Word Nest is a phonics app for young children, built for the owner's mother to teach with. Deployed on Vercel from
`main` (https://fulljolly.vercel.app).

## Always push after every change

**After every change, commit and push to `main`, without waiting to be asked.** The owner checks the live site as the
work happens, and Vercel only redeploys on a push. Before ending a turn, confirm nothing is left uncommitted or
unpushed (`git status`, and compare `git log origin/main..HEAD`), and tell the owner plainly whether it is pushed.

Before pushing, run the checks that apply:

- `npx tsc --noEmit` and `npm run build` always.
- `npm run check:course` after touching anything in `src/data/` (words, lessons, sentences, pictures). It must pass.
- `npm run plan` after changing the course, and commit the regenerated `docs/LESSON_PLAN.md`.
- `npm run test:api` after touching `api/` or `src/lib/recordings.ts` / `publish.ts`.

Commit messages describe the change in plain words, with the attribution lines the session asks for.

## Things that have gone wrong before

- **Never ship something that could blank the pictures.** A bundled colour emoji font drew empty boxes and cannot be
  drawn by iOS Safari. Pictures use the device's own emoji, or drawn SVGs in `src/components/art.tsx`.
- **Emoji must be Emoji 13 or older** (older tablets cannot show newer ones), and **no two words may share a picture**.
  `check:course` enforces both.
- **A new version only shows after the old cached copy is replaced.** The app is a PWA; it now checks for updates on
  launch and every hour. If the owner says it "looks the same", check Vercel's deployment first, then the cache.

## How it is built

- React + Vite + TypeScript, static site, no server. Framer Motion for animation, Howler for audio.
- The front page is the Nursery alphabet (`src/screens/AlphabetHome.tsx`, `AlphabetPage.tsx`): word lists in
  `src/data/alphabet.ts`, handwriting strokes for all 52 letters in `src/data/glyphs.ts`. The tab bar is A to Z,
  Sounds, Words (families, blends, tricky words, sentences), Games, Books.
- The whole course is data in `src/data/course.ts` (stages, groups, lessons, sentences) with words in
  `src/data/vocab.ts` and `src/data/curriculum.ts`. Lessons are assembled from activities in `src/activities/` by
  `src/screens/Lesson.tsx`. A word is a list of sounds ("parts"), so `ship` is `sh-i-p`.
- Every word may only use sounds taught earlier on the pathway. Keep it that way when adding content.
- Audio: a recording made in the app beats a bundled file in `src/audio/`, which beats the device voice
  (`src/lib/audio.ts`). Recordings are kept in IndexedDB (`src/lib/recordings.ts`).
- **The shared voice library.** Recordings made on one tablet are published (one button, passcode-protected) to
  Vercel Blob storage via the serverless functions in `api/` (rules in `api/_voice.ts`, storage in
  `api/_blobStore.ts`), and every tablet downloads them on launch (`src/lib/publish.ts`). Own recording beats
  shared beats bundled file beats device voice. Setup steps for the owner are in `docs/PUBLISHING.md`; the owner must
  connect a Blob store and set `PUBLISH_PASSCODE` in Vercel before sharing works. `npm run dev:api` runs the same
  functions locally with files in `.voice-dev/`. Relative imports in `api/` need a `.js` extension.
- Progress and settings are saved on the device, one set of stars per child (`src/lib/settings.ts`).

## Testing

Play lessons through in a real browser (Playwright is installed globally) on a tablet (1024x768), a phone (390x844),
a small phone (360x640) and a phone on its side (844x390). Screens must fit without scrolling, and the Next button
must stay reachable. Look at screenshots, not just exit codes.

## Mama's brief (the teacher, from WhatsApp, 21 Oct)

She wants a **library** organised by syllabus, where every page has its **own link** so the class WhatsApp group can be
sent "class work" to follow.

1. **Nursery:** pages for the alphabet, Aa to Zz. The "Aa" page shows capital A and small a, the sound, tracing, and some
   words starting with the short sound of a. And so on for every letter.
2. **Then the vowels and three-letter words:** the same pattern (sound, tracing), then short lines like stories:
   "The cat sat on a mat."
3. **After all the vowels:** stories made of three-letter words: "My dog is fat. She sat on my hat. My hat is flat."
4. **Then the UKG syllabus** (topics not sent yet).
5. **Test papers** she already has, to go into the library.
6. The owner adds: record **voice recordings for every word, for consistency** (one voice throughout).

## Still to do (as agreed with the owner)

- Record the sounds (the guided sound library and one-button sharing are built; waiting for the owner to finish the
  Vercel setup in `docs/PUBLISHING.md`, then the owner's mother records on her tablet).
- "Record while you play a lesson" mode, so recordings are made in context with the lesson on screen.
- Songs (must be original), rewards and stickers, a progress view of which words each child finds hard, our own
  illustrations in place of emoji, PNG app icons, syncing between devices.
