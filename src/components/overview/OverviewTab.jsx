import { STATUS, summarizeTeam } from '../../lib/recoveryStatus.js';
import StatCard from './StatCard.jsx';
import RecentActivityList from './RecentActivityList.jsx';

export default function OverviewTab({ teamName, athletes, allLogs, loading, onRefresh }) {
  const summary = summarizeTeam(athletes);

  return (
    <div>
      <div className="row-between section">
        <div>
          <h1>Good {greetingForHour()}.</h1>
          <p className="muted-strong" style={{ marginTop: 4 }}>
            Here's how {teamName} is recovering today.
          </p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="ghost">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="stat-grid section">
        <StatCard
          label="Need recovery"
          value={summary.needsRecovery}
          total={summary.total}
          color={STATUS.needsRecovery.color}
          icon={STATUS.needsRecovery.icon}
        />
        <StatCard
          label="Injury recovery"
          value={summary.injured}
          total={summary.total}
          color={STATUS.injured.color}
          icon={STATUS.injured.icon}
        />
        <StatCard
          label="Fully rested"
          value={summary.rested}
          total={summary.total}
          color={STATUS.rested.color}
          icon={STATUS.rested.icon}
        />
      </div>

      <div className="card section">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h2>Recent activity</h2>
          <span className="muted" style={{ fontSize: 13 }}>
            {summary.total} {summary.total === 1 ? 'athlete' : 'athletes'} ·{' '}
            {summary.unknown > 0 ? `${summary.unknown} without data` : 'all logged in'}
          </span>
        </div>
        <RecentActivityList logs={allLogs} athletes={athletes} />
      </div>
    </div>
  );
}

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
