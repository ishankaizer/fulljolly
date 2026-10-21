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

void loadRecordings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
