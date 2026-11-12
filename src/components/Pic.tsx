import { useState } from 'react'

/** File name of an illustration in public/pics/ (written by scripts/build-pictures.mjs). */
const fileFor = (emoji: string) =>
  [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((h) => h !== 'fe0f')
    .join('-')

export const picUrl = (emoji: string) => `/pics/${fileFor(emoji)}.svg`

/**
 * One illustration from the bundled picture set, so every device shows the same drawing.
 * If the file ever fails to load, the device's own emoji is shown instead: a picture is never blank.
 */
export function Pic({ e, size, className = '' }: { e: string; size: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed)
    return (
      <span className={className} style={{ fontSize: size * 0.86, lineHeight: 1 }} aria-hidden>
        {e}
      </span>
    )
  return (
    <img
      className={className}
      src={picUrl(e)}
      width={size}
      height={size}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
