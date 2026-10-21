// Turns a "Save a backup" file from the recording studio into audio files inside the app,
// so the recordings ship to every device instead of living on one tablet.
//
//   node scripts/unpack-recordings.mjs path/to/word-nest-recordings.json
//
// Writes src/audio/sounds/a.wav, src/audio/words/cat.wav, ... then commit and deploy as usual.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/unpack-recordings.mjs <backup.json>')
  process.exit(1)
}

const backup = JSON.parse(readFileSync(file, 'utf8'))
if (backup.app !== 'word-nest' || !Array.isArray(backup.clips)) {
  console.error('That is not a Word Nest backup file.')
  process.exit(1)
}

const audioDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'audio')
let written = 0
for (const clip of backup.clips) {
  if (!/^(sounds|rimes|words|prompts)\/[\w-]+$/.test(clip.key)) continue
  const target = join(audioDir, `${clip.key}.wav`)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, Buffer.from(clip.data, 'base64'))
  written++
}
console.log(`Wrote ${written} recordings into src/audio/`)
