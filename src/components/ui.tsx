import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Vowel, Word } from '../data/curriculum'
import { sfx } from '../lib/audio'
import { shownPart } from '../data/graphemes'
import { Art } from './art'
import { Pip, type Mood } from './Pip'

export const vowelColor: Record<Vowel, string> = {
  a: '#ff7a45',
  e: '#2fbf71',
  i: '#9b6bff',
  o: '#2f95d6',
  u: '#f2a900',
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

/** The picture for a word: emoji, hand-drawn art, or (last resort) the word itself on a card. */
export function Picture({ word, size = 160, caption = false }: { word: Word; size?: number; caption?: boolean }) {
  return (
    <div className="picture" style={{ width: size, height: caption ? size + size * 0.34 : size }}>
      {word.art ? (
        <Art id={word.art} size={size * 0.74} />
      ) : word.pic ? (
        <span className="picture-emoji" style={{ fontSize: size * 0.62 }}>
          {word.pic}
        </span>
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

export const Icon = {
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
            fill={i < count ? '#ffc93c' : 'rgba(0,0,0,.12)'}
            stroke={i < count ? '#e0a100' : 'none'}
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
  const colors = ['#ff7a45', '#2fbf71', '#9b6bff', '#2f95d6', '#ffc93c', '#ff6b9a']
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
