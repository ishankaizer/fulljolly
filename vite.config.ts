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
      includeAssets: ['icon.svg'],
      workbox: {
        // The voice library's server functions must always reach the server.
        navigateFallbackDenylist: [/^\/api\//],
        // Cache the app shell, fonts and every recorded sound so lessons work offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,m4a,ogg,wav}'],
      },
      manifest: {
        name: 'Word Nest',
        short_name: 'Word Nest',
        description: 'Phonics games for reading three-letter words.',
        theme_color: '#4cb5f5',
        background_color: '#bfe8ff',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
