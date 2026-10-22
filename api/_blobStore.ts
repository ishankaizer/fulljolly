import { del, list, put } from '@vercel/blob'
import type { BlobInfo, VoiceStore } from './_voice.js'

/** The voice library, kept in Vercel Blob storage. The access token is supplied by Vercel. */
export const blobStore: VoiceStore = {
  async put(pathname, body) {
    await put(pathname, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'audio/wav',
      // Short, so a re-recorded sound reaches every tablet quickly.
      cacheControlMaxAge: 60,
    })
  },
  async list(prefix) {
    const out: BlobInfo[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix, cursor, limit: 1000 })
      for (const b of page.blobs) out.push({ pathname: b.pathname, url: b.url, size: b.size, uploadedAt: new Date(b.uploadedAt).toISOString() })
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    return out
  },
  async remove(pathname) {
    await del(pathname)
  },
}
