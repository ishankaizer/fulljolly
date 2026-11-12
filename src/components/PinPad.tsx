import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { checkPin, hasPin, setPin, unlockTeacher } from '../lib/teacher'
import { Icon } from './ui'

/**
 * The teacher's door. First time: choose a 4-digit PIN (typed twice). After that: enter it.
 * "Forgot your PIN?" asks a sum too hard for a young child, then lets a grown-up choose a new PIN.
 */
export function PinPad({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [mode, setMode] = useState<'enter' | 'create' | 'confirm' | 'forgot'>(hasPin() ? 'enter' : 'create')
  const [digits, setDigits] = useState('')
  const [first, setFirst] = useState('')
  const [shake, setShake] = useState(0)
  const [note, setNote] = useState('')
  const sum = useMemo(() => {
    const a = 31 + Math.floor(Math.random() * 40)
    const b = 27 + Math.floor(Math.random() * 40)
    return { a, b }
  }, [])

  const title = { enter: 'Teacher mode', create: 'Choose a 4-digit PIN', confirm: 'Type the PIN again', forgot: 'Reset the PIN' }[mode]
  const help = {
    enter: 'Enter your PIN.',
    create: 'Only you will know it. You will use it each time you open teacher mode.',
    confirm: 'One more time to be sure.',
    forgot: `What is ${sum.a} + ${sum.b}?`,
  }[mode]
  const length = mode === 'forgot' ? 3 : 4

  const wrong = (message: string) => {
    setNote(message)
    setDigits('')
    setShake((n) => n + 1)
  }

  useEffect(() => {
    if (digits.length < length) return
    void (async () => {
      if (mode === 'enter') {
        if (await checkPin(digits)) {
          unlockTeacher()
          onPass()
        } else wrong('Not quite. Try again.')
      } else if (mode === 'create') {
        setFirst(digits)
        setDigits('')
        setNote('')
        setMode('confirm')
      } else if (mode === 'confirm') {
        if (digits === first) {
          await setPin(digits)
          unlockTeacher()
          onPass()
        } else {
          setMode('create')
          wrong('Those did not match. Start again.')
        }
      } else if (digits === String(sum.a + sum.b)) {
        setDigits('')
        setNote('')
        setMode('create')
      } else wrong('Not quite. Try again.')
    })()
  }, [digits])

  const press = (d: string) => setDigits((cur) => (cur.length < length ? cur + d : cur))

  return (
    <div className="gate-backdrop" role="dialog" aria-label={title}>
      <div className="gate pin">
        <h2>{title}</h2>
        <p className="pin-help">{help}</p>
        <motion.div key={shake} className="pin-dots" animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.35 }}>
          {Array.from({ length }, (_, i) => (
            <span key={i} className={i < digits.length ? 'pin-dot pin-dot-on' : 'pin-dot'} />
          ))}
        </motion.div>
        <p className="pin-note" role="status">
          {note}
        </p>
        <div className="pin-keys">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" className="pin-key" onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="pin-key pin-key-quiet" onClick={onCancel} aria-label="Cancel">
            {Icon.close}
          </button>
          <button type="button" className="pin-key" onClick={() => press('0')}>
            0
          </button>
          <button type="button" className="pin-key pin-key-quiet" onClick={() => setDigits((d) => d.slice(0, -1))} aria-label="Delete">
            {Icon.back}
          </button>
        </div>
        {mode === 'enter' && (
          <button type="button" className="pin-link" onClick={() => { setMode('forgot'); setDigits(''); setNote('') }}>
            Forgot your PIN?
          </button>
        )}
      </div>
    </div>
  )
}
