// Runs the voice library's server functions on your own computer, for development and tests:   npm run dev:api
// Recordings are kept in the .voice-dev folder instead of cloud storage. The passcode is "test-passcode"
// unless PUBLISH_PASSCODE says otherwise. Set BLOCK_BLOB_CORS=1 to check that downloads still work when the
// browser cannot reach storage directly.
import { build } from 'esbuild'
import { createServer } from 'node:http'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const out = join(mkdtempSync(join(tmpdir(), 'dev-api-')), 'voice.mjs')
await build({ entryPoints: ['api/_voice.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' })
const V = await import(pathToFileURL(out).href)

const PORT = Number(process.env.PORT ?? 4180)
const ROOT = '.voice-dev'
const PASS = process.env.PUBLISH_PASSCODE ?? 'test-passcode'
if (process.env.RESET) rmSync(ROOT, { recursive: true, force: true })
mkdirSync(ROOT, { recursive: true })

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
const store = {
  async put(pathname, body) { const f = join(ROOT, pathname); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, Buffer.from(body)) },
  async list(prefix) {
    return walk(ROOT).map((f) => f.slice(ROOT.length + 1)).filter((p) => p.startsWith(prefix))
      .map((pathname) => { const s = statSync(join(ROOT, pathname)); return { pathname, url: `http://localhost:${PORT}/blob/${pathname}`, size: s.size, uploadedAt: s.mtime.toISOString() } })
  },
  async remove(pathname) { rmSync(join(ROOT, pathname), { force: true }) },
}

const server = createServer(async (nodeReq, nodeRes) => {
  try {
    const url = new URL(nodeReq.url, `http://localhost:${PORT}`)
    const chunks = []
    for await (const c of nodeReq) chunks.push(c)
    const body = Buffer.concat(chunks)
    const request = new Request(url, { method: nodeReq.method, headers: nodeReq.headers, body: ['GET', 'HEAD'].includes(nodeReq.method) ? undefined : body })
    let res
    if (url.pathname === '/api/voice' && nodeReq.method === 'GET') res = await V.listClips(store)
    else if (url.pathname === '/api/clip' && nodeReq.method === 'GET') res = await V.fetchClip(request, store)
    else if (url.pathname === '/api/publish' && nodeReq.method === 'POST') res = await V.publish(request, store, PASS)
    else if (url.pathname === '/api/publish' && nodeReq.method === 'DELETE') res = await V.unpublish(request, store, PASS)
    else if (url.pathname.startsWith('/blob/')) {
      const f = join(ROOT, decodeURIComponent(url.pathname.slice(6)))
      const headers = { 'content-type': 'audio/wav' }
      if (!process.env.BLOCK_BLOB_CORS) headers['access-control-allow-origin'] = '*'
      res = new Response(readFileSync(f), { headers })
    } else res = new Response('not found', { status: 404 })
    nodeRes.writeHead(res.status, Object.fromEntries(res.headers))
    nodeRes.end(Buffer.from(await res.arrayBuffer()))
  } catch (e) {
    nodeRes.writeHead(500)
    nodeRes.end(String(e))
  }
})
server.listen(PORT, () => console.log(`Voice library (development) on http://localhost:${PORT}, passcode "${PASS}", files in ${ROOT}/`))
