import { blobStore } from './_blobStore.js'
import { listClips } from './_voice.js'

/** Every published recording. Public: the voice is not a secret, and every tablet needs it. */
export async function GET(): Promise<Response> {
  try {
    return await listClips(blobStore)
  } catch {
    return new Response(JSON.stringify({ error: 'storage' }), { status: 503, headers: { 'content-type': 'application/json' } })
  }
}
