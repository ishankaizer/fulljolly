import { useEffect, useState, type ReactNode } from 'react'
import { go } from '../lib/router'
import { currentProfile, getProfiles, loadProgress, switchProfile } from '../lib/settings'
import { PinPad } from './PinPad'
import { Pic } from './Pic'
import { Icon } from './ui'
import { clearReturnTo, isTeacher } from '../lib/teacher'

export type Tab = 'abc' | 'sounds' | 'words' | 'games' | 'books'

const tabs: { id: Tab; label: string; icon: ReactNode; path: string; color: string }[] = [
  { id: 'abc', label: 'A to Z', icon: Icon.tabAbc, path: '/', color: '#ff6b5e' },
  { id: 'sounds', label: 'Sounds', icon: Icon.tabSounds, path: '/sounds', color: '#17b3a3' },
  { id: 'words', label: 'Words', icon: Icon.tabWords, path: '/words', color: '#7c5cff' },
  { id: 'games', label: 'Games', icon: Icon.tabGames, path: '/games', color: '#f29a12' },
  { id: 'books', label: 'Books', icon: Icon.tabBooks, path: '/books', color: '#2e8bff' },
]

/** Top bar (title, who is playing, grown-ups door) and the bottom tab bar shared by the main screens. */
export function TabShell({ tab, title, children }: { tab: Tab; title: string; children: ReactNode }) {
  const [rev, setRev] = useState(0)
  useEffect(() => clearReturnTo(), [])
  const [picking, setPicking] = useState(false)
  const [gate, setGate] = useState(false)
  const profiles = getProfiles()
  const me = currentProfile()
  const stars = Object.values(loadProgress()).reduce((a, b) => a + b, 0)

  return (
    <div className="screen tab-screen">
      <header className="home-top">
        <div className="brand">
          <img className="brand-school" src="/brand/school.png" alt="Yellow House Foundation School" />
          <img className="brand-circle" src="/brand/learning-circle.png" alt="" />
          <h1 className="visually-hidden">Learning Circle: {title}</h1>
        </div>
        <div className="home-top-right">
          <span className="star-count" aria-label={`${stars} stars`}>
            {Icon.star}
            {stars}
          </span>
          <button
            type="button"
            className="avatar-btn"
            onClick={() => profiles.length > 1 && setPicking(true)}
            aria-label={`Playing as ${me.name}`}
          >
            <Pic e={me.avatar} size={34} />
          </button>
          <button
            type="button"
            className="grown-ups-door"
            onClick={() => (isTeacher() ? go('/teacher') : setGate(true))}
            aria-label="Teacher"
          >
            {Icon.lock}
          </button>
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
            style={{ ['--accent' as string]: t.color }}
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
                  <span className="picker-avatar">
                    <Pic e={p.avatar} size={64} />
                  </span>
                  <span className="picker-name">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {gate && <PinPad onPass={() => { setGate(false); go('/teacher') }} onCancel={() => setGate(false)} />}
    </div>
  )
}
