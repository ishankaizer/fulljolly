// Loads the course data (TypeScript) so scripts can read it without a build step.
import { build } from 'esbuild'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadCourse() {
  const out = join(mkdtempSync(join(tmpdir(), 'course-')), 'course.mjs')
  await build({
    stdin: {
      contents: `export * from './src/data/course.ts'; export * from './src/data/vocab.ts'; export * from './src/data/graphemes.ts'; export * from './src/data/curriculum.ts'; export * from './src/data/alphabet.ts'`,
      resolveDir: process.cwd(),
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: out,
    logLevel: 'error',
    loader: { '.tsx': 'tsx' },
  })
  return import(pathToFileURL(out).href)
}
