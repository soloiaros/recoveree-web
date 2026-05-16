import {
  classifyAthlete,
  emailToInitials,
  formatRelative,
} from '../../lib/recoveryStatus.js';
import StatusBadge from '../StatusBadge.jsx';

export default function AthleteCard({ athlete, onClick }) {
  const status = classifyAthlete(athlete);
  const log = athlete.latestLog;
  return (
    <button type="button" className="member-card" onClick={() => onClick(athlete)}>
      <div className="avatar" aria-hidden="true">{emailToInitials(athlete.email)}</div>
      <div className="member-card__body">
        <div className="member-card__email" title={athlete.email}>
          {athlete.email}
        </div>
        <div className="member-card__meta">
          <StatusBadge status={status} />
          {log && (
            <span className="muted" style={{ fontSize: 13 }}>
              Score {log.recovery_score ?? '—'}
            </span>
          )}
        </div>
        <div className="member-card__last">
          {log
            ? `Last log ${formatRelative(log.created_at)}`
            : 'No logs yet'}
        </div>
      </div>
    </button>
  );
}
