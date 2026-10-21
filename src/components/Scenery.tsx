/** Sunny meadow behind every screen: sun, hills, trees and flowers. Purely decorative. */
export function Scenery() {
  return (
    <div className="scenery" aria-hidden>
      <svg className="sun" viewBox="0 0 120 120">
        <g className="sun-rays" stroke="#ffd34d" strokeWidth="7" strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M60 6v14" transform={`rotate(${i * 30} 60 60)`} />
          ))}
        </g>
        <circle cx="60" cy="60" r="30" fill="#ffe27a" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="#ffc93c" strokeWidth="4" />
        <circle cx="50" cy="56" r="3" fill="#b7791f" />
        <circle cx="70" cy="56" r="3" fill="#b7791f" />
        <path d="M50 68q10 9 20 0" stroke="#b7791f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </svg>

      <svg className="hills" viewBox="0 0 1000 220" preserveAspectRatio="none">
        <path d="M0 110C140 40 300 50 460 105S780 165 1000 80V220H0Z" fill="#a8e68f" />
        <path d="M0 165C200 115 380 135 560 165S860 185 1000 145V220H0Z" fill="#76d36f" />
        <path d="M0 200C250 170 500 190 1000 175V220H0Z" fill="#5cc460" />
      </svg>

      <span className="deco deco-tree" style={{ left: '3%', fontSize: 78 }}>🌳</span>
      <span className="deco deco-tree" style={{ right: '3%', fontSize: 64 }}>🌲</span>
      <span className="deco" style={{ left: '22%', fontSize: 26 }}>🌼</span>
      <span className="deco" style={{ left: '41%', fontSize: 22 }}>🌷</span>
      <span className="deco" style={{ left: '63%', fontSize: 28 }}>🌼</span>
      <span className="deco" style={{ left: '80%', fontSize: 22 }}>🌸</span>
      <span className="deco deco-bee" style={{ left: '30%', fontSize: 24 }}>🐝</span>
    </div>
  )
}
