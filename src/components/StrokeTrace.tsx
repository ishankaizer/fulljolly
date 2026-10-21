import { useEffect, useMemo, useRef, useState } from 'react'
import { GLYPH_H, GLYPH_W, LINES, strokes, strokeStarts } from '../data/glyphs'
import { sfx } from '../lib/audio'
import { Confetti } from './ui'

const STEP = 3
const INK = 7 // pen width, in glyph units
const FOLLOW = 7 // how thick the path to follow is

/** Trace a letter on handwriting paper, along the real strokes. Scribbles and single dots do not count. */
export function StrokeTrace({
  letter,
  color,
  size = 260,
  onDone,
}: {
  letter: string
  color: string
  size?: number
  onDone?: () => void
}) {
  const W = size
  const H = Math.round((size * GLYPH_H) / GLYPH_W)
  const k = W / GLYPH_W
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const list = strokes[letter] ?? []
  const starts = strokeStarts(letter)

  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const record = useMemo(() => document.createElement('canvas'), [])
  const masks = useRef<{ letter: Uint8Array; near: Uint8Array; cols: number } | null>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [done, setDone] = useState(false)
  const [wobble, setWobble] = useState(0)

  const paths = useMemo(() => list.map((d) => new Path2D(d)), [letter])

  // Handwriting lines, the pale path to follow, the numbered starts, and the masks used to check the trace.
  useEffect(() => {
    record.width = W
    record.height = H
    const g = guideRef.current!.getContext('2d')!
    g.setTransform(dpr * k, 0, 0, dpr * k, 0, 0)
    g.clearRect(0, 0, GLYPH_W, GLYPH_H + 2)
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.lineWidth = 1
    for (const [y, dash, col] of [
      [LINES.top, [], '#cfe3f5'],
      [LINES.middle, [3, 3], '#cfe3f5'],
      [LINES.base, [], '#8ab4d8'],
      [LINES.bottom, [3, 3], '#cfe3f5'],
    ] as const) {
      g.setLineDash([...dash])
      g.strokeStyle = col
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(GLYPH_W, y)
      g.stroke()
    }
    g.setLineDash([])
    g.strokeStyle = '#e3edf8'
    g.lineWidth = FOLLOW + 3
    for (const p of paths) g.stroke(p)
    g.setLineDash([2, 3])
    g.strokeStyle = color
    g.lineWidth = 0.9
    for (const p of paths) g.stroke(p)
    g.setLineDash([])
    starts.forEach((s, i) => {
      g.fillStyle = '#e5484d'
      g.beginPath()
      g.arc(s.x, s.y, 6, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#fff'
      g.font = '700 8px sans-serif'
      g.textAlign = 'center'
      g.fillText(String(i + 1), s.x, s.y + 2.8)
    })

    const mask = (width: number) => {
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      const x = c.getContext('2d', { willReadFrequently: true })!
      x.scale(k, k)
      x.lineCap = 'round'
      x.lineJoin = 'round'
      x.lineWidth = width
      for (const p of paths) x.stroke(p)
      const data = x.getImageData(0, 0, W, H).data
      const cols = Math.ceil(W / STEP)
      const out = new Uint8Array(cols * Math.ceil(H / STEP))
      for (let y = 0; y < H; y += STEP)
        for (let xx = 0; xx < W; xx += STEP) out[(y / STEP) * cols + xx / STEP] = data[(y * W + xx) * 4 + 3] > 100 ? 1 : 0
      return out
    }
    masks.current = { letter: mask(FOLLOW), near: mask(FOLLOW * 2.6), cols: Math.ceil(W / STEP) }
  }, [letter, color, W])

  const point = (e: React.PointerEvent) => {
    const r = inkRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    for (const [ctx, scale] of [[inkRef.current!.getContext('2d')!, dpr], [record.getContext('2d')!, 1]] as const) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.strokeStyle = color
      ctx.lineWidth = INK * k
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x + 0.01, to.y)
      ctx.stroke()
    }
  }

  const clear = () => {
    inkRef.current!.getContext('2d')!.clearRect(0, 0, inkRef.current!.width, inkRef.current!.height)
    record.getContext('2d')!.clearRect(0, 0, W, H)
  }

  const check = () => {
    const m = masks.current
    if (!m) return
    const data = record.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, W, H).data
    let total = 0
    let covered = 0
    let drawn = 0
    let outside = 0
    for (let y = 0; y < H; y += STEP) {
      for (let x = 0; x < W; x += STEP) {
        const i = (y / STEP) * m.cols + x / STEP
        const ink = data[(y * W + x) * 4 + 3] > 40
        if (m.letter[i]) {
          total++
          if (ink) covered++
        }
        if (ink) {
          drawn++
          if (!m.near[i]) outside++
        }
      }
    }
    if (!total || !drawn) return
    const tooMuchInk = drawn > total * 1.8
    if (covered / total >= 0.6 && outside / drawn <= 0.4 && !tooMuchInk) {
      setDone(true)
      sfx.right()
      const g = guideRef.current!.getContext('2d')!
      g.setTransform(dpr * k, 0, 0, dpr * k, 0, 0)
      g.lineWidth = INK
      g.strokeStyle = color
      for (const p of paths) g.stroke(p)
      clear()
      onDone?.()
    } else if (tooMuchInk || (drawn > total * 0.9 && outside / drawn > 0.5)) {
      sfx.tryAgain()
      setWobble((w) => w + 1)
      clear()
    }
  }

  const onDown = (e: React.PointerEvent) => {
    if (done) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = point(e)
    stroke(last.current, last.current)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const p = point(e)
    stroke(last.current, p)
    last.current = p
  }
  const onUp = () => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    check()
  }

  return (
    <div key={wobble} className={`stroke-trace ${wobble ? 'trace-wobble' : ''}`} style={{ width: W, height: H }}>
      <canvas ref={guideRef} width={W * dpr} height={H * dpr} style={{ width: W, height: H }} />
      <canvas
        ref={inkRef}
        className="trace-ink"
        width={W * dpr}
        height={H * dpr}
        style={{ width: W, height: H }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label={`Trace the letter ${letter}`}
      />
      {done && <Confetti pieces={24} />}
      {done && (
        <span className="stroke-trace-done" aria-label="Done">
          ✓
        </span>
      )}
      {!done && (
        <button type="button" className="stroke-trace-clear" onClick={clear} aria-label="Start again">
          ↺
        </button>
      )}
    </div>
  )
}
