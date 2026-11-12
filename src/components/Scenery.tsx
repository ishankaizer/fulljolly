/** Calm paper backdrop behind every screen: soft shapes in the school's colours. Purely decorative. */
export function Scenery() {
  return (
    <div className="scenery" aria-hidden>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <circle cx="940" cy="80" r="170" fill="#ffc93c" opacity=".2" />
        <circle cx="30" cy="960" r="220" fill="#17b3a3" opacity=".1" />
        <circle cx="960" cy="900" r="120" fill="#ff6b5e" opacity=".1" />
        <circle cx="60" cy="140" r="90" fill="#7c5cff" opacity=".08" />
      </svg>
    </div>
  )
}
