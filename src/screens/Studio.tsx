import { useEffect, useRef, useState } from 'react'
import { groupTitles, recordItems, type ClipGroup, type RecordItem } from '../data/recordingList'
import {
  deleteRecording,
  exportRecordings,
  hasUserClip,
  importRecordings,
  onRecordingsChange,
  saveRecording,
  userClipUrl,
} from '../lib/recordings'
import { toCleanWav } from '../lib/wav'
import { go } from '../lib/router'
import { Icon, Picture, RoundButton, StaticTile, WordText } from '../components/ui'

const groups: ClipGroup[] = ['sounds', 'rimes', 'words', 'prompts']

/** Recording studio for grown-ups: record every sound, ending, word and instruction on this device. */
export function Studio() {
  const [, tick] = useState(0)
  useEffect(() => onRecordingsChange(() => tick((n) => n + 1)), [])
  const [current, setCurrent] = useState<RecordItem | null>(null)
  const [message, setMessage] = useState('')

  const done = recordItems.filter((i) => hasUserClip(i.key)).length
  const nextMissing = (after?: RecordItem) => {
    const start = after ? recordItems.indexOf(after) + 1 : 0
    const order = [...recordItems.slice(start), ...recordItems.slice(0, start)]
    return order.find((i) => !hasUserClip(i.key) && i !== after) ?? null
  }

  if (current) {
    return (
      <Recorder
        key={current.key}
        item={current}
        onClose={() => setCurrent(null)}
        onSaved={() => setCurrent(nextMissing(current))}
      />
    )
  }

  const backup = async () => {
    try {
      const blob = await exportRecordings()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'word-nest-recordings.json'
      a.click()
      setMessage('Backup saved to your downloads.')
    } catch {
      setMessage('Could not make a backup.')
    }
  }

  return (
    <div className="screen grown-ups">
      <header className="lesson-top">
        <RoundButton label="Back" onClick={() => go('/grown-ups')}>
          <span>{Icon.back}</span>
        </RoundButton>
        <h1>Recording studio</h1>
      </header>

      <main className="panel-stack">
        <section className="panel">
          <h2>
            {done} of {recordItems.length} recorded
          </h2>
          <p>
            Record each sound in your own voice and the app will use it straight away. Do it somewhere quiet, with the
            tablet a hand's width from your mouth.
          </p>
          <button
            type="button"
            className="text-btn big"
            disabled={done === recordItems.length}
            onClick={() => setCurrent(nextMissing())}
          >
            {done === 0 ? 'Start recording' : done === recordItems.length ? 'Everything is recorded' : 'Record the next one'}
          </button>
        </section>

        {groups.map((g) => {
          const items = recordItems.filter((i) => i.group === g)
          const n = items.filter((i) => hasUserClip(i.key)).length
          return (
            <section className="panel" key={g}>
              <h2>
                {groupTitles[g]} <small className="count">{n}/{items.length}</small>
              </h2>
              <div className="studio-chips">
                {items.map((i) => (
                  <button
                    key={i.key}
                    type="button"
                    className={`studio-chip ${hasUserClip(i.key) ? 'studio-chip-done' : ''} ${g === 'prompts' ? 'studio-chip-wide' : ''}`}
                    onClick={() => setCurrent(i)}
                  >
                    {hasUserClip(i.key) && <span aria-hidden>✓ </span>}
                    {g === 'rimes' ? `-${i.name}` : i.name}
                  </button>
                ))}
              </div>
            </section>
          )
        })}

        <section className="panel">
          <h2>Backup and moving to another tablet</h2>
          <p>
            Recordings live on this tablet. To use them on another one, save a backup here and import it there. To
            make them part of the app for everyone, send the backup file to whoever looks after the app.
          </p>
          <div className="row">
            <button type="button" className="text-btn" onClick={backup} disabled={done === 0}>
              Save a backup
            </button>
            <label className="text-btn">
              Import a backup
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  try {
                    setMessage(`Imported ${await importRecordings(file)} recordings.`)
                  } catch {
                    setMessage('That file is not a Word Nest backup.')
                  }
                }}
              />
            </label>
          </div>
          {message && <p className="studio-message">{message}</p>}
        </section>
      </main>
    </div>
  )
}

type Phase = 'ready' | 'recording' | 'working' | 'review'

function Recorder({ item, onClose, onSaved }: { item: RecordItem; onClose: () => void; onSaved: () => void }) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [error, setError] = useState('')
  const [level, setLevel] = useState(0)
  const [draft, setDraft] = useState<{ blob: Blob; url: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const stream = useRef<MediaStream | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const stopTimer = useRef<number>(undefined)
  const frame = useRef<number>(undefined)
  const player = useRef<HTMLAudioElement | null>(null)
  const saved = userClipUrl(item.key)

  const releaseMic = () => {
    window.clearTimeout(stopTimer.current)
    if (frame.current) cancelAnimationFrame(frame.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    setLevel(0)
  }
  useEffect(
    () => () => {
      releaseMic()
      player.current?.pause()
    },
    [],
  )
  useEffect(() => () => (draft ? URL.revokeObjectURL(draft.url) : undefined), [draft])

  const play = (url: string) => {
    player.current?.pause()
    player.current = new Audio(url)
    void player.current.play()
  }

  const start = async () => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record. Try Chrome or Safari, and make sure the page is opened with https.')
      return
    }
    try {
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
      })
      stream.current = mic
      const chunks: Blob[] = []
      const rec = new MediaRecorder(mic)
      recorder.current = rec
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      rec.onstop = async () => {
        releaseMic()
        setPhase('working')
        try {
          const wav = await toCleanWav(new Blob(chunks, { type: rec.mimeType }))
          setDraft({ blob: wav, url: URL.createObjectURL(wav) })
          setPhase('review')
        } catch {
          setError("I couldn't hear anything. Try again a little closer to the microphone.")
          setPhase('ready')
        }
      }

      // Level meter so you can see the microphone is hearing you.
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(mic).connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      const tickMeter = () => {
        analyser.getByteTimeDomainData(data)
        let peak = 0
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128))
        setLevel(Math.min(1, peak / 90))
        frame.current = requestAnimationFrame(tickMeter)
      }
      tickMeter()
      rec.addEventListener('stop', () => void ctx.close())

      rec.start()
      setPhase('recording')
      stopTimer.current = window.setTimeout(() => rec.state === 'recording' && rec.stop(), item.maxMs)
    } catch {
      releaseMic()
      setError('The microphone is blocked. Allow microphone access for this site in the browser settings, then try again.')
    }
  }

  const stop = () => {
    if (recorder.current?.state === 'recording') recorder.current.stop()
  }

  const keep = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await saveRecording(item.key, draft.blob)
      onSaved()
    } catch {
      setError('Could not save this recording on the device.')
      setSaving(false)
    }
  }

  const label = item.group === 'rimes' ? `-${item.name}` : item.name

  return (
    <div className="screen grown-ups">
      <header className="lesson-top">
        <RoundButton label="Back to the list" onClick={onClose}>
          <span>{Icon.back}</span>
        </RoundButton>
        <h1>{groupTitles[item.group]}</h1>
      </header>

      <main className="panel-stack">
        <section className="panel rec-card">
          <div className="rec-subject">
            {item.group === 'sounds' && (
              <>
                <StaticTile letter={item.tile ?? item.name} />
                {item.keyword && (
                  <span className="rec-keyword">
                    <Picture word={item.keyword} size={64} />
                    <span>as in “{item.keyword.text}”</span>
                  </span>
                )}
              </>
            )}
            {item.group === 'rimes' && (
              <span className="rec-tiles">
                {item.name.split('').map((l, i) => (
                  <StaticTile key={i} letter={l} />
                ))}
              </span>
            )}
            {item.group === 'words' && item.word && (
              <>
                <Picture word={item.word} size={120} />
                <WordText text={item.word.text} size={56} />
              </>
            )}
            {item.group === 'prompts' && <p className="rec-quote">“{label}”</p>}
          </div>
          <p className="rec-hint">{item.hint}</p>

          {error && <p className="studio-error">{error}</p>}

          {phase === 'ready' && (
            <div className="rec-actions">
              <button type="button" className="rec-btn" onClick={start} aria-label="Start recording">
                <span className="rec-dot" />
              </button>
              <p>Tap to record</p>
              {saved && (
                <div className="row">
                  <button type="button" className="text-btn" onClick={() => play(saved)}>
                    Play what I recorded before
                  </button>
                  <button
                    type="button"
                    className="text-btn danger"
                    onClick={() => {
                      if (window.confirm('Delete this recording and use the built-in voice again?')) void deleteRecording(item.key)
                    }}
                  >
                    Delete it
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'recording' && (
            <div className="rec-actions">
              <button type="button" className="rec-btn rec-btn-live" onClick={stop} aria-label="Stop recording">
                <span className="rec-square" />
              </button>
              <div className="meter" aria-hidden>
                <div className="meter-fill" style={{ width: `${Math.round(level * 100)}%` }} />
              </div>
              <p>Recording… tap to stop</p>
            </div>
          )}

          {phase === 'working' && <p className="rec-actions">One moment…</p>}

          {phase === 'review' && draft && (
            <div className="rec-actions">
              <button type="button" className="text-btn big" onClick={() => play(draft.url)}>
                ▶ Listen
              </button>
              <div className="row">
                <button type="button" className="text-btn big keep" onClick={keep} disabled={saving}>
                  Keep it
                </button>
                <button
                  type="button"
                  className="text-btn big"
                  onClick={() => {
                    setDraft(null)
                    setPhase('ready')
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
