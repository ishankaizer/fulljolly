import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { Howler } from 'howler'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import './styles.css'
import { App } from './App'
import { loadRecordings } from './lib/recordings'
import { syncPublished } from './lib/publish'

// Phones and tablets keep sound off until the first touch. Wake both the audio
// player and the built-in voice on that first touch so later lessons can talk.
window.addEventListener(
  'pointerdown',
  () => {
    Howler.ctx?.resume?.()
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      window.speechSynthesis.speak(u)
    }
  },
  { once: true },
)

// Pick up a new version as soon as one is deployed: check on launch, whenever the app comes back
// to the front, and hourly. With autoUpdate the page reloads itself once the new version is ready.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    const check = () => void registration.update().catch(() => undefined)
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check())
    window.setInterval(check, 60 * 60 * 1000)
  },
})

// Bring this tablet's voice up to date with the shared library: on launch, and when the app comes back to the
// front after a while. Quietly does nothing offline.
let lastSync = Date.now()
void loadRecordings().then(() => syncPublished())
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastSync > 10 * 60 * 1000) {
    lastSync = Date.now()
    void syncPublished()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
