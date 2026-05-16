function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatNumber(value, suffix = '') {
  if (value === null || value === undefined) return '—';
  return `${value}${suffix}`;
}

export default function AthleteTable({ athletes }) {
  if (athletes.length === 0) {
    return (
      <p className="muted">
        No athletes on your roster yet. Add one above to start seeing recovery data.
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Athlete</th>
          <th>Recovery score</th>
          <th>Sleep (hrs)</th>
          <th>AI advice</th>
          <th>Last log</th>
        </tr>
      </thead>
      <tbody>
        {athletes.map((athlete) => {
          const log = athlete.latestLog;
          return (
            <tr key={athlete.athleteId}>
              <td>
                <div>{athlete.email}</div>
                <div className="muted" style={{ fontSize: 11 }}>{athlete.athleteId}</div>
              </td>
              <td>{formatNumber(log?.recovery_score)}</td>
              <td>{formatNumber(log?.sleep_hours)}</td>
              <td style={{ maxWidth: 320 }}>{log?.ai_advice ?? '—'}</td>
              <td>{formatDate(log?.created_at)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
