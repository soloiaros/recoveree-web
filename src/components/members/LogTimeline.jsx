import { formatDateTime } from '../../lib/recoveryStatus.js';

export default function LogTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return <div className="empty-state">No recovery logs yet for this athlete.</div>;
  }

  const top = logs.slice(0, 8);

  return (
    <div className="timeline">
      {top.map((log) => (
        <div key={log.id} className="timeline-item">
          <div className="timeline-item__date">{formatDateTime(log.created_at)}</div>
          <div className="timeline-item__body">
            <strong>Score {log.recovery_score ?? '—'}</strong> ·{' '}
            {log.sleep_hours ?? '—'}h sleep
            {log.ai_advice ? (
              <div className="muted" style={{ marginTop: 2 }}>{log.ai_advice}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
