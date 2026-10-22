import { useEffect, useRef, useState } from 'react'
import { groupTitles, recordItems, type ClipGroup, type RecordItem } from '../data/recordingList'
import { checkPasscode, publishPending, rememberPasscode, savedPasscode, syncPublished } from '../lib/publish'
import {
  deleteRecording,
  exportRecordings,
  hasUserClip,
  importRecordings,
  onRecordingsChange,
  publishedClipCount,
  saveRecording,
  unpublishedKeys,
  userClipUrl,
} from '../lib/recordings'
import { toCleanWav } from '../lib/wav'
import { play as playClip, word as wordClip } from '../lib/audio'
import { go } from '../lib/router'
import { Icon, Picture, RoundButton, StaticTile, WordText } from '../components/ui'

const groups: ClipGroup[] = ['sounds', 'rimes', 'words', 'prompts']

/** Sound library for grown-ups: record every letter sound and combination, then endings, words and instructions. */
export function Studio() {
  const [, tick] = useState(0)
  useEffect(() => onRecordingsChange(() => tick((n) => n + 1)), [])
  const [current, setCurrent] = useState<RecordItem | null>(null)
  const [scope, setScope] = useState<ClipGroup | null>(null)
  const [message, setMessage] = useState('')
  const heard = useRef<HTMLAudioElement | null>(null)
  const [passcode, setPasscode] = useState(savedPasscode)
  const [sharing, setSharing] = useState<{ busy: boolean; done: number; total: number; message: string; failed: string[] }>({
    busy: false,
    done: 0,
    total: 0,
    message: '',
    failed: [],
  })

  const done = recordItems.filter((i) => hasUserClip(i.key)).length
  const soundItems = recordItems.filter((i) => i.group === 'sounds')
  const soundsDone = soundItems.filter((i) => hasUserClip(i.key)).length
  /** The next recording still to do, staying inside one group during a guided session. */
  const nextMissing = (after?: RecordItem, within: ClipGroup | null = scope) => {
    const list = within ? recordItems.filter((i) => i.group === within) : recordItems
    const start = after ? list.indexOf(after) + 1 : 0
    const order = [...list.slice(start), ...list.slice(0, start)]
    return order.find((i) => !hasUserClip(i.key) && i !== after) ?? null
  }
  const pending = unpublishedKeys().length

  const publishNow = async () => {
    const code = passcode.trim()
    if (!code) return setSharing((x) => ({ ...x, message: 'Type the passcode first.' }))
    setSharing({ busy: true, done: 0, total: pending, message: 'Checking the passcode…', failed: [] })
    const check = await checkPasscode(code)
    if (check !== 'ok') {
      const why = {
        wrong: "That passcode isn't right.",
        'not-configured': 'Sharing is not set up yet. Ask whoever looks after the app to finish the one-time setup.',
        offline: "Can't reach the voice library. Check the internet connection and try again.",
      }[check]
      return setSharing({ busy: false, done: 0, total: 0, message: why, failed: [] })
    }
    rememberPasscode(code)
    const report = await publishPending(code, (done, total) =>
      setSharing((x) => ({ ...x, done, total, message: `Sharing ${done} of ${total}…` })),
    )
    await syncPublished()
    setSharing({
      busy: false,
      done: 0,
      total: 0,
      failed: report.failed.map((f) => `${f.key} (${f.reason})`),
      message: report.failed.length
        ? `Shared ${report.published.length}. ${report.failed.length} could not be shared: tap Share again to retry.`
        : `Shared ${report.published.length} recording${report.published.length === 1 ? '' : 's'}. Every tablet will use them the next time it opens the app online.`,
    })
  }

  const getLatest = async () => {
    setSharing((x) => ({ ...x, busy: true, message: 'Checking the voice library…', failed: [] }))
    const n = await syncPublished()
    setSharing((x) => ({ ...x, busy: false, message: n ? `Downloaded ${n} new recording${n === 1 ? '' : 's'}.` : 'This tablet already has the latest voice.' }))
  }

  const listen = (url: string) => {
    heard.current?.pause()
    heard.current = new Audio(url)
    void heard.current.play()
  }

  if (current) {
    return (
      <Recorder
        key={current.key}
        item={current}
        onClose={() => {
          setCurrent(null)
          setScope(null)
        }}
        onSaved={() => {
          const next = nextMissing(current)
          setCurrent(next)
          if (!next && scope === 'sounds') setMessage('All the letter sounds and combinations are recorded. Well done!')
          if (!next) setScope(null)
        }}
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
        <h1>Sound library</h1>
      </header>

      <main className="panel-stack">
        <section className="panel">
          <h2>
            Letter sounds: {soundsDone} of {soundItems.length} recorded
          </h2>
          <p>
            You will be asked for each sound in turn: the 26 letters, then the letter combinations such as sh, ai and oo.
            Say just the sound, not the letter's name. Each one is saved in the library below, and the app uses it straight
            away. Do it somewhere quiet, with the tablet a hand's width from your mouth.
          </p>
          <button
            type="button"
            className="text-btn big"
            disabled={soundsDone === soundItems.length}
            onClick={() => {
              setScope('sounds')
              setCurrent(nextMissing(undefined, 'sounds'))
            }}
          >
            {soundsDone === 0 ? 'Start with the letter sounds' : soundsDone === soundItems.length ? 'All sounds recorded' : 'Carry on with the sounds'}
          </button>
          {message && <p className="studio-message">{message}</p>}
        </section>

        <section className="panel">
          <h2>
            Everything else: {done - soundsDone} of {recordItems.length - soundItems.length} recorded
          </h2>
          <p>Word endings, words, and Pip's instructions. These can wait until the sounds are done.</p>
          <button
            type="button"
            className="text-btn"
            disabled={done === recordItems.length}
            onClick={() => {
              setScope(null)
              setCurrent(nextMissing(undefined, null))
            }}
          >
            Record the next one
          </button>
        </section>

        <section className="panel">
          <h2>Share with every tablet</h2>
          <p>
            Recordings made here stay on this tablet until you share them. Sharing puts them in the app's voice library, and every
            tablet downloads them automatically, so everyone hears the same voice. Re-recording a sound and sharing again
            replaces it everywhere.
          </p>
          <p className="share-counts">
            <strong>{pending}</strong> waiting to be shared · <strong>{publishedClipCount()}</strong> from the library on this tablet
          </p>
          <label className="field">
            <span>Passcode</span>
            <input
              type="password"
              autoComplete="off"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="The passcode for sharing"
            />
          </label>
          <div className="row">
            <button type="button" className="text-btn big keep" disabled={sharing.busy || pending === 0} onClick={publishNow}>
              {pending === 0 ? 'Nothing new to share' : `Share ${pending} recording${pending === 1 ? '' : 's'}`}
            </button>
            <button type="button" className="text-btn" disabled={sharing.busy} onClick={getLatest}>
              Get the latest voice
            </button>
          </div>
          {sharing.busy && sharing.total > 0 && (
            <div className="meter share-meter" aria-hidden>
              <div className="meter-fill" style={{ width: `${Math.round((sharing.done / sharing.total) * 100)}%` }} />
            </div>
          )}
          {sharing.message && <p className="studio-message">{sharing.message}</p>}
          {sharing.failed.length > 0 && <p className="checklist-missing">Not shared: {sharing.failed.join(', ')}</p>}
        </section>

        {groups.map((g) => {
          const items = recordItems.filter((i) => i.group === g)
          const n = items.filter((i) => hasUserClip(i.key)).length
          return (
            <section className="panel" key={g}>
              <h2>
                {groupTitles[g]} <small className="count">{n}/{items.length}</small>
              </h2>
              {g === 'sounds' ? (
                <div className="sound-lib">
                  {items.map((i) => {
                    const url = userClipUrl(i.key)
                    return (
                      <div key={i.key} className="sound-lib-item">
                        <button
                          type="button"
                          className={`sound-lib-tile ${url ? 'sound-lib-done' : ''}`}
                          onClick={() => {
                            setScope(null)
                            setCurrent(i)
                          }}
                          aria-label={`Record ${i.name}`}
                        >
                          <span className="sound-lib-label">{i.tile}</span>
                          <small>{i.keyword?.text}</small>
                        </button>
                        {url && (
                          <button type="button" className="sound-lib-play" onClick={() => listen(url)} aria-label={`Play ${i.name}`}>
                            ▶
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
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
              )}
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
              {item.group === 'sounds' && item.keyword && (
                <button type="button" className="text-btn" onClick={() => void playClip(wordClip(item.keyword!.text))}>
                  Hear the example word “{item.keyword.text}”
                </button>
              )}
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
