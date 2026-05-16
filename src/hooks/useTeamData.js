import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * Loads the coach's roster, the linked athlete profiles, and their recovery logs.
 * Returns a flat array of athletes, each augmented with their latest recovery log.
 *
 * Data flow:
 *   team_roster (filter by coach_id)
 *     -> athlete_id list
 *        -> profiles (athlete_id, email, role)
 *        -> recovery_logs (athlete_id, ordered by created_at desc)
 */
export function useTeamData(coachId) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!coachId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: rosterRows, error: rosterError } = await supabase
        .from('team_roster')
        .select('id, athlete_id')
        .eq('coach_id', coachId);
      if (rosterError) throw rosterError;

      const athleteIds = (rosterRows ?? []).map((r) => r.athlete_id);
      if (athleteIds.length === 0) {
        setAthletes([]);
        return;
      }

      const [profilesRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('id, email, role').in('id', athleteIds),
        supabase
          .from('recovery_logs')
          .select('id, athlete_id, sleep_hours, recovery_score, ai_advice, created_at')
          .in('athlete_id', athleteIds)
          .order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (logsRes.error) throw logsRes.error;

      const latestLogByAthlete = new Map();
      for (const log of logsRes.data ?? []) {
        // Logs are pre-sorted desc, so the first one we see per athlete is the newest.
        if (!latestLogByAthlete.has(log.athlete_id)) {
          latestLogByAthlete.set(log.athlete_id, log);
        }
      }

      const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));

      const merged = athleteIds.map((athleteId) => {
        const profile = profileById.get(athleteId);
        return {
          athleteId,
          email: profile?.email ?? '(unknown email)',
          role: profile?.role ?? 'athlete',
          latestLog: latestLogByAthlete.get(athleteId) ?? null,
        };
      });

      setAthletes(merged);
    } catch (err) {
      setError(err.message ?? 'Failed to load team data.');
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { athletes, loading, error, refresh };
}
