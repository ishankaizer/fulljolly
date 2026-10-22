import { blobStore } from './_blobStore.js'
import { publish, unpublish } from './_voice.js'

const fail = () => new Response(JSON.stringify({ error: 'storage' }), { status: 503, headers: { 'content-type': 'application/json' } })

/** Publish one recording. Needs the passcode in the x-passcode header. */
export async function POST(request: Request): Promise<Response> {
  try {
    return await publish(request, blobStore, process.env.PUBLISH_PASSCODE)
  } catch {
    return fail()
  }
}

/** Take one recording out of the library. Needs the passcode. */
export async function DELETE(request: Request): Promise<Response> {
  try {
    return await unpublish(request, blobStore, process.env.PUBLISH_PASSCODE)
  } catch {
    return fail()
  }
}
