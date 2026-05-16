export default function StatCard({ label, value, total, color, icon }) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="row-between">
        <div className="stat-card__icon" aria-hidden="true">
          {icon}
        </div>
        <span className="muted" style={{ fontSize: 12 }}>
          {total > 0 ? `${Math.round(ratio * 100)}%` : '—'}
        </span>
      </div>
      <div>
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
      </div>
      <div className="stat-card__bar" aria-hidden="true">
        <div
          className="stat-card__bar-fill"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
