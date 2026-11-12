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
  practiceFor,
  progressFor,
  removeProfile,
  resetProgress,
  saveSettings,
  switchProfile,
  updateProfile,
  type Profile,
  type Settings,
} from '../lib/settings'
import { allPages, describe, progressSummary, sections } from '../lib/routes'
import { lockTeacher, whatsappLink, workLink } from '../lib/teacher'
import { wordByText } from '../data/vocab'
import { Icon, Picture, RoundButton, WordText, hasPicture } from '../components/ui'
import { Pic } from '../components/Pic'

type Tab = 'class' | 'work' | 'voice' | 'setup'
const tabs: { id: Tab; label: string }[] = [
  { id: 'class', label: 'Class' },
  { id: 'work', label: 'Class work' },
  { id: 'voice', label: 'Sounds and voice' },
  { id: 'setup', label: 'Setup' },
]
const groupsInOrder: ClipGroup[] = ['sounds', 'rimes', 'words', 'prompts']

/** The teacher's desk: the class and how each child is getting on, class-work links, voice and recordings. */
export function Teacher() {
  const [tab, setTab] = useState<Tab>('class')
  return (
    <div className="screen grown-ups">
      <header className="lesson-top">
        <RoundButton label="Back to the app" onClick={() => go('/')}>
          <span>{Icon.back}</span>
        </RoundButton>
        <h1>Teacher</h1>
      </header>
      <nav className="teacher-tabs" aria-label="Teacher sections">
        {tabs.map((t) => (
          <button key={t.id} type="button" className={`teacher-tab ${tab === t.id ? 'teacher-tab-on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="panel-stack">
        {tab === 'class' && <ClassTab />}
        {tab === 'work' && <WorkTab />}
        {tab === 'voice' && <VoiceTab />}
        {tab === 'setup' && <SetupTab />}
      </main>
    </div>
  )
}

// ---------- Class ----------

function ClassTab() {
  const [, refresh] = useState(0)
  const rerender = () => refresh((n) => n + 1)
  const profiles = getProfiles()
  const [open, setOpen] = useState<string>(currentProfile().id)
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState(avatars[1])

  return (
    <>
      <section className="panel">
        <h2>Your class</h2>
        <p>Each child has their own stars and their own list of things to practise. Tap a child to see how they are getting on.</p>
      </section>
      {profiles.map((p) => (
        <ChildCard key={p.id} profile={p} open={open === p.id} onToggle={() => setOpen(open === p.id ? '' : p.id)} rerender={rerender} canRemove={profiles.length > 1} />
      ))}
      <section className="panel">
        <h2>Add a child</h2>
        <div className="profile-row add-child">
          <button
            type="button"
            className="profile-avatar"
            onClick={() => setNewAvatar(avatars[(avatars.indexOf(newAvatar) + 1) % avatars.length])}
            aria-label="Change the picture"
          >
            <Pic e={newAvatar} size={36} />
          </button>
          <input className="profile-name" placeholder="Child's name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              addProfile(newName, newAvatar)
              setNewName('')
              rerender()
            }}
          >
            {Icon.plus} Add
          </button>
        </div>
      </section>
    </>
  )
}

function ChildCard({ profile: p, open, onToggle, rerender, canRemove }: { profile: Profile; open: boolean; onToggle: () => void; rerender: () => void; canRemove: boolean }) {
  const stars = progressFor(p.id)
  const total = Object.values(stars).reduce((a, b) => a + b, 0)
  const practice = Object.entries(practiceFor(p.id)).sort((a, b) => b[1] - a[1])
  const summary = progressSummary(stars)
  const done = summary.reduce((a, s) => a + s.done, 0)
  const all = summary.reduce((a, s) => a + s.total, 0)

  return (
    <section className="panel child-card">
      <button type="button" className="child-head" onClick={onToggle} aria-expanded={open}>
        <span className="child-avatar">
          <Pic e={p.avatar} size={44} />
        </span>
        <span className="child-name">
          {p.name}
          <small>
            {done} of {all} done · {practice.length ? `${practice.length} to practise` : 'nothing to practise'}
          </small>
        </span>
        <span className="child-stars">
          {Icon.star} {total}
        </span>
      </button>
      {open && (
        <div className="child-body">
          <div className="bars">
            {summary.map((s) => (
              <div key={s.section} className="bar-row">
                <span className="bar-label">{s.section}</span>
                <span className="bar" role="img" aria-label={`${s.done} of ${s.total}`}>
                  <span className="bar-fill" style={{ width: `${(s.done / s.total) * 100}%` }} />
                </span>
                <span className="bar-count">
                  {s.done}/{s.total}
                </span>
              </div>
            ))}
          </div>

          <h3>Needs more practice</h3>
          {practice.length ? (
            <div className="practice-list">
              {practice.slice(0, 18).map(([key, count]) => (
                <PracticeItem key={key} subject={key} count={count} />
              ))}
            </div>
          ) : (
            <p className="muted">Nothing yet. Words and sounds appear here when a child needs more than one try.</p>
          )}

          <div className="row child-actions">
            <label className="name-edit">
              <span className="visually-hidden">Name</span>
              <input
                className="profile-name"
                value={p.name}
                onChange={(e) => {
                  updateProfile(p.id, { name: e.target.value })
                  rerender()
                }}
              />
            </label>
            <button
              type="button"
              className="profile-avatar"
              onClick={() => {
                updateProfile(p.id, { avatar: avatars[(avatars.indexOf(p.avatar) + 1) % avatars.length] })
                rerender()
              }}
              aria-label={`Change the picture for ${p.name}`}
            >
              <Pic e={p.avatar} size={36} />
            </button>
            {p.id !== currentProfile().id && (
              <button type="button" className="text-btn" onClick={() => { switchProfile(p.id); rerender() }}>
                Play as {p.name}
              </button>
            )}
            <button
              type="button"
              className="text-btn danger"
              onClick={() => {
                if (window.confirm(`Clear all stars and practice lists for ${p.name}?`)) {
                  resetProgress(p.id)
                  rerender()
                }
              }}
            >
              Clear progress
            </button>
            {canRemove && (
              <button
                type="button"
                className="text-btn danger"
                onClick={() => {
                  if (window.confirm(`Remove ${p.name} and everything saved for them?`)) {
                    removeProfile(p.id)
                    rerender()
                  }
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function PracticeItem({ subject, count }: { subject: string; count: number }) {
  const at = subject.indexOf(':')
  const kind = subject.slice(0, at)
  const text = subject.slice(at + 1)
  const w = kind === 'word' ? wordByText(text) : undefined
  const hear = () => (kind === 'sound' ? play(sound(text)) : kind === 'word' ? play(word(text)) : play(...text.replace(/[.?!]/g, '').split(' ').map((t) => word(t))))
  return (
    <button type="button" className="practice-item" onClick={hear} aria-label={`Hear ${text}`}>
      {w && hasPicture(w) && <Picture word={w} size={36} />}
      {kind === 'word' ? <WordText text={text} size={22} /> : <span className={kind === 'sound' ? 'practice-sound' : 'practice-sentence'}>{text}</span>}
      <span className="practice-count">{count}×</span>
    </button>
  )
}

// ---------- Class work ----------

function WorkTab() {
  const [title, setTitle] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const toggle = (route: string) => setPicked((cur) => (cur.includes(route) ? cur.filter((r) => r !== route) : [...cur, route]))
  const work = { title: title.trim() || 'Class work', items: picked }
  const link = picked.length ? workLink(work) : ''
  const message = `${work.title}\n${picked.map((r, i) => `${i + 1}. ${describe(r)}`).join('\n')}\n\nTap to start:\n${link}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', link)
    }
  }

  return (
    <>
      <section className="panel">
        <h2>Make a class-work link</h2>
        <p>
          Choose the pages for today, in the order you want them done. You get one link to send to the class WhatsApp
          group. Opening it shows the list, and each page opens with one tap.
        </p>
        <label className="field">
          <span>Title</span>
          <input className="profile-name" placeholder="Monday class work" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
        </label>
        {picked.length > 0 && (
          <ol className="picked-list">
            {picked.map((r) => (
              <li key={r}>
                <span>{describe(r)}</span>
                <button type="button" className="picked-remove" onClick={() => toggle(r)} aria-label={`Remove ${describe(r)}`}>
                  {Icon.close}
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="row">
          <button type="button" className="text-btn big" disabled={!picked.length} onClick={() => window.open(whatsappLink(message), '_blank', 'noopener')}>
            {Icon.share} Send on WhatsApp
          </button>
          <button type="button" className="text-btn big" disabled={!picked.length} onClick={copy}>
            {copied ? Icon.check : Icon.link} {copied ? 'Copied' : 'Copy link'}
          </button>
          {picked.length > 0 && (
            <button type="button" className="text-btn" onClick={() => setPicked([])}>
              Clear
            </button>
          )}
        </div>
      </section>
      {sections.map((s) => (
        <section key={s} className="panel">
          <h2>{s}</h2>
          <div className="studio-chips">
            {allPages
              .filter((p) => p.section === s)
              .map((p) => (
                <button key={p.route} type="button" className={`studio-chip ${picked.includes(p.route) ? 'chip-picked' : ''}`} aria-pressed={picked.includes(p.route)} onClick={() => toggle(p.route)}>
                  {picked.includes(p.route) ? <span className="chip-num">{picked.indexOf(p.route) + 1}</span> : null}
                  {p.label}
                </button>
              ))}
          </div>
        </section>
      ))}
    </>
  )
}

// ---------- Sounds and voice ----------

function VoiceTab() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [voices, setVoices] = useState(englishVoices)
  useEffect(() => {
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
    <>
      <section className="panel">
        <h2>Recordings</h2>
        <p>
          Your own voice always beats the built-in one, so record anything that does not sound right. One button shares
          your recordings with every tablet.
        </p>
        <button type="button" className="text-btn big" onClick={() => go('/studio')}>
          {Icon.play} Open the sound library
        </button>
        {groupsInOrder.map((g) => {
          const total = recordItems.filter((i) => i.group === g).length
          const left = missing(g)
          return <Checklist key={g} title={groupTitles[g]} total={total} missing={left.map((i) => (g === 'rimes' ? `-${i.name}` : i.name))} />
        })}
      </section>
      <section className="panel">
        <h2>Voice for everything else</h2>
        <p>Sounds and words without a recording are spoken by the device's own voice. Pick the one closest to how you teach.</p>
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
          <input type="range" min={0.5} max={1.1} step={0.05} value={settings.speechRate} onChange={(e) => update({ speechRate: Number(e.target.value) })} />
        </label>
        <label className="field field-row">
          <input type="checkbox" checked={settings.effects} onChange={(e) => update({ effects: e.target.checked })} />
          <span>Play sound effects (taps, cheers)</span>
        </label>
        <button type="button" className="text-btn" onClick={() => play(sound('c'), sound('a'), sound('t'), word('cat'))}>
          {Icon.play} Test: c-a-t, cat
        </button>
      </section>
    </>
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

// ---------- Setup ----------

function SetupTab() {
  return (
    <>
      <section className="panel about-logos">
        <img src="/brand/school.png" alt="Yellow House Foundation School" />
        <img src="/brand/learning-circle.png" alt="Learning Circle, supporting education" />
      </section>
      <section className="panel">
        <h2>Lesson plan</h2>
        <p>The whole course in order: every lesson, the words it uses, and what children do in each.</p>
        <button type="button" className="text-btn big" onClick={() => go('/plan')}>
          Open the lesson plan
        </button>
      </section>
      <section className="panel">
        <h2>Student mode and teacher mode</h2>
        <p>
          The app opens in student mode: children can play, but cannot change settings, record, or see this page. Teacher
          mode closes by itself after ten quiet minutes, when the app is closed, or when you tap Lock.
        </p>
        <p>To change your PIN, lock teacher mode, tap the lock on the front page, choose "Forgot your PIN?" and answer the sum.</p>
      </section>
    </>
  )
}
