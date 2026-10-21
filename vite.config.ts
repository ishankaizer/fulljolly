import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
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
