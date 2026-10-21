import type { ReactNode } from 'react'

// Hand-drawn pictures for words that have no good emoji. Same flat, round style as Pip.
export type ArtId = 'mat' | 'pat' | 'fat' | 'cot' | 'jug' | 'fan' | 'fig'

const art: Record<ArtId, ReactNode> = {
  jug: (
    <g>
      <ellipse cx="46" cy="90" rx="30" ry="5" fill="rgba(29,43,68,.12)" />
      <path d="M26 34h40q8 4 8 14v32q0 8-8 8H34q-8 0-8-8z" fill="#4cb5f5" />
      <path d="M26 34q0-12 20-12t20 12z" fill="#2f95d6" />
      <path d="M74 44q22 2 20 24t-20 14" stroke="#2f95d6" strokeWidth="9" fill="none" strokeLinecap="round" />
      <ellipse cx="44" cy="60" rx="12" ry="18" fill="#fff" opacity=".28" />
      <path d="M34 18q12-8 24 0" stroke="#2f95d6" strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  ),
  fan: (
    <g>
      <rect x="40" y="76" width="20" height="10" rx="4" fill="#52627d" />
      <rect x="46" y="58" width="8" height="22" fill="#52627d" />
      <circle cx="50" cy="38" r="32" fill="#e8f4ff" stroke="#52627d" strokeWidth="5" />
      <g fill="#4cb5f5">
        <path d="M50 38q-6-24 6-26q8 8-6 26z" />
        <path d="M50 38q22-10 28 2q-4 10-28-2z" />
        <path d="M50 38q-14 20-26 14q-2-10 26-14z" />
      </g>
      <circle cx="50" cy="38" r="6" fill="#52627d" />
    </g>
  ),
  fig: (
    <g>
      <ellipse cx="50" cy="92" rx="28" ry="5" fill="rgba(29,43,68,.12)" />
      <path d="M50 26q-26 6-26 38q0 24 26 28q26-4 26-28q0-32-26-38z" fill="#8a5cd0" />
      <path d="M50 26q-14 8-14 36q0 20 14 30q-18-4-18-30q0-26 18-36z" fill="#6f3fb8" opacity=".6" />
      <ellipse cx="62" cy="56" rx="6" ry="14" fill="#fff" opacity=".25" />
      <path d="M50 26q0-10 6-14" stroke="#5a8a2a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M56 14q16-8 22 4q-12 8-22-4z" fill="#6fcf3a" />
    </g>
  ),
  cot: (
    <g>
      <rect x="10" y="30" width="80" height="48" rx="8" fill="#ffe9b8" stroke="#d99a3a" strokeWidth="4" />
      <path d="M24 30v48M38 30v48M52 30v48M66 30v48M80 30v48" stroke="#d99a3a" strokeWidth="4" strokeLinecap="round" />
      <rect x="6" y="22" width="88" height="10" rx="5" fill="#d99a3a" />
      <rect x="6" y="74" width="88" height="9" rx="4.5" fill="#d99a3a" />
      <path d="M10 86v8M90 86v8" stroke="#a8701f" strokeWidth="6" strokeLinecap="round" />
      <path d="M16 56q14 -8 28 0t28 0t12 0v18H16Z" fill="#7cc4ff" opacity=".9" />
      <circle cx="30" cy="58" r="3" fill="#fff" opacity=".8" />
      <circle cx="58" cy="60" r="3" fill="#fff" opacity=".8" />
    </g>
  ),
  mat: (
    <g>
      <path d="M14 38 L86 38 L97 78 L3 78 Z" fill="#b8642c" />
      <path d="M20 44 L80 44 L89 72 L11 72 Z" fill="#f0a95e" />
      <path d="M26 50 L74 50 L80 66 L20 66 Z" fill="#c8773a" />
      <path d="M33 56 L67 56 L70 61 L30 61 Z" fill="#ffd993" />
      <path d="M8 78v9M20 78v9M32 78v9M44 78v9M56 78v9M68 78v9M80 78v9M92 78v9" stroke="#a85f2a" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  pat: (
    <g>
      <ellipse cx="50" cy="91" rx="30" ry="5" fill="rgba(29,43,68,.12)" />
      <circle cx="31" cy="52" r="9" fill="#f0b64a" />
      <circle cx="69" cy="52" r="9" fill="#f0b64a" />
      <circle cx="50" cy="68" r="25" fill="#ffd98a" />
      <circle cx="41" cy="68" r="3.6" fill="#1d2b44" />
      <circle cx="59" cy="68" r="3.6" fill="#1d2b44" />
      <circle cx="35" cy="76" r="4.5" fill="#ff9aa2" opacity=".7" />
      <circle cx="65" cy="76" r="4.5" fill="#ff9aa2" opacity=".7" />
      <path d="M44 77q6 6 12 0" stroke="#1d2b44" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <g transform="rotate(-10 50 28)">
        <ellipse cx="50" cy="30" rx="23" ry="12" fill="#ffc7a2" />
        <ellipse cx="29" cy="25" rx="7" ry="5" fill="#ffc7a2" />
      </g>
      <path d="M14 24q-5 6 0 12M86 24q5 6 0 12" stroke="#4cb5f5" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  fat: (
    <g>
      <path d="M20 42L24 12L44 30Z" fill="#ff9d4d" />
      <path d="M80 42L76 12L56 30Z" fill="#ff9d4d" />
      <path d="M26 34L27 22L36 31Z" fill="#ffb6bf" />
      <path d="M74 34L73 22L64 31Z" fill="#ffb6bf" />
      <ellipse cx="50" cy="62" rx="41" ry="32" fill="#ff9d4d" />
      <ellipse cx="50" cy="73" rx="27" ry="19" fill="#ffe3c2" />
      <path d="M44 33v8M50 31v10M56 33v8" stroke="#e0742b" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="37" cy="52" r="4.2" fill="#1d2b44" />
      <circle cx="63" cy="52" r="4.2" fill="#1d2b44" />
      <circle cx="38.4" cy="50.6" r="1.4" fill="#fff" />
      <circle cx="64.4" cy="50.6" r="1.4" fill="#fff" />
      <path d="M46 58h8l-4 5Z" fill="#ff7a8a" />
      <path d="M50 63q-4 5 -8 3M50 63q4 5 8 3" stroke="#1d2b44" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 60l-12-2M22 65l-12 3M78 60l12-2M78 65l12 3" stroke="#1d2b44" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="31" cy="93" rx="12" ry="6" fill="#ffe3c2" />
      <ellipse cx="69" cy="93" rx="12" ry="6" fill="#ffe3c2" />
    </g>
  ),
}

export function Art({ id, size }: { id: ArtId; size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {art[id]}
    </svg>
  )
}
