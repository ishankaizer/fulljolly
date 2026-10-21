// How to write each letter: the strokes, in the order and direction a child draws them.
// Every path lives on a 100 x 120 page with four handwriting lines:
//   y=18 top (capitals, tall letters)   y=48 middle   y=84 baseline   y=108 bottom (g j p q y)
// The first point of each path is where the pen starts, so the numbered dots sit there.

export const GLYPH_W = 100
export const GLYPH_H = 120
export const LINES = { top: 18, middle: 48, base: 84, bottom: 108 }

// The round part of a, d, g and q: start near the top right, go round anticlockwise.
const ROUND = 'M66 56 C60 46 46 44 38 54 C30 64 34 80 46 83 C56 85 64 78 66 66'
// The loop of O and Q.
const OVAL = 'M50 18 C30 18 22 36 22 51 C22 66 30 84 50 84 C70 84 78 66 78 51 C78 36 70 18 50 18'
// The bowl of P, B and R.
const BOWL = 'M30 18 H50 C76 18 76 54 50 54 H30'
// The curve of C and G.
const CURVE = 'M76 30 C68 20 58 17 48 18 C30 20 22 36 22 51 C22 66 30 82 48 84'

export const strokes: Record<string, string[]> = {
  A: ['M50 18 L24 84', 'M50 18 L76 84', 'M34 62 L66 62'],
  B: ['M30 18 L30 84', 'M30 18 H50 C74 18 74 51 50 51 H30', 'M30 51 H54 C82 51 82 84 54 84 H30'],
  C: [`${CURVE} C60 85 70 79 77 69`],
  D: ['M30 18 L30 84', 'M30 18 H46 C74 18 78 40 78 51 C78 62 74 84 46 84 H30'],
  E: ['M30 18 L30 84', 'M30 18 H72', 'M30 51 H64', 'M30 84 H72'],
  F: ['M30 18 L30 84', 'M30 18 H72', 'M30 51 H62'],
  G: [`${CURVE} C64 86 78 76 78 58`, 'M54 58 H78'],
  H: ['M30 18 L30 84', 'M72 18 L72 84', 'M30 51 H72'],
  I: ['M50 18 L50 84', 'M38 18 H62', 'M38 84 H62'],
  J: ['M62 18 L62 66 C62 78 54 86 44 84 C34 82 29 75 28 66'],
  K: ['M30 18 L30 84', 'M72 18 L30 58', 'M44 45 L74 84'],
  L: ['M30 18 L30 84', 'M30 84 H72'],
  M: ['M24 84 L24 18', 'M24 18 L50 60 L76 18', 'M76 18 L76 84'],
  N: ['M28 84 L28 18', 'M28 18 L72 84', 'M72 84 L72 18'],
  O: [OVAL],
  P: ['M30 18 L30 84', BOWL],
  Q: [OVAL, 'M56 66 L80 90'],
  R: ['M30 18 L30 84', BOWL, 'M48 54 L76 84'],
  S: ['M72 28 C66 18 50 14 38 20 C24 28 32 42 50 48 C68 54 78 64 70 76 C62 88 44 88 28 76'],
  T: ['M24 18 H76', 'M50 18 L50 84'],
  U: ['M26 18 V62 C26 78 36 86 50 86 C64 86 74 78 74 62 V18'],
  V: ['M24 18 L50 84 L76 18'],
  W: ['M18 18 L34 84 L50 36 L66 84 L82 18'],
  X: ['M26 18 L74 84', 'M74 18 L26 84'],
  Y: ['M26 18 L50 52', 'M74 18 L50 52 L50 84'],
  Z: ['M26 18 H74 L26 84 H74'],

  a: [ROUND, 'M66 48 L66 84'],
  b: ['M32 18 L32 84', 'M32 62 C38 50 50 46 58 52 C70 60 70 76 58 82 C48 88 38 84 32 74'],
  c: ['M68 58 C62 48 50 45 42 52 C32 60 32 76 42 82 C52 88 64 84 68 74'],
  d: [ROUND, 'M66 18 L66 84'],
  e: ['M32 66 H68 C68 52 58 46 48 47 C36 49 30 62 32 72 C34 82 46 88 56 84 C62 82 66 78 68 74'],
  f: ['M62 24 C56 16 44 16 42 26 L42 84', 'M30 48 H60'],
  g: [ROUND, 'M66 48 L66 94 C66 106 54 108 42 102'],
  h: ['M32 18 L32 84', 'M32 62 C38 50 52 46 60 54 C68 62 66 74 66 84'],
  i: ['M50 48 L50 84', 'M50 32 L50 33'],
  j: ['M50 48 L50 98 C50 106 42 108 34 104', 'M50 32 L50 33'],
  k: ['M32 18 L32 84', 'M64 48 L32 68', 'M44 62 L66 84'],
  l: ['M50 18 L50 84'],
  m: ['M26 48 L26 84', 'M26 62 C30 50 46 46 50 58 L50 84', 'M50 60 C54 50 70 46 74 58 L74 84'],
  n: ['M34 48 L34 84', 'M34 62 C38 50 52 46 60 54 C68 62 66 74 66 84'],
  o: ['M50 46 C34 46 30 62 30 66 C30 78 38 86 50 86 C62 86 70 78 70 66 C70 58 64 46 50 46'],
  p: ['M34 48 L34 108', 'M34 62 C40 50 52 46 60 52 C72 60 70 76 58 82 C48 88 38 84 34 74'],
  q: [ROUND, 'M66 48 L66 108'],
  r: ['M38 48 L38 84', 'M38 62 C42 52 52 46 62 50'],
  s: ['M64 54 C58 46 44 44 38 50 C32 58 42 64 50 66 C60 68 68 74 62 82 C56 90 40 88 32 80'],
  t: ['M46 28 L46 78 C46 86 54 88 62 84', 'M32 48 H62'],
  u: ['M32 48 V72 C32 84 44 88 54 84 C60 82 64 78 66 72', 'M66 48 L66 84'],
  v: ['M30 48 L50 84 L70 48'],
  w: ['M24 48 L36 84 L50 56 L64 84 L76 48'],
  x: ['M32 48 L68 84', 'M68 48 L32 84'],
  y: ['M32 48 L50 84', 'M68 48 L46 100 C42 108 36 108 30 104'],
  z: ['M32 48 H68 L32 84 H68'],
}

/** Where each stroke begins, for the numbered dots. A dot that would sit on top of an earlier one is nudged down. */
export function strokeStarts(letter: string): { x: number; y: number }[] {
  const placed: { x: number; y: number }[] = []
  for (const d of strokes[letter] ?? []) {
    const m = d.match(/^M\s*([\d.]+)\s+([\d.]+)/)!
    const p = { x: Number(m[1]), y: Number(m[2]) }
    while (placed.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 13)) p.y += 12
    placed.push(p)
  }
  return placed
}
