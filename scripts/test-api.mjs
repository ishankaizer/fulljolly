// Tests the voice library's server rules with an in-memory store.   npm run test:api
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const out = join(mkdtempSync(join(tmpdir(), 'api-')), 'voice.mjs')
await build({ entryPoints: ['api/_voice.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' })
const V = await import(pathToFileURL(out).href)

let clock = 0
const files = new Map()
const store = {
  async put(path, body) { files.set(path, { size: body.byteLength, at: new Date(Date.UTC(2026, 9, 22, 12, 0, ++clock)).toISOString() }) },
  async list(prefix) { return [...files].filter(([p]) => p.startsWith(prefix)).map(([pathname, f]) => ({ pathname, url: `https://blob.test/${pathname}`, size: f.size, uploadedAt: f.at })) },
  async remove(path) { files.delete(path) },
}

const wav = (n = 200) => { const b = new Uint8Array(44 + n); b.set([82, 73, 70, 70], 0); b.set([87, 65, 86, 69], 8); return b }
const req = (method, query, { pass, body } = {}) =>
  new Request(`https://x.test/api/publish?${query}`, { method, headers: pass ? { 'x-passcode': pass } : {}, body })
const status = async (p) => (await p).status
const PASS = 'letmein-123'
let n = 0
const ok = (name) => console.log(`  ok  ${++n}. ${name}`)

assert.deepEqual(await (await V.listClips(store)).json(), { clips: {} }); ok('an empty library lists nothing')

assert.equal(await status(V.publish(req('POST', 'key=sounds/sh', { pass: PASS, body: wav() }), store, undefined)), 503); ok('publishing is refused until a passcode is set up')
assert.equal(await status(V.publish(req('POST', 'key=sounds/sh', { body: wav() }), store, PASS)), 401); ok('no passcode is refused')
assert.equal(await status(V.publish(req('POST', 'key=sounds/sh', { pass: 'nope', body: wav() }), store, PASS)), 401); ok('the wrong passcode is refused')
assert.equal(await status(V.publish(req('POST', 'check=1', { pass: PASS }), store, PASS)), 200); ok('the right passcode is accepted by a check')
assert.equal(files.size, 0); ok('a check stores nothing')

for (const key of ['../secret', 'sounds/', 'songs/x', 'sounds/a/b', 'sounds/a b', '', 'sounds/' + 'x'.repeat(61)])
  assert.equal(await status(V.publish(req('POST', `key=${encodeURIComponent(key)}`, { pass: PASS, body: wav() }), store, PASS)), 400, key)
ok('keys that could escape the library are refused')

assert.equal(await status(V.publish(req('POST', 'key=sounds/sh', { pass: PASS, body: new Uint8Array(3 * 1024 * 1024 + 1) }), store, PASS)), 413); ok('a recording over 3 MB is refused')
assert.equal(await status(V.publish(req('POST', 'key=sounds/sh', { pass: PASS, body: new TextEncoder().encode('<script>alert(1)</script>'.repeat(5)) }), store, PASS)), 415); ok('something that is not a WAV is refused')
assert.equal(files.size, 0); ok('nothing refused was stored')

assert.equal(await status(V.publish(req('POST', 'key=sounds/sh', { pass: PASS, body: wav() }), store, PASS)), 200)
assert.equal(await status(V.publish(req('POST', 'key=words/yo-yo', { pass: PASS, body: wav() }), store, PASS)), 200)
assert.equal(await status(V.publish(req('POST', 'key=prompts/well-done', { pass: PASS, body: wav() }), store, PASS)), 200)
assert.ok(files.has('voice/sounds/sh.wav') && files.has('voice/words/yo-yo.wav')); ok('good recordings are stored under voice/')

const list1 = await (await V.listClips(store)).json()
assert.deepEqual(Object.keys(list1.clips).sort(), ['prompts/well-done', 'sounds/sh', 'words/yo-yo']); ok('the list names every key, without the folder or .wav')
assert.equal(list1.clips['sounds/sh'].url, 'https://blob.test/voice/sounds/sh.wav'); ok('each entry says where to download it')

await V.publish(req('POST', 'key=sounds/sh', { pass: PASS, body: wav(300) }), store, PASS)
const list2 = await (await V.listClips(store)).json()
assert.notEqual(list2.clips['sounds/sh'].uploadedAt, list1.clips['sounds/sh'].uploadedAt)
assert.equal(list2.clips['sounds/sh'].size, 344); ok('re-publishing replaces the recording and changes its timestamp')

files.set('voice/stray.txt', { size: 1, at: 'x' }); files.set('voice/songs/x.wav', { size: 1, at: 'x' })
assert.deepEqual(Object.keys((await (await V.listClips(store)).json()).clips).sort(), ['prompts/well-done', 'sounds/sh', 'words/yo-yo']); ok('stray files are never listed')

assert.equal(await status(V.unpublish(req('DELETE', 'key=sounds/sh'), store, PASS)), 401); ok('removing needs the passcode')
assert.equal(await status(V.unpublish(req('DELETE', 'key=sounds/sh', { pass: PASS }), store, PASS)), 200)
assert.ok(!files.has('voice/sounds/sh.wav')); ok('a recording can be taken out of the library')

const realFetch = globalThis.fetch
globalThis.fetch = async (url) => new Response(wav(10), { status: url.includes('missing') ? 500 : 200 })
await V.publish(req('POST', 'key=sounds/zz', { pass: PASS, body: wav() }), store, PASS)
const clipRes = await V.fetchClip(new Request('https://x.test/api/clip?key=sounds/zz'), store)
assert.equal(clipRes.status, 200); assert.equal(clipRes.headers.get('content-type'), 'audio/wav'); assert.equal((await clipRes.arrayBuffer()).byteLength, 54); ok('a recording can be handed over through our own server')
assert.equal((await V.fetchClip(new Request('https://x.test/api/clip?key=sounds/nothing'), store)).status, 404); ok('asking for a recording that is not there says so')
assert.equal((await V.fetchClip(new Request('https://x.test/api/clip?key=../x'), store)).status, 400); ok('that route refuses odd keys too')
globalThis.fetch = realFetch

assert.ok(V.passcodeOk('a', 'a') && !V.passcodeOk('a', 'ab') && !V.passcodeOk(null, 'a') && !V.passcodeOk('a', undefined)); ok('passcodes of different lengths compare safely')
console.log(`\nAll ${n} checks passed.`)
