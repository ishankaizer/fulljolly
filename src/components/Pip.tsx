import { motion } from 'framer-motion'

export type Mood = 'idle' | 'talk' | 'cheer' | 'think'

/** Pip, the little bird who guides the lessons. */
export function Pip({ mood = 'idle', size = 140 }: { mood?: Mood; size?: number }) {
  const body = {
    idle: { y: [0, -4, 0], rotate: 0, transition: { duration: 2.4, repeat: Infinity } },
    talk: { y: [0, -3, 0], rotate: [0, -2, 2, 0], transition: { duration: 0.6, repeat: Infinity } },
    cheer: { y: [0, -26, 0], rotate: [0, -8, 8, 0], transition: { duration: 0.55, repeat: 3 } },
    think: { y: 0, rotate: -8, transition: { type: 'spring' as const, stiffness: 120 } },
  }[mood]

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      animate={body}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {/* shadow */}
      <ellipse cx="100" cy="190" rx="52" ry="7" fill="rgba(20,60,110,.18)" />
      {/* feet */}
      <path d="M80 176 l-6 10 M80 176 l2 11 M80 176 l9 9" stroke="#f08a24" strokeWidth="5" strokeLinecap="round" />
      <path d="M120 176 l-9 9 M120 176 l-2 11 M120 176 l6 10" stroke="#f08a24" strokeWidth="5" strokeLinecap="round" />
      {/* tuft */}
      <path d="M96 34 q-6 -22 8 -26 q-2 12 6 18 q4 -12 16 -10 q-12 8 -10 20 z" fill="#ff6b6b" />
      {/* body */}
      <ellipse cx="100" cy="110" rx="74" ry="72" fill="#4cb5f5" />
      <ellipse cx="100" cy="128" rx="48" ry="46" fill="#fff6dc" />
      {/* wings */}
      <motion.path
        d="M30 110 q-24 10 -18 38 q20 -2 30 -22 z"
        fill="#2f95d6"
        animate={mood === 'cheer' ? { rotate: [0, -30, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3, repeat: mood === 'cheer' ? 6 : 0 }}
        style={{ originX: 1, originY: 0.1 }}
      />
      <motion.path
        d="M170 110 q24 10 18 38 q-20 -2 -30 -22 z"
        fill="#2f95d6"
        animate={mood === 'cheer' ? { rotate: [0, 30, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3, repeat: mood === 'cheer' ? 6 : 0 }}
        style={{ originX: 0, originY: 0.1 }}
      />
      {/* eyes */}
      <g>
        <circle cx="76" cy="82" r="20" fill="#fff" />
        <circle cx="124" cy="82" r="20" fill="#fff" />
        <circle cx={mood === 'think' ? 80 : 78} cy={mood === 'think' ? 76 : 85} r="10" fill="#1d2b44" />
        <circle cx={mood === 'think' ? 128 : 126} cy={mood === 'think' ? 76 : 85} r="10" fill="#1d2b44" />
        <circle cx="82" cy="80" r="3.5" fill="#fff" />
        <circle cx="130" cy="80" r="3.5" fill="#fff" />
        {/* blink */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 0, 1, 0] }}
          transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
        >
          <ellipse cx="76" cy="82" rx="21" ry="21" fill="#4cb5f5" />
          <ellipse cx="124" cy="82" rx="21" ry="21" fill="#4cb5f5" />
        </motion.g>
      </g>
      {/* cheeks */}
      <circle cx="58" cy="108" r="8" fill="#ff9aa2" opacity=".7" />
      <circle cx="142" cy="108" r="8" fill="#ff9aa2" opacity=".7" />
      {/* beak */}
      <motion.path
        d="M88 100 q12 -8 24 0 q-12 14 -24 0 z"
        fill="#ffb52e"
        animate={mood === 'talk' || mood === 'cheer' ? { scaleY: [1, 1.5, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.25, repeat: mood === 'talk' || mood === 'cheer' ? Infinity : 0 }}
        style={{ originY: 0 }}
      />
    </motion.svg>
  )
}
