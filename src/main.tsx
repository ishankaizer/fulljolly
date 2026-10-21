import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { Howler } from 'howler'
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import './emoji.css'
import './styles.css'
import { App } from './App'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
