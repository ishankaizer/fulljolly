import { useEffect, useRef, useState, type ReactNode } from 'react'
import { go } from '../lib/router'
import { currentProfile, getProfiles, switchProfile } from '../lib/settings'
import { ParentGate } from './ParentGate'

export type Tab = 'letters' | 'words' | 'games' | 'books'

const tabs: { id: Tab; label: string; icon: string; path: string }[] = [
  { id: 'letters', label: 'Letters', icon: '🔤', path: '/' },
  { id: 'words', label: 'Words', icon: '🐱', path: '/words' },
  { id: 'games', label: 'Games', icon: '🎮', path: '/games' },
  { id: 'books', label: 'Books', icon: '📚', path: '/books' },
]

/** Top bar (title, who is playing, grown-ups door) and the bottom tab bar shared by the main screens. */
export function TabShell({ tab, title, children }: { tab: Tab; title: string; children: ReactNode }) {
  const [rev, setRev] = useState(0)
  const [picking, setPicking] = useState(false)
  const [gate, setGate] = useState(false)
  const profiles = getProfiles()
  const me = currentProfile()

  return (
    <div className="screen tab-screen">
      <header className="home-top">
        <h1 className="home-title">{title}</h1>
        <div className="home-top-right">
          <button
            type="button"
            className="avatar-btn"
            onClick={() => profiles.length > 1 && setPicking(true)}
            aria-label={`Playing as ${me.name}`}
          >
            {me.avatar}
          </button>
          <GrownUpsDoor onOpen={() => setGate(true)} />
        </div>
      </header>

      {/* Remount the page when the child changes so every star count is re-read. */}
      <div key={rev} className="tab-body">
        {children}
      </div>

      <nav className="tab-bar" aria-label="Main">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${t.id === tab ? 'tab-active' : ''}`}
            onClick={() => go(t.path)}
            aria-label={t.label}
            aria-current={t.id === tab ? 'page' : undefined}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {picking && (
        <div className="gate-backdrop" role="dialog" aria-label="Who is playing?" onClick={() => setPicking(false)}>
          <div className="gate" onClick={(e) => e.stopPropagation()}>
            <div className="picker">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`picker-item ${p.id === me.id ? 'picker-current' : ''}`}
                  onClick={() => {
                    switchProfile(p.id)
                    setPicking(false)
                    setRev((n) => n + 1)
                  }}
                  aria-label={p.name}
                >
                  <span className="picker-avatar">{p.avatar}</span>
                  <span className="picker-name">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {gate && <ParentGate onPass={() => go('/grown-ups')} onCancel={() => setGate(false)} />}
    </div>
  )
}

/** Press and hold for 2 seconds to open the grown-ups gate, so little fingers don't wander in. */
function GrownUpsDoor({ onOpen }: { onOpen: () => void }) {
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const start = () => {
    timer.current = window.setTimeout(onOpen, 2000)
  }
  const cancel = () => window.clearTimeout(timer.current)
  return (
    <button
      type="button"
      className="grown-ups-door"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Grown-ups: press and hold"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
      </svg>
    </button>
  )
}
