import { useMemo } from 'react'

/** The colours of one scene. Each tab of the app has its own, so moving around feels like going somewhere. */
export interface Theme {
  skyTop: string
  skyBottom: string
  sun: string
  hill1: string
  hill2: string
  hill3: string
  accent: string
}

export const themes: Record<string, Theme> = {
  abc: { skyTop: '#ffd9cc', skyBottom: '#fff8ea', sun: '#ffc93c', hill1: '#ffb3a3', hill2: '#ff8f7d', hill3: '#ff6b5e', accent: '#ff6b5e' },
  sounds: { skyTop: '#c4f1ea', skyBottom: '#f4fbf3', sun: '#ffc93c', hill1: '#8fe0d2', hill2: '#4fcfbd', hill3: '#17b3a3', accent: '#17b3a3' },
  words: { skyTop: '#dcd3ff', skyBottom: '#faf6ff', sun: '#ffc93c', hill1: '#b9a8ff', hill2: '#9680ff', hill3: '#7c5cff', accent: '#7c5cff' },
  games: { skyTop: '#ffe2b0', skyBottom: '#fff9ea', sun: '#ff8a5c', hill1: '#ffca7a', hill2: '#ffae42', hill3: '#f29a12', accent: '#f29a12' },
  books: { skyTop: '#c6dcff', skyBottom: '#f4f8ff', sun: '#ffc93c', hill1: '#9cc4ff', hill2: '#6aa6ff', hill3: '#2e8bff', accent: '#2e8bff' },
  meadow: { skyTop: '#bfe6ff', skyBottom: '#fff8ea', sun: '#ffc93c', hill1: '#b5ea9d', hill2: '#7fd67a', hill3: '#2fb86a', accent: '#2fb86a' },
}

const floaters = [
  { t: 'A', x: 4, y: 16, s: 54, r: -12, d: 0 },
  { t: 'b', x: 90, y: 30, s: 60, r: 10, d: 1.2 },
  { t: '1', x: 8, y: 52, s: 34, r: 0, d: 0.6 },
  { t: 'c', x: 93, y: 62, s: 50, r: -8, d: 2.1 },
  { t: '2', x: 85, y: 12, s: 28, r: 0, d: 1.7 },
  { t: 'd', x: 3, y: 76, s: 48, r: 14, d: 0.9 },
]

/** The backdrop behind every screen: a sky, a sun, drifting clouds, rolling hills, and a few floating letters. */
export function Scenery({ theme = 'abc' }: { theme?: string }) {
  const t = themes[theme] ?? themes.abc
  const vars = {
    '--sky-top': t.skyTop,
    '--sky-bottom': t.skyBottom,
    '--hill-1': t.hill1,
    '--hill-2': t.hill2,
    '--hill-3': t.hill3,
    '--theme': t.accent,
    '--sun': t.sun,
  } as React.CSSProperties

  const flowers = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ x: 6 + i * 11 + (i % 2) * 3, y: 6 + (i % 3) * 7, c: ['#fff', '#ffc93c', '#fff', '#ff8fa3'][i % 4], s: 5 + (i % 3) * 1.5 })),
    [],
  )

  return (
    <div className="scenery" style={vars} aria-hidden>
      <svg className="scene-sun" viewBox="0 0 200 200">
        <g className="scene-rays" stroke="var(--sun)" strokeWidth="9" strokeLinecap="round" opacity=".55">
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d="M100 14v22" transform={`rotate(${i * (360 / 14)} 100 100)`} />
          ))}
        </g>
        <circle cx="100" cy="100" r="52" fill="var(--sun)" />
        <circle cx="100" cy="100" r="52" fill="#fff" opacity=".18" />
        <circle cx="84" cy="94" r="5" fill="#1c2b4f" opacity=".7" />
        <circle cx="116" cy="94" r="5" fill="#1c2b4f" opacity=".7" />
        <path d="M82 114q18 16 36 0" stroke="#1c2b4f" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".7" />
        <circle cx="72" cy="108" r="7" fill="#ff8f86" opacity=".6" />
        <circle cx="128" cy="108" r="7" fill="#ff8f86" opacity=".6" />
      </svg>

      <svg className="scene-cloud c1" viewBox="0 0 220 90">
        <path d="M30 80a28 28 0 010-56a40 40 0 0176-14a34 34 0 0152 20a26 26 0 010 50z" fill="#fff" />
      </svg>
      <svg className="scene-cloud c2" viewBox="0 0 220 90">
        <path d="M30 80a28 28 0 010-56a40 40 0 0176-14a34 34 0 0152 20a26 26 0 010 50z" fill="#fff" />
      </svg>
      <svg className="scene-cloud c3" viewBox="0 0 220 90">
        <path d="M30 80a28 28 0 010-56a40 40 0 0176-14a34 34 0 0152 20a26 26 0 010 50z" fill="#fff" />
      </svg>

      {floaters.map((f, i) => (
        <span
          key={i}
          className="scene-float"
          style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: f.s, ['--r' as string]: `${f.r}deg`, animationDelay: `${f.d}s` }}
        >
          {f.t}
        </span>
      ))}

      <svg className="scene-hills" viewBox="0 0 1000 300" preserveAspectRatio="none">
        <path d="M0 120C150 40 330 60 500 120S830 190 1000 100V300H0Z" fill="var(--hill-1)" />
        <path d="M0 190C180 130 360 150 540 195S850 230 1000 170V300H0Z" fill="var(--hill-2)" />
        <path d="M0 250C220 215 460 235 1000 220V300H0Z" fill="var(--hill-3)" />
        {flowers.map((f, i) => (
          <g key={i} transform={`translate(${f.x * 10} ${180 + f.y * 6})`} opacity=".9">
            <circle r={f.s} cx="0" cy="0" fill={f.c} />
            <circle r={f.s * 0.55} fill="#ffc93c" />
          </g>
        ))}
      </svg>
    </div>
  )
}
