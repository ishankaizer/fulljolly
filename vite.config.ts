import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// While developing, the voice library's server functions run from scripts/dev-api.mjs (npm run dev:api).
const api = { '/api': 'http://localhost:4180' }

export default defineConfig({
  server: { proxy: api },
  preview: { proxy: api },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered by hand in main.tsx so it can check for updates
      includeAssets: ['icon.svg', 'brand/*.png'],
      workbox: {
        // The voice library's server functions must always reach the server.
        navigateFallbackDenylist: [/^\/api\//],
        // Cache the app shell, fonts and every recorded sound so lessons work offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,m4a,ogg,wav}'],
      },
      manifest: {
        name: 'Learning Circle',
        short_name: 'Learning Circle',
        description: 'Phonics lessons from Yellow House Foundation School.',
        theme_color: '#fff8ea',
        background_color: '#fff8ea',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          { src: 'brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
