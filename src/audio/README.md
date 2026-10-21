# Recordings

Drop audio files in these folders. Any sound or word that has a file plays the recording;
anything without one is spoken by the device's built-in voice.

| Folder | File name | Example |
|---|---|---|
| `sounds/` | the letter | `s.mp3` is the pure sound "sss", `a.mp3` is "a" as in apple |
| `rimes/` | the word ending | `at.mp3`, `am.mp3` |
| `words/` | the word | `cat.mp3`, `apple.mp3` |
| `prompts/` | the instruction id | `blend-intro.mp3`, `well-done.mp3` (ids are in the code next to each `prompt(...)`) |

`.mp3`, `.m4a`, `.wav` and `.ogg` all work. Keep each clip short with no silence at the start or end.
The grown-ups page in the app lists which recordings are still missing.

## Recording in the app

The easiest way to fill this folder is the recording studio: Grown-ups page, then "Open the recording studio".
Recordings made there work immediately on that tablet. To ship them to every device:

1. In the studio, tap **Save a backup**.
2. Run `node scripts/unpack-recordings.mjs word-nest-recordings.json`. This writes the files into the folders above.
3. Commit and deploy.
