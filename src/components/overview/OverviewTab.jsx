import { STATUS, summarizeTeam } from '../../lib/recoveryStatus.js';
import ReadinessMatrix from '../charts/ReadinessMatrix.jsx';
import TeamStrainRadar from '../charts/TeamStrainRadar.jsx';
import SymbolIcon from '../SymbolIcon.jsx';
import StatCard from './StatCard.jsx';
import RecentActivityList from './RecentActivityList.jsx';

export default function OverviewTab({ teamName, athletes, allLogs, loading, onRefresh }) {
  const summary = summarizeTeam(athletes);

  return (
    <div className="page-panel">
      <div className="row-between section">
        <div>
          <h1>Good {greetingForHour()}.</h1>
          <p className="muted-strong" style={{ marginTop: 4 }}>
            Here's how {teamName} is recovering today.
          </p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="ghost refresh-button">
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && athletes.length === 0 ? (
        <div className="stat-grid section" aria-label="Loading team recovery summary">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : (
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
      )}

      <div className="analytics-grid section">
        <ReadinessMatrix athletes={athletes} />
        <TeamStrainRadar athletes={athletes} logs={allLogs} />
      </div>

      <div className="card section">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h2 className="section-title">
            <SymbolIcon name="activity" size={18} />
            Recent activity
          </h2>
          <span className="muted" style={{ fontSize: 13 }}>
            {summary.total} {summary.total === 1 ? 'athlete' : 'athletes'} ·{' '}
            {summary.unknown > 0 ? `${summary.unknown} without data` : 'all logged in'}
          </span>
        </div>
        {loading && allLogs.length === 0 ? (
          <div className="skeleton-stack" aria-label="Loading recent activity">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : (
          <RecentActivityList logs={allLogs} athletes={athletes} />
        )}
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
