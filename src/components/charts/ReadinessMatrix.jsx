import {
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SLEEP_THRESHOLD = 7;
const RECOVERY_THRESHOLD = 70;

export function transformReadinessData({ athletes = [], latestLogs = [] } = {}) {
  const rows = athletes.length > 0
    ? athletes.map((athlete) => ({
        athleteId: athlete.athleteId,
        athleteEmail: athlete.email,
        ...athlete.latestLog,
      }))
    : latestLogs;

  return rows
    .map((log) => ({
      name: log.athleteEmail ?? log.email ?? log.profile?.email ?? log.profiles?.email ?? 'Unknown athlete',
      sleep: Number(log.sleep_hours),
      recovery: Number(log.recovery_score),
      athleteId: log.athlete_id ?? log.athleteId,
    }))
    .filter((point) => Number.isFinite(point.sleep) && Number.isFinite(point.recovery));
}

export default function ReadinessMatrix({ athletes = [], latestLogs = [] }) {
  const data = transformReadinessData({ athletes, latestLogs });

  return (
    <div className="chart-card chart-card--matrix">
      <div className="chart-card__header">
        <div>
          <p className="chart-eyebrow">Team Overview</p>
          <h2 className="section-title">Readiness Matrix</h2>
        </div>
        <span className="chart-chip">{data.length} live points</span>
      </div>

      <div className="chart-stage" role="img" aria-label="Scatter chart of sleep hours against recovery score">
        {data.length === 0 ? (
          <div className="empty-state">No recovery logs yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 18, bottom: 18, left: -8 }}>
              <ReferenceArea x1={SLEEP_THRESHOLD} x2={12} y1={RECOVERY_THRESHOLD} y2={100} fill="#30d158" fillOpacity={0.12} />
              <ReferenceArea x1={0} x2={SLEEP_THRESHOLD} y1={0} y2={RECOVERY_THRESHOLD} fill="#ff453a" fillOpacity={0.12} />
              <ReferenceArea x1={SLEEP_THRESHOLD} x2={12} y1={0} y2={RECOVERY_THRESHOLD} fill="#ffd60a" fillOpacity={0.11} />
              <ReferenceArea x1={0} x2={SLEEP_THRESHOLD} y1={RECOVERY_THRESHOLD} y2={100} fill="#64d2ff" fillOpacity={0.1} />

              <CartesianGrid stroke="var(--separator)" strokeDasharray="4 8" />
              <XAxis
                dataKey="sleep"
                domain={[0, 12]}
                name="Sleep"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--separator)' }}
                label={{ value: 'Sleep hours', position: 'insideBottom', offset: -10, fill: 'var(--text-tertiary)', fontSize: 12 }}
              />
              <YAxis
                dataKey="recovery"
                domain={[0, 100]}
                name="Recovery"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--separator)' }}
                label={{ value: 'Recovery', angle: -90, position: 'insideLeft', fill: 'var(--text-tertiary)', fontSize: 12 }}
              />
              <Tooltip cursor={{ stroke: 'var(--accent)', strokeDasharray: '4 4' }} content={<ReadinessTooltip />} />
              <Scatter data={data} shape={<ReadinessDot />} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="matrix-legend" aria-hidden="true">
        <span><i className="legend-dot legend-dot--safe" />Safe</span>
        <span><i className="legend-dot legend-dot--danger" />Danger</span>
        <span><i className="legend-dot legend-dot--warning" />Warning</span>
        <span><i className="legend-dot legend-dot--anomaly" />Anomaly</span>
      </div>
    </div>
  );
}

function ReadinessDot({ cx, cy }) {
  if (cx == null || cy == null) return null;

  return (
    <circle cx={cx} cy={cy} r={5.5} fill="var(--accent)" stroke="var(--bg-elevated)" strokeWidth="2" />
  );
}

function ReadinessTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{point.name}</strong>
      <span>Sleep: {point.sleep.toFixed(1)}h</span>
      <span>Recovery: {Math.round(point.recovery)}/100</span>
    </div>
  );
}
