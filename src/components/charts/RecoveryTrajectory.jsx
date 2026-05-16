import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function transformRecoveryTrajectory(logs = []) {
  return [...logs]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((log) => ({
      date: formatChartDate(log.created_at),
      recovery: parseFiniteNumber(log.recovery_score),
      sleep: parseFiniteNumber(log.sleep_hours),
    }))
    .filter((point) => Number.isFinite(point.recovery) || Number.isFinite(point.sleep));
}

export default function RecoveryTrajectory({ logs = [] }) {
  const data = transformRecoveryTrajectory(logs);

  return (
    <div className="chart-card chart-card--trajectory">
      <div className="chart-card__header">
        <div>
          <p className="chart-eyebrow">Trend</p>
          <h2 className="section-title">Recovery Trajectory</h2>
        </div>
        <span className="chart-chip">{data.length} logs</span>
      </div>

      <div className="chart-stage chart-stage--compact" role="img" aria-label="Area chart of recovery score and sleep over time">
        {data.length === 0 ? (
          <div className="empty-state">No recovery trend yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 6, left: -16 }}>
              <defs>
                <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--separator)" strokeDasharray="4 8" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--separator)' }}
              />
              <YAxis
                yAxisId="score"
                domain={[0, 100]}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis yAxisId="sleep" orientation="right" domain={[0, 12]} hide />
              <Tooltip content={<TrajectoryTooltip />} />
              <Area
                yAxisId="score"
                type="monotone"
                dataKey="recovery"
                name="Recovery"
                stroke="var(--green)"
                strokeWidth={2}
                fill="url(#recoveryGradient)"
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                yAxisId="sleep"
                type="monotone"
                dataKey="sleep"
                name="Sleep"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function formatChartDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function parseFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function TrajectoryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const values = Object.fromEntries(payload.map((entry) => [entry.dataKey, entry.value]));

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>Recovery: {Number.isFinite(values.recovery) ? Math.round(values.recovery) : '—'}/100</span>
      <span>Sleep: {Number.isFinite(values.sleep) ? values.sleep.toFixed(1) : '—'}h</span>
    </div>
  );
}
