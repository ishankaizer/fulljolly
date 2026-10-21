import { useEffect, useState } from 'react'
import { units, vowelSwaps } from '../data/curriculum'
import { englishVoices, hasRecording, play, rime, sound, word } from '../lib/audio'
import { go } from '../lib/router'
import { loadSettings, resetProgress, saveSettings, type Settings } from '../lib/settings'
import { Icon, RoundButton } from '../components/ui'

const letters = [...new Set(units.flatMap((u) => u.families.flatMap((f) => f.words.flatMap((w) => w.text.split('')))))].sort()
const allWords = [
  ...new Set([
    ...units.flatMap((u) => [u.keyword.text, ...u.families.flatMap((f) => f.words.map((w) => w.text))]),
    ...vowelSwaps.flatMap((s) => s.words.map((w) => w.text)),
  ]),
].sort()
const allRimes = units.flatMap((u) => u.families)

/** Settings for the teacher: voice, speed, sound effects, recordings checklist, progress reset. */
export function GrownUps() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [voices, setVoices] = useState(englishVoices)
  const [cleared, setCleared] = useState(false)

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

  const missingSounds = letters.filter((l) => !hasRecording(sound(l)))
  const missingRimes = allRimes.filter((f) => !hasRecording(rime(f.rime)))
  const missingWords = allWords.filter((w) => !hasRecording(word(w)))

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
          <Checklist title="Letter sounds" total={letters.length} missing={missingSounds} />
          <Checklist title="Word endings" total={allRimes.length} missing={missingRimes.map((f) => `-${f.rime}`)} />
          <Checklist title="Words" total={allWords.length} missing={missingWords} />
        </section>

        <section className="panel">
          <h2>Progress</h2>
          <p>Stars are saved on this device only.</p>
          <button
            type="button"
            className="text-btn danger"
            onClick={() => {
              if (window.confirm('Clear all stars on this device?')) {
                resetProgress()
                setCleared(true)
              }
            }}
          >
            {cleared ? 'Stars cleared' : 'Clear all stars'}
          </button>
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
