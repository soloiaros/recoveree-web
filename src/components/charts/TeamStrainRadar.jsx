import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const DEMO_STRAIN = [
  { subject: 'CNS', A: 80 },
  { subject: 'Hamstrings', A: 45 },
  { subject: 'Hydration', A: 90 },
  { subject: 'Sleep Debt', A: 64 },
  { subject: 'Joint Load', A: 52 },
  { subject: 'Mood', A: 58 },
];

export function transformTeamStrainData({ athletes = [], logs = [] } = {}) {
  const sourceLogs = logs.length > 0
    ? logs
    : athletes.map((athlete) => athlete.latestLog).filter(Boolean);

  if (sourceLogs.length === 0) return DEMO_STRAIN;

  const averageRecovery = average(sourceLogs.map((log) => Number(log.recovery_score)));
  const averageSleep = average(sourceLogs.map((log) => Number(log.sleep_hours)));
  const adviceText = sourceLogs.map((log) => log.ai_advice ?? '').join(' ').toLowerCase();
  const recoveryLoad = 100 - averageRecovery;

  return [
    { subject: 'CNS', A: clamp(34 + recoveryLoad * 0.65 + keywordBoost(adviceText, ['cns', 'neural', 'fatigue', 'overload'])) },
    { subject: 'Hamstrings', A: clamp(38 + recoveryLoad * 0.25 + keywordBoost(adviceText, ['hamstring', 'strain', 'sprint', 'posterior'])) },
    { subject: 'Hydration', A: clamp(44 + keywordBoost(adviceText, ['hydrate', 'hydration', 'fluid', 'electrolyte']) + (averageSleep < 6 ? 12 : 0)) },
    { subject: 'Sleep Debt', A: clamp(32 + Math.max(0, 8 - averageSleep) * 17 + recoveryLoad * 0.2) },
    { subject: 'Joint Load', A: clamp(36 + recoveryLoad * 0.28 + keywordBoost(adviceText, ['knee', 'ankle', 'hip', 'joint', 'pain'])) },
    { subject: 'Mood', A: clamp(35 + recoveryLoad * 0.3 + keywordBoost(adviceText, ['stress', 'mood', 'mental', 'focus'])) },
  ];
}

export default function TeamStrainRadar({ athletes = [], logs = [] }) {
  const data = transformTeamStrainData({ athletes, logs });

  return (
    <div className="chart-card chart-card--radar">
      <div className="chart-card__header">
        <div>
          <p className="chart-eyebrow">Fatigue Scanner</p>
          <h2 className="section-title">Team Strain Radar</h2>
        </div>
        <span className="chart-chip chart-chip--hot">AI signal</span>
      </div>

      <div className="chart-stage" role="img" aria-label="Radar chart of aggregate team fatigue areas">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%" margin={{ top: 6, right: 26, bottom: 6, left: 26 }}>
            <defs>
              <radialGradient id="strainRadarGlow" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.24" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.04" />
              </radialGradient>
            </defs>
            <PolarGrid stroke="var(--separator)" radialLines />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<StrainTooltip />} />
            <Radar
              dataKey="A"
              name="Strain"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#strainRadarGlow)"
              fillOpacity={1}
              dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function keywordBoost(text, keywords) {
  return keywords.reduce((boost, keyword) => (
    text.includes(keyword) ? boost + 14 : boost
  ), 0);
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function StrainTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>Fatigue load: {payload[0].value}/100</span>
    </div>
  );
}
