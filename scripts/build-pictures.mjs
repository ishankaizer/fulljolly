// Writes one SVG per picture into public/pics/, all from one illustration set (Fluent Emoji Flat, MIT licence),
// so every tablet shows the same picture in the same style whatever emoji the device has.
// Finds every emoji used anywhere in src/. Run after adding a picture: npm run pictures
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const set = require('@iconify-json/fluent-emoji-flat/icons.json')
const names = require('unicode-emoji-json')

/** Names where the illustration set and the Unicode list disagree. */
const alias = {
  elf: 'person-elf',
  'smiling-face-with-open-hands': 'hugging-face',
  'family-man-girl': 'man-feeding-baby',
  'men-holding-hands': 'busts-in-silhouette',
}

export const fileFor = (emoji) =>
  [...emoji]
    .map((c) => c.codePointAt(0).toString(16))
    .filter((h) => h !== 'fe0f')
    .join('-')

const slug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'.:!,()“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : []
  })
}

const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
const used = new Set()
for (const file of walk('src')) {
  for (const { segment } of seg.segment(readFileSync(file, 'utf8'))) {
    if (/\p{Extended_Pictographic}|⃣/u.test(segment)) used.add(segment)
  }
}

const out = 'public/pics'
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
const missing = []
for (const emoji of [...used].sort()) {
  const info = names[emoji] ?? names[emoji + '️'] ?? names[emoji.replace(/️/g, '')]
  const key = info && (alias[slug(info.name)] ?? slug(info.name))
  const icon = key && set.icons[key]
  if (!icon) {
    missing.push(`${emoji} (${info?.name ?? 'unknown'})`)
    continue
  }
  const size = `${icon.width ?? set.width} ${icon.height ?? set.height}`
  writeFileSync(join(out, fileFor(emoji) + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size}">${icon.body}</svg>\n`)
}
writeFileSync(join(out, 'index.json'), JSON.stringify([...used].filter((e) => !missing.some((m) => m.startsWith(e))).map(fileFor).sort()))
console.log(`${used.size - missing.length} pictures written to ${out}`)
if (missing.length) {
  console.error(`No illustration for: ${missing.join(', ')}`)
  process.exit(1)
}
