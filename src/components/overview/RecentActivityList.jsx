import { formatRelative } from '../../lib/recoveryStatus.js';
import SymbolIcon from '../SymbolIcon.jsx';

export default function RecentActivityList({ logs, athletes }) {
  const emailById = new Map(athletes.map((a) => [a.athleteId, a.email]));
  const recent = logs.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">
          <SymbolIcon name="activity" size={20} />
        </div>
        No recovery logs from your team yet.
      </div>
    );
  }

  return (
    <div>
      {recent.map((log) => (
        <div key={log.id} className="activity-row">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {emailById.get(log.athlete_id) ?? 'Athlete'}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              Score {log.recovery_score ?? '—'} · {log.sleep_hours ?? '—'}h sleep
            </div>
          </div>
          <div className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
            {formatRelative(log.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
