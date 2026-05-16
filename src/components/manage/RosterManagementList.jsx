import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { emailToInitials } from '../../lib/recoveryStatus.js';
import SymbolIcon from '../SymbolIcon.jsx';

export default function RosterManagementList({ coachId, athletes, onChanged }) {
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleRemove(athleteId) {
    const ok = window.confirm(
      'Remove this athlete from your roster? Their recovery logs are not deleted.'
    );
    if (!ok) return;

    setError(null);
    setPendingId(athleteId);
    try {
      const { error: deleteError } = await supabase
        .from('team_roster')
        .delete()
        .eq('coach_id', coachId)
        .eq('athlete_id', athleteId);
      if (deleteError) throw deleteError;
      onChanged?.();
    } catch (err) {
      setError(err.message ?? 'Failed to remove athlete.');
    } finally {
      setPendingId(null);
    }
  }

  if (athletes.length === 0) {
    return (
      <div className="card empty-state">
        <div className="empty-state__icon">
          <SymbolIcon name="person" size={20} />
        </div>
        Your roster is empty. Use the form above to add an athlete.
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: 8 }}>Current roster</h3>
      {error && (
        <p className="error state-message state-message--error">
          <SymbolIcon name="cross" size={14} />
          {error}
        </p>
      )}
      <div>
        {athletes.map((athlete) => (
          <div key={athlete.athleteId} className="roster-row">
            <div className="row" style={{ minWidth: 0 }}>
              <div className="avatar" aria-hidden="true">
                {emailToInitials(athlete.email)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{athlete.email}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {athlete.athleteId}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="danger"
              onClick={() => handleRemove(athlete.athleteId)}
              disabled={pendingId === athlete.athleteId}
            >
              {pendingId === athlete.athleteId && <span className="spinner" aria-hidden="true" />}
              {pendingId === athlete.athleteId ? 'Removing...' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
