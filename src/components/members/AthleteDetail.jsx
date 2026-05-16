import {
  classifyAthlete,
  emailToInitials,
  formatRelative,
} from '../../lib/recoveryStatus.js';
import StatusBadge from '../StatusBadge.jsx';
import LogTimeline from './LogTimeline.jsx';

/**
 * Detailed view for a single athlete. We pull the timeline data from the
 * already-loaded `allLogs` (in useTeamData) instead of re-querying — keeps
 * navigation snappy and avoids extra round-trips.
 */
export default function AthleteDetail({ athlete, allLogs, onBack }) {
  const status = classifyAthlete(athlete);
  const logs = allLogs.filter((l) => l.athlete_id === athlete.athleteId);
  const latest = athlete.latestLog;

  return (
    <div>
      <button type="button" className="detail-back" onClick={onBack}>
        ← Members
      </button>

      <div className="card">
        <div className="detail-header">
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }} aria-hidden="true">
            {emailToInitials(athlete.email)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ wordBreak: 'break-all' }}>{athlete.email}</h2>
            <div style={{ marginTop: 6 }} className="row">
              <StatusBadge status={status} />
              {latest && (
                <span className="muted" style={{ fontSize: 13 }}>
                  Updated {formatRelative(latest.created_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-stats">
          <div className="kv-card">
            <div className="kv-card__label">Recovery score</div>
            <div className="kv-card__value">{latest?.recovery_score ?? '—'}</div>
          </div>
          <div className="kv-card">
            <div className="kv-card__label">Sleep (hours)</div>
            <div className="kv-card__value">{latest?.sleep_hours ?? '—'}</div>
          </div>
          <div className="kv-card">
            <div className="kv-card__label">Logs on file</div>
            <div className="kv-card__value">{logs.length}</div>
          </div>
        </div>

        <div className="kv-card advice-card">
          <div className="kv-card__label" style={{ color: 'var(--accent)' }}>
            Current AI advice
          </div>
          <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.45 }}>
            {latest?.ai_advice ?? 'No advice generated yet.'}
          </div>
        </div>
      </div>

      <div className="card section">
        <h3 style={{ marginBottom: 12 }}>Log timeline</h3>
        <LogTimeline logs={logs} />
      </div>
    </div>
  );
}
