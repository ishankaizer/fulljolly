import { useEffect, useState } from 'react'
import { groupTitles, recordItems, type ClipGroup } from '../data/recordingList'
import { englishVoices, hasRecordedKey, play, sound, word } from '../lib/audio'
import { go } from '../lib/router'
import {
  addProfile,
  avatars,
  currentProfile,
  getProfiles,
  loadSettings,
  progressFor,
  removeProfile,
  resetProgress,
  saveSettings,
  switchProfile,
  updateProfile,
  type Settings,
} from '../lib/settings'
import { Icon, RoundButton } from '../components/ui'

const groupsInOrder: ClipGroup[] = ['sounds', 'rimes', 'words', 'prompts']

/** Settings for the teacher: voice, speed, sound effects, recordings checklist, progress reset. */
export function GrownUps() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [voices, setVoices] = useState(englishVoices)
  const [, refresh] = useState(0)
  const rerender = () => refresh((n) => n + 1)
  const profiles = getProfiles()
  const [newAvatar, setNewAvatar] = useState(avatars[1])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    // Voices load late on some browsers.
    const t = window.setTimeout(() => setVoices(englishVoices()), 600)
    return () => window.clearTimeout(t)
  }, [])

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  const missing = (g: ClipGroup) => recordItems.filter((i) => i.group === g && !hasRecordedKey(i.key))

  return (
    <div className="screen grown-ups">
      <header className="lesson-top">
        <RoundButton label="Back to the map" onClick={() => go('/')}>
          <span>{Icon.back}</span>
        </RoundButton>
        <h1>For grown-ups</h1>
      </header>

      <main className="panel-stack">
        <section className="panel">
          <h2>Lesson plan</h2>
          <p>The whole course in order: every lesson, the words it uses, and what children do in each.</p>
          <button type="button" className="text-btn big" onClick={() => go('/plan')}>
            Open the lesson plan
          </button>
        </section>

        <section className="panel">
          <h2>Voice</h2>
          <p>
            Sounds and words without a recording are spoken by the device's built-in voice. Pick the one that sounds
            closest to how you teach.
          </p>
          <label className="field">
            <span>Voice</span>
            <select value={settings.voiceURI} onChange={(e) => update({ voiceURI: e.target.value })}>
              <option value="">Automatic (British or Indian English)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Speed</span>
            <input
              type="range"
              min={0.5}
              max={1.1}
              step={0.05}
              value={settings.speechRate}
              onChange={(e) => update({ speechRate: Number(e.target.value) })}
            />
          </label>
          <label className="field field-row">
            <input type="checkbox" checked={settings.effects} onChange={(e) => update({ effects: e.target.checked })} />
            <span>Play sound effects (taps, cheers)</span>
          </label>
          <button
            type="button"
            className="text-btn"
            onClick={() => play(sound('c'), sound('a'), sound('t'), word('cat'))}
          >
            Test: c-a-t, cat
          </button>
        </section>

        <section className="panel">
          <h2>Recordings</h2>
          <p>
            Real recordings always sound better than the built-in voice, especially for letter sounds. Every recording
            added to the app replaces the built-in voice for that sound or word.
          </p>
          <button type="button" className="text-btn big" onClick={() => go('/studio')}>
            Open the recording studio
          </button>
          {groupsInOrder.map((g) => {
            const total = recordItems.filter((i) => i.group === g).length
            const left = missing(g)
            return <Checklist key={g} title={groupTitles[g]} total={total} missing={left.map((i) => (g === 'rimes' ? `-${i.name}` : i.name))} />
          })}
        </section>

        <section className="panel">
          <h2>Children</h2>
          <p>Each child has their own stars. The child playing can be changed from the avatar on the home screen.</p>
          {profiles.map((p) => {
            const stars = Object.values(progressFor(p.id)).reduce((a, b) => a + b, 0)
            return (
              <div key={p.id} className="profile-row">
                <select
                  className="profile-avatar"
                  value={p.avatar}
                  onChange={(e) => {
                    updateProfile(p.id, { avatar: e.target.value })
                    rerender()
                  }}
                  aria-label={`Picture for ${p.name}`}
                >
                  {avatars.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  className="profile-name"
                  value={p.name}
                  onChange={(e) => {
                    updateProfile(p.id, { name: e.target.value })
                    rerender()
                  }}
                  aria-label="Name"
                />
                <span className="profile-stars">⭐ {stars}</span>
                {p.id !== currentProfile().id && (
                  <button type="button" className="text-btn" onClick={() => { switchProfile(p.id); rerender() }}>
                    Play as
                  </button>
                )}
                <button
                  type="button"
                  className="text-btn danger"
                  onClick={() => {
                    if (window.confirm(`Clear all stars for ${p.name}?`)) {
                      resetProgress(p.id)
                      rerender()
                    }
                  }}
                >
                  Clear stars
                </button>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    className="text-btn danger"
                    onClick={() => {
                      if (window.confirm(`Remove ${p.name} and their stars?`)) {
                        removeProfile(p.id)
                        rerender()
                      }
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )
          })}
          <div className="profile-row">
            <select className="profile-avatar" value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} aria-label="Picture">
              {avatars.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <input className="profile-name" placeholder="New child's name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                addProfile(newName, newAvatar)
                setNewName('')
                rerender()
              }}
            >
              Add child
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function Checklist({ title, total, missing }: { title: string; total: number; missing: string[] }) {
  return (
    <details className="checklist">
      <summary>
        {title}: {total - missing.length} of {total} recorded
      </summary>
      {missing.length > 0 && <p className="checklist-missing">Still needed: {missing.join(', ')}</p>}
    </details>
  )
}
