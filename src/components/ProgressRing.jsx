export function ProgressRing({ pct, size = 40, thickness = 4, color = '#c026d3', children }) {
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct * 3.6}deg, #ececec 0deg)`,
      }}
    >
      <div
        className="absolute flex items-center justify-center rounded-full bg-white text-xs font-semibold"
        style={{ inset: thickness }}
      >
        {children}
      </div>
    </div>
  )
}
