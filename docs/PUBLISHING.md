# Sharing recordings with every tablet

Recordings made in the **Sound library** (grown-ups page → "Open the recording studio") are kept on the tablet they
were made on. **Share** uploads them to the app's voice library, and every tablet downloads them automatically the
next time it opens the app online. Re-recording a sound and sharing again replaces it everywhere.

## One-time setup (about five minutes, in your Vercel dashboard)

1. Open the **fulljolly** project on vercel.com and go to the **Storage** tab.
2. **Create** a **Blob** store (any name, for example `voice`) and **connect it to the project** for all environments.
   Vercel adds a `BLOB_READ_WRITE_TOKEN` setting by itself.
3. Go to **Settings → Environment Variables** and add one called **`PUBLISH_PASSCODE`**. Its value is the passcode
   your mother will type when she shares. Pick something she can remember (at least 8 characters).
4. Go to **Deployments**, open the **⋯** menu on the latest one and choose **Redeploy**. (Settings only apply to a new
   deployment.)

Check it worked: open `https://fulljolly.vercel.app/api/voice`. You should see `{"clips":{}}`.
If you see an error page instead, the storage is not connected yet (step 2).

## Sharing

On the tablet where the recording was made: Sound library → **Share with every tablet** → type the passcode once
(the tablet remembers it) → **Share**. The button shows how many recordings are waiting.

Other tablets pick the new voice up on their own when the app opens (and every ten minutes while it is open). The
**Get the latest voice** button does it straight away.

## What is stored, and where

- Each recording is a small WAV file, about 100 KB, kept in the Blob store under `voice/sounds/…`, `voice/words/…`,
  `voice/rimes/…`, `voice/prompts/…`. A few hundred recordings come to tens of megabytes.
- Anyone can **listen** (the app has to be able to download them). Only someone with the passcode can **add or
  replace** one.
- A recording made on a tablet beats the shared one on that tablet; the shared one beats the built-in robot voice.

## If something goes wrong

| What the tablet says | What it means |
|---|---|
| "Sharing is not set up yet" | Steps 2 to 4 above are not finished |
| "That passcode isn't right" | The passcode differs from `PUBLISH_PASSCODE` |
| "Can't reach the voice library" | No internet, or the deployment is not live yet |

For developers: `npm run dev:api` runs the same server rules on your computer (passcode `test-passcode`, files in
`.voice-dev/`), and `npm run test:api` checks them. The old route still works: **Save a backup** in the studio, then
`node scripts/unpack-recordings.mjs word-nest-recordings.json` bundles recordings into the app itself.
