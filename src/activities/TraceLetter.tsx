import { useEffect, useMemo, useRef, useState } from 'react'
import type { VowelUnit } from '../data/curriculum'
import { pause, prompt, sfx, sound, word } from '../lib/audio'
import { useVoice } from '../lib/useVoice'
import { Confetti, Footer, Icon, Picture, RoundButton, fit, vowelColor } from '../components/ui'

const STEP = 4 // sample the letter every 4px when checking the trace
const FONT = 'Andika'

/** Trace the letter with a finger while saying its sound, the way it is taught on paper. */
export function TraceLetter({ unit, onDone }: { unit: VowelUnit; onDone: () => void }) {
  const letter = unit.vowel
  const color = vowelColor[letter]
  const { talking, say } = useVoice()

  const size = Math.round(Math.min(window.innerWidth - 72, window.innerHeight * 0.46, 380))
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  // Same strokes at 1x scale with no devicePixelRatio, used only for checking the trace.
  const record = useMemo(() => document.createElement('canvas'), [])
  const masks = useRef<{ letter: Uint8Array; near: Uint8Array; cols: number } | null>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  const [done, setDone] = useState(false)
  const [wobble, setWobble] = useState(0)

  const intro = () =>
    say(prompt('trace-intro', 'Trace the letter with your finger. Say its sound!'), pause(250), sound(letter))

  // Draw the dotted guide letter and work out which pixels belong to it.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await document.fonts.load(`700 100px ${FONT}`)
      } catch {
        // draw with whatever font is available
      }
      if (cancelled || !guideRef.current) return
      const font = `700 ${Math.round(size * 0.95)}px ${FONT}, sans-serif`

      const place = (ctx: CanvasRenderingContext2D) => {
        ctx.font = font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        const m = ctx.measureText(letter)
        return { x: size / 2, y: (size + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 }
      }

      const g = guideRef.current.getContext('2d')!
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, size, size)
      const at = place(g)
      g.fillStyle = '#e3edf8'
      g.fillText(letter, at.x, at.y)
      g.setLineDash([10, 12])
      g.lineWidth = 3
      g.strokeStyle = color
      g.strokeText(letter, at.x, at.y)

      const mask = (grow: number) => {
        const c = document.createElement('canvas')
        c.width = c.height = size
        const x = c.getContext('2d', { willReadFrequently: true })!
        const p = place(x)
        x.fillStyle = '#000'
        x.fillText(letter, p.x, p.y)
        if (grow) {
          x.lineWidth = grow
          x.lineJoin = 'round'
          x.strokeText(letter, p.x, p.y)
        }
        const data = x.getImageData(0, 0, size, size).data
        const cols = Math.ceil(size / STEP)
        const out = new Uint8Array(cols * cols)
        for (let y = 0; y < size; y += STEP)
          for (let xx = 0; xx < size; xx += STEP) out[(y / STEP) * cols + xx / STEP] = data[(y * size + xx) * 4 + 3] > 100 ? 1 : 0
        return out
      }
      masks.current = { letter: mask(0), near: mask(size * 0.1), cols: Math.ceil(size / STEP) }
    })()
    return () => {
      cancelled = true
    }
  }, [letter, size, dpr, color])

  useEffect(() => {
    record.width = record.height = size
    intro()
  }, []) // only on arrival

  const point = (e: React.PointerEvent) => {
    const r = inkRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size }
  }

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ink = inkRef.current!.getContext('2d')!
    const rec = record.getContext('2d')!
    for (const [ctx, scale] of [[ink, dpr], [rec, 1]] as const) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = size * 0.11
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
    record.getContext('2d')!.clearRect(0, 0, size, size)
  }

  const check = () => {
    const m = masks.current
    if (!m) return
    const data = record.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, size, size).data
    let total = 0
    let covered = 0
    let drawn = 0
    let outside = 0
    for (let y = 0; y < size; y += STEP) {
      for (let x = 0; x < size; x += STEP) {
        const k = (y / STEP) * m.cols + x / STEP
        const ink = data[(y * size + x) * 4 + 3] > 40
        if (m.letter[k]) {
          total++
          if (ink) covered++
        }
        if (ink) {
          drawn++
          if (!m.near[k]) outside++
        }
      }
    }
    if (total === 0 || drawn === 0) return
    const coverage = covered / total
    const stray = outside / drawn
    // Following the letter puts ink on about as much area as the letter itself. Much more than
    // that is scribbling, however much of the letter it happens to cover.
    const tooMuchInk = drawn > total * 2.2
    if (coverage >= 0.55 && stray <= 0.4 && !tooMuchInk) {
      setDone(true)
      sfx.right()
      const g = guideRef.current!.getContext('2d')!
      g.setLineDash([])
      g.fillStyle = color
      g.font = `700 ${Math.round(size * 0.95)}px ${FONT}, sans-serif`
      g.textAlign = 'center'
      const mm = g.measureText(letter)
      g.fillText(letter, size / 2, (size + mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2)
      clear()
      say(pause(200), sound(letter), pause(250), sound(letter), pause(300), word(unit.keyword.text))
    } else if (tooMuchInk || (drawn > total * 0.9 && stray > 0.5)) {
      // Scribbling all over rather than following the letter: start again, gently.
      sfx.tryAgain()
      setWobble((w) => w + 1)
      clear()
      say(prompt('trace-again', 'Follow the dotted line'))
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
    <div className="activity trace">
      <div className="trace-stage">
        <div
          key={wobble}
          className={`trace-board ${wobble ? 'trace-wobble' : ''}`}
          style={{ width: size, height: size, ['--accent' as string]: color }}
        >
          <canvas ref={guideRef} width={size * dpr} height={size * dpr} style={{ width: size, height: size }} />
          <canvas
            ref={inkRef}
            className="trace-ink"
            width={size * dpr}
            height={size * dpr}
            style={{ width: size, height: size }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-label={`Trace the letter ${letter}`}
          />
          {done && <Confetti pieces={30} />}
        </div>
        <div className="trace-keyword">
          <Picture word={unit.keyword} size={fit(84, 0.12)} />
        </div>
      </div>

      <Footer mood={done ? 'cheer' : talking ? 'talk' : 'idle'}>
        {done ? (
          <RoundButton label="Next" color={color} onClick={onDone} pulse={!talking}>
            <span style={{ color: '#fff' }}>{Icon.next}</span>
          </RoundButton>
        ) : (
          <>
            <RoundButton label="Hear it again" onClick={intro}>
              <span style={{ color }}>{Icon.speaker}</span>
            </RoundButton>
            <RoundButton label="Start again" onClick={clear}>
              <span style={{ color }}>{Icon.again}</span>
            </RoundButton>
          </>
        )}
      </Footer>
    </div>
  )
}
