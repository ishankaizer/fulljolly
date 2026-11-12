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
  drawn by iOS Safari. Pictures are now SVG files from one illustration set (see "Design language"); `Pic` falls back
  to the device's emoji if a file fails to load.
- **Emoji must be Emoji 13 or older** (older tablets cannot show newer ones), and **no two words may share a picture**.
  `check:course` enforces both.
- **A new version only shows after the old cached copy is replaced.** The app is a PWA; it now checks for updates on
  launch and every hour. If the owner says it "looks the same", check Vercel's deployment first, then the cache.

## Branding

The site is called **Learning Circle** and belongs to **Yellow House Foundation School** (Mama's school). Logos are in
`public/brand/` (processed from the owner's images: enlarged, sharpened, transparent background): `school.png` (crest),
`learning-circle.png`, `gears.png`, and the PNG app icons. The tab-screen header shows both; every lesson and page
header ends with a small crest (`.lesson-top::after` in `styles.css`); the grown-ups page shows both large. Keep the
crest small, it must never get in the way of a lesson.

## Design language (the owner asked for a full visual overhaul, Nov 2026)

The old sky-and-meadow look was only a skeleton. Keep everything in this one language:

- **Tokens** are at the top of `src/styles.css`: warm paper background, navy ink, and the palette coral / teal / violet
  / blue / orange / green / sun yellow (from the school crest and the Learning Circle gears). Use the variables, not
  new hex colours.
- **Depth is a solid edge, never a blurry shadow**: cards are white with `var(--ring)` and a `0 5px 0` edge; coloured
  blocks use an inset darker bottom edge.
- **Two fonts**: Fredoka (`--ui`) for the interface, Andika (`--read`) for anything a child reads (letters, words,
  sentences), because its letter shapes match handwriting.
- **No emoji characters in the interface.** Interface icons are the stroke icons in `Icon` (`src/components/ui.tsx`).
  Pictures are drawn by `<Pic e="🐱">` (`src/components/Pic.tsx`), which shows `public/pics/<code>.svg` from the
  Fluent Emoji Flat set (MIT). `npm run pictures` (also run by `npm run build`) rewrites `public/pics/` from every
  emoji found in `src/`, and fails if one has no illustration. Words without a good picture get a drawing in
  `src/components/art.tsx`.
- **Pip the mascot** (`src/components/Pip.tsx`) is a yellow bird with the crest's red tuft. Moods: idle, talk, cheer,
  think, proud, cheerUp. Wrong answers are never punished: Pip encourages.
- **The well-done screen** shows stars and "you are getting stronger at these": the words, sounds or sentences that
  took more than one try, each tappable to hear again. They are also saved per child (`recordPractice` in
  `src/lib/settings.ts`) for the teacher's progress view to come.

## Student mode and teacher mode

The app opens in **student mode**: children can play, switch to their own name, and nothing else. **Teacher mode** opens
with a 4-digit PIN (chosen the first time; stored only as a hash, `src/lib/teacher.ts`, `src/components/PinPad.tsx`).
It closes after ten quiet minutes, when the tab is closed, or on Lock. "Forgot your PIN?" asks a two-digit sum.
The teacher desk (`src/screens/Teacher.tsx`, route `/teacher`; `/studio` and `/plan` are also teacher-only) has: Class
(each child's progress by section and the words they needed more tries at), Class work, Sounds and voice, Setup.

**Class-work links** need no server: the list of pages is encoded in the web address, `/#/work/<code>`
(`workLink`/`parseWork` in `src/lib/teacher.ts`). Opening one shows the list with ticks; the back button of a page
opened from it returns to the list (`setReturnTo`). While teacher mode is open a strip across the top
(`src/components/TeacherBar.tsx`) offers Desk, Send page (WhatsApp), Copy link and Lock. Every page already has its own
link, so any page can be sent.

## Bundled sounds

`src/audio/sounds/` holds the 26 letter sounds and `qu` (Open Letter Sounds, CC0) plus `sh` and `ch` (cut from
Wikimedia Commons recordings, CC BY-SA 3.0). Sources, licences and caveats are in `src/audio/CREDITS.md`. They were
machine-checked only; nobody on the project has listened yet. `th`, `ng` and the long vowels still use the device
voice. A recording made in the app always wins.

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
- **Overhaul steps still to do** (owner said "go" on the whole plan): lesson locking (class-work links cover most of
  the need); rebuilt and new games; vowel pages with story lines, connected stories, tests and quizzes; streaks,
  stickers, printable worksheets.
- Replace vague pictures with drawings (sat, vat, beg, fed, fit, wag, zip, men, and similar).
- Bundled recordings for `th`, `ng` and the long vowels, in a voice that matches the letter sounds.
- The owner allowed Figma AI credits (Rapido org file, page "Trash page temp dump") for generated images such as book
  scenes. Not used yet.
- Songs (must be original), syncing between devices.
