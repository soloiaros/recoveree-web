import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export function transformDailyBiometrics(log) {
  if (!log) return [];

  const sleepHours = Number(log.sleep_hours);
  const recovery = Number(log.recovery_score);
  const sleepTarget = Number.isFinite(sleepHours) ? (sleepHours / 8) * 100 : 0;

  return [
    { name: 'Sleep Target', value: clamp(sleepTarget), fill: 'var(--accent)' },
    { name: 'Recovery', value: clamp(recovery), fill: 'var(--green)' },
    { name: 'Readiness Buffer', value: clamp((clamp(recovery) + clamp(sleepTarget)) / 2), fill: 'var(--orange)' },
  ];
}

export default function DailyBiometrics({ log }) {
  const data = transformDailyBiometrics(log);

  return (
    <div className="chart-card chart-card--biometrics">
      <div className="chart-card__header">
        <div>
          <p className="chart-eyebrow">Latest Log</p>
          <h2 className="section-title">Daily Biometrics</h2>
        </div>
      </div>

      <div className="chart-stage chart-stage--compact" role="img" aria-label="Radial bar chart of latest athlete biometrics">
        {data.length === 0 ? (
          <div className="empty-state">No biometric snapshot yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              innerRadius="38%"
              outerRadius="96%"
              startAngle={90}
              endAngle={-270}
              barSize={13}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <Tooltip content={<BiometricTooltip />} />
              <RadialBar dataKey="value" background={{ fill: 'var(--bg-muted)' }} cornerRadius={999} />
            </RadialBarChart>
          </ResponsiveContainer>
        )}
      </div>

      {data.length > 0 ? (
        <div className="biometric-legend">
          {data.map((item) => (
            <span key={item.name}>
              <i style={{ background: item.fill }} />
              {item.name}: {item.value}%
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function clamp(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function BiometricTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{point.name}</strong>
      <span>{point.value}% of target</span>
    </div>
  );
}
