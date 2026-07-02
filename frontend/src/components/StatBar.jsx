export default function StatBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="stat-bar">
      <div className="stat-bar-header">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value} / {max}</span>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
