import { useMemo, useState } from 'react'
import { shuffle } from './ui'

/** Sum a young child can't read or work out, so only grown-ups get through. */
export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [wrong, setWrong] = useState(false)
  const { a, b, options } = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4)
    const b = 5 + Math.floor(Math.random() * 4)
    const answer = a + b
    const decoys = new Set<number>()
    while (decoys.size < 3) {
      const d = answer + Math.floor(Math.random() * 7) - 3
      if (d !== answer && d > 0) decoys.add(d)
    }
    return { a, b, options: shuffle([answer, ...decoys]) }
  }, [])

  return (
    <div className="gate-backdrop" role="dialog" aria-label="Grown-ups only">
      <div className="gate">
        <h2>Grown-ups only</h2>
        <p>
          What is {a} + {b}?
        </p>
        <div className="gate-options">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              className="gate-option"
              onClick={() => (n === a + b ? onPass() : setWrong(true))}
            >
              {n}
            </button>
          ))}
        </div>
        {wrong && <p className="gate-wrong">Not quite. Try again.</p>}
        <button type="button" className="text-btn" onClick={onCancel}>
          Back
        </button>
      </div>
    </div>
  )
}
