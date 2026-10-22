import { blobStore } from './_blobStore.js'
import { fetchClip } from './_voice.js'

/** One published recording, passed through our server. The app tries storage directly first and only comes here if that fails. */
export async function GET(request: Request): Promise<Response> {
  try {
    return await fetchClip(request, blobStore)
  } catch {
    return new Response(JSON.stringify({ error: 'storage' }), { status: 503, headers: { 'content-type': 'application/json' } })
  }
}
