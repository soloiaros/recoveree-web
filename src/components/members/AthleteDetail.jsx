import { useEffect, useMemo, useState } from 'react';

import {
  classifyAthlete,
  displayName,
  formatRelative,
} from '../../lib/recoveryStatus.js';
import Avatar from '../Avatar.jsx';
import DailyBiometrics from '../charts/DailyBiometrics.jsx';
import RecoveryTrajectory from '../charts/RecoveryTrajectory.jsx';
import StatusBadge from '../StatusBadge.jsx';
import LogTimeline from './LogTimeline.jsx';
import FatigueMapCanvas from '../holomap/FatigueMapCanvas.jsx';
import { inferFatigueZonesFromAthlete } from '../holomap/fatigueZones.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabaseClient.js';

/**
 * The athlete detail view needs more horizontal room than the rest of the
 * dashboard to fit the 60/40 data + hologram split. We add the modifier on
 * the nearest <main class="app-main"> on mount and clean it up on unmount,
 * so the rest of the dashboard keeps its narrower track.
 */
function useWideMainShell() {
  useEffect(() => {
    const main = document.querySelector('main.app-main');
    if (!main) return undefined;
    main.classList.add('app-main--wide');
    return () => main.classList.remove('app-main--wide');
  }, []);
}

/**
 * Detailed view for a single athlete. We pull the timeline data from the
 * already-loaded `allLogs` (in useTeamData) instead of re-querying — keeps
 * navigation snappy and avoids extra round-trips.
 *
 * Layout: two-column grid — recovery data on the left, the 3D holographic
 * fatigue map on the right. Collapses to a single column on narrow screens.
 */
export default function AthleteDetail({ athlete, allLogs, onBack }) {
  useWideMainShell();
  const { user } = useAuth();

  const [isKudosCooldown, setIsKudosCooldown] = useState(false);
  const [isKudosAnimating, setIsKudosAnimating] = useState(false);

  const status = classifyAthlete(athlete);
  const logs = allLogs.filter((l) => l.athlete_id === athlete.athleteId);
  const latest = athlete.latestLog;

  const severeFatigue = useMemo(() => {
    if (latest?.muscle_fatigue?.length > 0) return latest.muscle_fatigue;
    return inferFatigueZonesFromAthlete(athlete);
  }, [athlete, latest]);

  const mildFatigue = useMemo(() => {
    const raw = latest?.mild_muscle_fatigue_mild;
    return Array.isArray(raw) ? raw : [];
  }, [latest]);

  const handleSendKudos = async () => {
    if (isKudosCooldown) return;

    setIsKudosAnimating(true);
    setIsKudosCooldown(true);

    try {
      const { error } = await supabase.from('kudos').insert({
        athlete_id: athlete.athleteId,
        coach_id: user?.id,
      });
      if (error) throw error;
    } catch (err) {
      console.error('[AthleteDetail] Failed to send kudos:', err);
    }

    // Stop animation quickly, but keep cooldown for 3s
    setTimeout(() => setIsKudosAnimating(false), 500);
    setTimeout(() => setIsKudosCooldown(false), 3000);
  };

  return (
    <div>
      <button type="button" className="detail-back" onClick={onBack}>
        ← Members
      </button>

      <div className="athlete-detail-grid">
        <div className="athlete-detail-main">
          <div className="card">
            <div className="detail-header">
              <Avatar profile={athlete} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ wordBreak: 'break-word' }}>{displayName(athlete)}</h2>
                {athlete.full_name && athlete.email && athlete.full_name !== athlete.email && (
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                    {athlete.email}
                  </div>
                )}
                <div style={{ marginTop: 6 }} className="row">
                  <StatusBadge status={status} />
                  {latest && (
                    <span className="muted" style={{ fontSize: 13 }}>
                      Updated {formatRelative(latest.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-stats">
              <div className="kv-card">
                <div className="kv-card__label">Recovery score</div>
                <div className="kv-card__value">
                  {latest?.recovery_score ?? '—'}
                </div>
              </div>
              <div className="kv-card">
                <div className="kv-card__label">Sleep (hours)</div>
                <div className="kv-card__value">
                  {latest?.sleep_hours ?? '—'}
                </div>
              </div>
              <div className="kv-card">
                <div className="kv-card__label">Logs on file</div>
                <div className="kv-card__value">{logs.length}</div>
              </div>
              <button
                type="button"
                className={`kudos-button ${isKudosAnimating ? 'animating' : ''}`}
                onClick={handleSendKudos}
                disabled={isKudosCooldown}
                title="Send Kudos"
              >
                🎉
              </button>
            </div>

            <div className="kv-card advice-card">
              <div className="kv-card__label" style={{ color: 'var(--accent)' }}>
                Current AI advice
              </div>
              <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.45 }}>
                {latest?.ai_advice ?? 'No advice generated yet.'}
              </div>
            </div>
          </div>

          <div className="athlete-chart-grid section">
            <RecoveryTrajectory logs={logs} />
            <DailyBiometrics log={latest} />
          </div>

          <div className="card section">
            <h3 style={{ marginBottom: 12 }}>Log timeline</h3>
            <LogTimeline logs={logs} />
          </div>
        </div>

        <aside className="athlete-detail-aside">
          <div className="holomap-float" aria-label="Holographic fatigue map">
            <div className="holomap-float__stage">
              <FatigueMapCanvas
                athleteId={athlete.athleteId}
                severeFatigue={severeFatigue}
                mildFatigue={mildFatigue}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
