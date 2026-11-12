import { motion } from 'framer-motion'

export type Mood = 'idle' | 'talk' | 'cheer' | 'think' | 'proud' | 'cheerUp'

const YELLOW = '#ffc93c'
const YELLOW_DEEP = '#f2ae14'
const NAVY = '#1c2b4f'

/**
 * Pip, the school's little yellow bird, who guides every lesson.
 * idle: breathing and blinking. talk: beak moves. cheer: jumps with wings up.
 * think: looks up, head tilted. proud: eyes shut in a big smile. cheerUp: a kind, encouraging look.
 */
export function Pip({ mood = 'idle', size = 140 }: { mood?: Mood; size?: number }) {
  const body = {
    idle: { y: [0, -4, 0], rotate: 0, transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const } },
    talk: { y: [0, -3, 0], rotate: [0, -2, 2, 0], transition: { duration: 0.6, repeat: Infinity } },
    cheer: { y: [0, -30, 0], rotate: [0, -6, 6, 0], transition: { duration: 0.55, repeat: 3 } },
    think: { y: 0, rotate: -7, transition: { type: 'spring' as const, stiffness: 120 } },
    proud: { y: [0, -6, 0], rotate: [0, 3, -3, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const } },
    cheerUp: { y: [0, -3, 0], rotate: 4, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const } },
  }[mood]

  const happyEyes = mood === 'cheer' || mood === 'proud'
  const wingsUp = mood === 'cheer'
  const beakOpen = mood === 'talk' || mood === 'cheer'
  const look = mood === 'think' ? { x: 3, y: -7 } : mood === 'cheerUp' ? { x: 0, y: 2 } : { x: 0, y: 0 }

  return (
    <motion.svg viewBox="0 0 200 200" width={size} height={size} animate={body} style={{ overflow: 'visible', flex: 'none' }} aria-hidden>
      <ellipse cx="100" cy="190" rx="50" ry="6" fill="rgba(28,43,79,.12)" />
      {/* feet */}
      <g stroke="#ff8a1f" strokeWidth="6" strokeLinecap="round">
        <path d="M80 174v10M80 184l-8 4M80 184l8 4" />
        <path d="M120 174v10M120 184l-8 4M120 184l8 4" />
      </g>
      {/* tail */}
      <path d="M160 132q26-6 28-28q-20 2-34 16z" fill={YELLOW_DEEP} />
      {/* wings (behind the body when down) */}
      <motion.path
        d="M36 104q-24 16-14 44q22-4 30-26z"
        fill={YELLOW_DEEP}
        animate={wingsUp ? { rotate: [0, 70, 50, 70] } : mood === 'proud' ? { rotate: 14 } : { rotate: 0 }}
        transition={{ duration: 0.45, repeat: wingsUp ? 4 : 0 }}
        style={{ originX: 0.9, originY: 0.05 }}
      />
      <motion.path
        d="M164 104q24 16 14 44q-22-4-30-26z"
        fill={YELLOW_DEEP}
        animate={wingsUp ? { rotate: [0, -70, -50, -70] } : mood === 'proud' ? { rotate: -14 } : { rotate: 0 }}
        transition={{ duration: 0.45, repeat: wingsUp ? 4 : 0 }}
        style={{ originX: 0.1, originY: 0.05 }}
      />
      {/* tuft, in the red of the school crest */}
      <path d="M92 40q-10-20 2-30q4 10 10 14q2-12 14-14q-4 12 0 22q8-8 18-4q-12 6-14 18z" fill="#e8483f" />
      {/* body */}
      <ellipse cx="100" cy="112" rx="72" ry="70" fill={YELLOW} />
      <path d="M32 132a72 70 0 00136 0a76 60 0 01-136 0z" fill={YELLOW_DEEP} opacity=".55" />
      <ellipse cx="100" cy="136" rx="42" ry="36" fill="#fff3c9" />
      {/* cheeks */}
      <circle cx="54" cy="112" r="9" fill="#ff8f86" opacity=".75" />
      <circle cx="146" cy="112" r="9" fill="#ff8f86" opacity=".75" />
      {/* eyes */}
      {happyEyes ? (
        <g stroke={NAVY} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M62 90q13-15 26 0" />
          <path d="M112 90q13-15 26 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="75" cy="86" rx="19" ry="21" fill="#fff" />
          <ellipse cx="125" cy="86" rx="19" ry="21" fill="#fff" />
          <motion.g animate={look} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
            <circle cx="78" cy="89" r="10.5" fill={NAVY} />
            <circle cx="122" cy="89" r="10.5" fill={NAVY} />
            <circle cx="82" cy="84" r="3.6" fill="#fff" />
            <circle cx="126" cy="84" r="3.6" fill="#fff" />
          </motion.g>
          {/* blink */}
          <motion.g
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 1, 0] }}
            transition={{ duration: 4.2, times: [0, 0.93, 0.965, 1], repeat: Infinity }}
            style={{ originY: 0.1 }}
          >
            <ellipse cx="75" cy="86" rx="20" ry="22" fill={YELLOW} />
            <ellipse cx="125" cy="86" rx="20" ry="22" fill={YELLOW} />
          </motion.g>
          {mood === 'cheerUp' && (
            <g stroke={NAVY} strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M58 62q12-7 24-2" />
              <path d="M142 62q-12-7-24-2" />
            </g>
          )}
        </g>
      )}
      {/* beak */}
      <path d="M86 104q14-9 28 0q-4 9-14 9t-14-9z" fill="#ff8a1f" />
      <motion.path
        d="M88 106q12 6 24 0q-3 12-12 12t-12-12z"
        fill="#e86f0c"
        animate={beakOpen ? { scaleY: [0.5, 1.6, 0.5] } : { scaleY: mood === 'proud' ? 1.2 : 0.5 }}
        transition={{ duration: 0.26, repeat: beakOpen ? Infinity : 0 }}
        style={{ originY: 0 }}
      />
    </motion.svg>
  )
}
