const ROSTER_STATES = {
  optimal: {
    label: 'Optimal',
    color: '#34c759',
  },
  warning: {
    label: 'Warning',
    color: '#ff9500',
  },
  danger: {
    label: 'Danger',
    color: '#ff3b30',
  },
  unknown: {
    label: 'No data',
    color: '#8e8e93',
  },
};

export function getAthleteReadinessState(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 'unknown';
  if (value >= 80) return 'optimal';
  if (value >= 60) return 'warning';
  return 'danger';
}

export default function TeamStatusRoster({ athletes = [], loading = false, onAthleteSelect }) {
  return (
    <section className="card team-status-roster" aria-label="Team status roster">
      {loading && athletes.length === 0 ? (
        <div className="team-status-roster__rail" aria-label="Loading team status roster">
          <div className="team-status-skeleton" />
          <div className="team-status-skeleton" />
          <div className="team-status-skeleton" />
          <div className="team-status-skeleton" />
        </div>
      ) : athletes.length === 0 ? (
        <div className="empty-state">No athletes on the roster yet.</div>
      ) : (
        <div className="team-status-roster__rail" aria-label="Team readiness silhouettes">
          {athletes.map((athlete) => {
            const score = athlete.latestLog?.recovery_score;
            const state = getAthleteReadinessState(score);
            const title = `${athlete.email}: ${Number.isFinite(Number(score)) ? `${score}/100` : 'No recovery score'}`;
            const label = displayNameForAthlete(athlete.email);

            return (
              <button
                key={athlete.athleteId}
                type="button"
                className="team-status-action"
                aria-label={`Open ${label}'s athlete page`}
                onClick={() => onAthleteSelect?.(athlete.athleteId)}
              >
                <PersonStatusIcon state={state} title={title} />
                <span className="team-status-tooltip">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PersonStatusIcon({ state, title }) {
  const config = ROSTER_STATES[state] ?? ROSTER_STATES.unknown;

  return (
    <svg
      className="team-status-icon"
      fill="none"
      role="img"
      stroke={config.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{ '--status-color': config.color }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <circle cx="12" cy="4.25" r="2.25" />
      <path d="M4.75 9.25 12 7.25l7.25 2" />
      <path d="M12 7.25v6" />
      <path d="M8.25 21 12 13.25 15.75 21" />
      <path d="M7.25 13.25h9.5" />
    </svg>
  );
}

function displayNameForAthlete(email = '') {
  const prefix = email.split('@')[0] || 'Athlete';
  const firstToken = prefix.split(/[._\-+]/).filter(Boolean)[0] ?? prefix;
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
}
