import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Vowel, Word } from '../data/curriculum'
import { sfx } from '../lib/audio'
import { shownPart } from '../data/graphemes'
import { Art } from './art'
import { Pic } from './Pic'
import { Pip, type Mood } from './Pip'

export const vowelColor: Record<Vowel, string> = {
  a: '#ff6b5e',
  e: '#2fb86a',
  i: '#7c5cff',
  o: '#2e8bff',
  u: '#f29a12',
}

/** Vowel letters are drawn red. A combination (ai, oo, ar) counts as a vowel sound; qu and y do not. */
export const isVowel = (letter: string) => {
  const t = shownPart(letter)
  return t !== 'qu' && /[aeiou]/.test(t)
}

/** A chunky letter tile. Vowels are red, consonants navy, like a teacher's letter cards. */
export function LetterTile({
  letter,
  lit = false,
  dim = false,
  size = 'lg',
  onTap,
  ...rest
}: {
  letter: string
  lit?: boolean
  dim?: boolean
  size?: 'md' | 'lg'
  onTap?: () => void
} & Omit<HTMLMotionProps<'button'>, 'onTap'>) {
  return (
    <motion.button
      type="button"
      className={`tile tile-${size} ${isVowel(letter) ? 'tile-vowel' : ''} ${shownPart(letter).length > 1 ? 'tile-wide' : ''} ${lit ? 'tile-lit' : ''} ${dim ? 'tile-dim' : ''}`}
      whileTap={{ scale: 0.9, y: 4 }}
      animate={lit ? { scale: [1, 1.15, 1.06], y: -6 } : { scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      onClick={() => {
        sfx.tap()
        onTap?.()
      }}
      aria-label={shownPart(letter)}
      {...rest}
    >
      {shownPart(letter)}
    </motion.button>
  )
}

/** A letter tile that isn't a button, for use inside other buttons. */
export function StaticTile({ letter, size = 'lg' }: { letter: string; size?: 'md' | 'lg' }) {
  return (
    <span className={`tile tile-${size} ${isVowel(letter) ? 'tile-vowel' : ''} ${shownPart(letter).length > 1 ? 'tile-wide' : ''}`}>
      {shownPart(letter)}
    </span>
  )
}

/** The picture for a word: an illustration from the bundled set, hand-drawn art, or (last resort) the word itself on a card. */
export function Picture({ word, size = 160, caption = false }: { word: Word; size?: number; caption?: boolean }) {
  return (
    <div className="picture" style={{ width: size, height: caption ? size + size * 0.34 : size }}>
      {word.art ? (
        <Art id={word.art} size={size * 0.74} />
      ) : word.pic ? (
        <Pic e={word.pic} size={Math.round(size * 0.72)} className="picture-emoji" />
      ) : (
        <span className="picture-word" style={{ fontSize: size * 0.3 }}>
          {word.text}
        </span>
      )}
      {caption && <WordText text={word.text} size={size * 0.28} />}
    </div>
  )
}

/** Picture size that shrinks on short screens so a whole activity fits without scrolling. */
export const fit = (max: number, share = 0.22) => Math.round(Math.min(max, window.innerHeight * share))

export const hasPicture = (w: Word) => Boolean(w.pic || w.art)
export const pictureKey = (w: Word) => w.pic ?? w.art ?? w.text

/** A written word with the vowel picked out in red, like the letter tiles. */
export function WordText({ text, size = 30 }: { text: string; size?: number }) {
  return (
    <span className="word-text" style={{ fontSize: size }}>
      {text.split('').map((l, i) => (
        <b key={i} className={isVowel(l) ? 'v' : ''}>
          {l}
        </b>
      ))}
    </span>
  )
}

/** Bottom row of every activity: Pip on the left, the buttons on the right. */
export function Footer({ mood, children }: { mood: Mood; children?: ReactNode }) {
  return (
    <div className="activity-footer">
      <Pip mood={mood} size={fit(110, 0.15)} />
      <div className="footer-actions">{children}</div>
    </div>
  )
}

/** Big round button with a 3D press, used for next / replay / back. */
export function RoundButton({
  children,
  label,
  color = '#ffffff',
  onClick,
  pulse = false,
  className = '',
}: {
  children: ReactNode
  label: string
  color?: string
  onClick: () => void
  pulse?: boolean
  className?: string
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      className={`round-btn ${className}`}
      style={{ background: color }}
      whileTap={{ scale: 0.88, y: 4 }}
      animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={pulse ? { duration: 1.1, repeat: Infinity } : { type: 'spring', stiffness: 400 }}
      onClick={() => {
        sfx.pop()
        onClick()
      }}
    >
      {children}
    </motion.button>
  )
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const Icon = {
  tabAbc: (
    <svg viewBox="0 0 28 28" width="28" height="28" {...stroke}>
      <rect x="3.5" y="3.5" width="21" height="21" rx="6" />
      <path d="M9.5 19l4.5-10 4.5 10M11.2 15.5h5.6" />
    </svg>
  ),
  tabSounds: (
    <svg viewBox="0 0 28 28" width="28" height="28" {...stroke}>
      <path d="M4.5 11v6h4l5.5 4.5v-15L8.5 11z" fill="currentColor" fillOpacity=".18" />
      <path d="M18 10.5a5 5 0 010 7M21 7.5a9.5 9.5 0 010 13" />
    </svg>
  ),
  tabWords: (
    <svg viewBox="0 0 28 28" width="28" height="28" {...stroke}>
      <rect x="2.5" y="8" width="7" height="12" rx="2.5" />
      <rect x="10.5" y="8" width="7" height="12" rx="2.5" fill="currentColor" fillOpacity=".18" />
      <rect x="18.5" y="8" width="7" height="12" rx="2.5" />
    </svg>
  ),
  tabGames: (
    <svg viewBox="0 0 28 28" width="28" height="28" {...stroke}>
      <path d="M8.5 8h11a6 6 0 016 6v1.5a4.5 4.5 0 01-8.2 2.5h-6.6a4.5 4.5 0 01-8.2-2.5V14a6 6 0 016-6z" fill="currentColor" fillOpacity=".18" />
      <path d="M8.5 11.5v4M6.5 13.5h4" />
      <circle cx="19" cy="13.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  tabBooks: (
    <svg viewBox="0 0 28 28" width="28" height="28" {...stroke}>
      <path d="M14 7.5C11.5 5.8 8 5.3 4 6v14.5c4-.7 7.5-.2 10 1.5 2.5-1.7 6-2.2 10-1.5V6c-4-.7-7.5-.200-10 1.5z" fill="currentColor" fillOpacity=".18" />
      <path d="M14 7.5V22" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor" fillOpacity=".18" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </svg>
  ),
  unlock: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor" fillOpacity=".18" />
      <path d="M8 10.5V8a4 4 0 017.5-2" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="6" r="2.6" />
      <circle cx="18" cy="18" r="2.6" />
      <path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke} strokeWidth={3}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffc93c" stroke="#dfa200" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  hand: (
    <svg viewBox="0 0 48 48" width="44" height="44">
      <path d="M20 4a4 4 0 014 4v13l10.5 2.2A6 6 0 0139 29.1V34a10 10 0 01-10 10h-4.5a10 10 0 01-8-4L9 30.5a3.5 3.5 0 015.6-4.2L16 28V8a4 4 0 014-4z" fill="#fff" stroke="#1c2b4f" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5zM12 6.5v13" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h13M12 5l7 7-7 7" />
    </svg>
  ),
  speaker: (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10" />
    </svg>
  ),
  again: (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" />
    </svg>
  ),
}

export function Stars({ count, max = 3, size = 22 }: { count: number; max?: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size}>
          <path
            d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"
            fill={i < count ? '#ffc93c' : '#eadfc8'}
            stroke={i < count ? '#dfa200' : 'none'}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  )
}

/** Burst of confetti for a right answer or a finished lesson. */
export function Confetti({ pieces = 40 }: { pieces?: number }) {
  const colors = ['#ff6b5e', '#2fb86a', '#7c5cff', '#2e8bff', '#ffc93c', '#17b3a3']
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2 + Math.random() * 0.4
        const dist = 160 + Math.random() * 260
        return (
          <motion.span
            key={i}
            className="confetti-piece"
            style={{ background: colors[i % colors.length], borderRadius: i % 3 === 0 ? '50%' : 3 }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist + 220,
              opacity: 0,
              rotate: Math.random() * 720 - 360,
              scale: 1,
            }}
            transition={{ duration: 1.6 + Math.random() * 0.6, ease: [0.15, 0.7, 0.4, 1] }}
          />
        )
      })}
    </div>
  )
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
