import { useState } from 'react';
import AthleteCard from './AthleteCard.jsx';
import AthleteDetail from './AthleteDetail.jsx';

export default function MembersTab({ athletes, allLogs }) {
  const [selectedId, setSelectedId] = useState(null);

  const selected = selectedId
    ? athletes.find((a) => a.athleteId === selectedId) ?? null
    : null;

  if (selected) {
    return (
      <AthleteDetail
        athlete={selected}
        allLogs={allLogs}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="section">
      <div className="row-between" style={{ marginBottom: 16 }}>
        <h1>Members</h1>
        <span className="muted" style={{ fontSize: 13 }}>
          {athletes.length} {athletes.length === 1 ? 'athlete' : 'athletes'}
        </span>
      </div>

      {athletes.length === 0 ? (
        <div className="card empty-state">
          You haven't added any athletes yet. Switch to the Manage tab to invite some.
        </div>
      ) : (
        <div className="member-grid">
          {athletes.map((athlete) => (
            <AthleteCard
              key={athlete.athleteId}
              athlete={athlete}
              onClick={() => setSelectedId(athlete.athleteId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
