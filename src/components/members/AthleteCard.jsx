import {
  classifyAthlete,
  displayName,
  formatRelative,
} from '../../lib/recoveryStatus.js';
import Avatar from '../Avatar.jsx';
import StatusBadge from '../StatusBadge.jsx';

export default function AthleteCard({ athlete, onClick }) {
  const status = classifyAthlete(athlete);
  const log = athlete.latestLog;
  const name = displayName(athlete);
  const showEmailSubtext = athlete.full_name && athlete.email && athlete.full_name !== athlete.email;

  return (
    <button type="button" className="member-card" onClick={() => onClick(athlete)}>
      <Avatar profile={athlete} />
      <div className="member-card__body">
        <div className="member-card__email" title={athlete.email}>
          {name}
        </div>
        {showEmailSubtext && (
          <div
            className="muted"
            style={{
              fontSize: 12,
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={athlete.email}
          >
            {athlete.email}
          </div>
        )}
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
