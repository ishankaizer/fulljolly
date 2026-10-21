import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GLYPH_H, GLYPH_W, LINES, strokes, strokeStarts } from '../data/glyphs'

const PER_STROKE = 1.0

/** Handwriting paper with the letter being written, stroke by stroke, in the order a child draws it. */
export function StrokeDemo({ letter, color, size = 200 }: { letter: string; color: string; size?: number }) {
  const [run, setRun] = useState(0)
  const list = strokes[letter] ?? []
  const starts = strokeStarts(letter)
  const total = list.length * PER_STROKE

  // Play again every few seconds, so the demonstration never just sits there.
  useEffect(() => {
    const t = window.setTimeout(() => setRun((r) => r + 1), (total + 2.2) * 1000)
    return () => window.clearTimeout(t)
  }, [run, total])

  return (
    <button type="button" className="stroke-demo" onClick={() => setRun((r) => r + 1)} aria-label={`Watch how to write ${letter} again`}>
      <svg viewBox={`0 0 ${GLYPH_W} ${GLYPH_H}`} width={size} height={size * (GLYPH_H / GLYPH_W)} aria-hidden>
        <g stroke="#cfe3f5" strokeWidth="1">
          <line x1="0" x2={GLYPH_W} y1={LINES.top} y2={LINES.top} />
          <line x1="0" x2={GLYPH_W} y1={LINES.middle} y2={LINES.middle} strokeDasharray="3 3" />
          <line x1="0" x2={GLYPH_W} y1={LINES.base} y2={LINES.base} stroke="#8ab4d8" />
          <line x1="0" x2={GLYPH_W} y1={LINES.bottom} y2={LINES.bottom} strokeDasharray="3 3" />
        </g>
        {list.map((d, i) => (
          <path key={`g${i}`} d={d} fill="none" stroke="#e3edf8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {list.map((d, i) => (
          <motion.path
            key={`${run}-${i}`}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * PER_STROKE, duration: PER_STROKE * 0.85, ease: 'easeInOut' }}
          />
        ))}
        {starts.map((p, i) => (
          <motion.g
            key={`${run}-d${i}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * PER_STROKE, duration: 0.2 }}
            style={{ originX: `${p.x}px`, originY: `${p.y}px` }}
          >
            <circle cx={p.x} cy={p.y} r="6" fill="#e5484d" />
            <text x={p.x} y={p.y + 2.8} fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700" fontFamily="sans-serif">
              {i + 1}
            </text>
          </motion.g>
        ))}
      </svg>
    </button>
  )
}
