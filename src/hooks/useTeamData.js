import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * Loads a coach's roster, the linked athlete profiles, and their recovery logs.
 *
 * Returns:
 *   - athletes: Array<{ athleteId, email, full_name, avatar_url, role, latestLog }>
 *   - allLogs:  Array<recovery_log> across the entire team, newest first
 *   - loading, error, refresh()
 *
 * Data flow:
 *   team_roster (coach_id = X)
 *     -> athleteIds
 *        -> profiles (id IN ...)
 *        -> recovery_logs (athlete_id IN ..., ordered desc)
 */
export function useTeamData(coachId) {
  const [athletes, setAthletes] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
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
        setAllLogs([]);
        return;
      }

      const [profilesRes, logsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, role')
          .in('id', athleteIds),
        supabase
          .from('recovery_logs')
          .select('id, athlete_id, sleep_hours, recovery_score, ai_advice, created_at')
          .in('athlete_id', athleteIds)
          .order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (logsRes.error) throw logsRes.error;

      const logs = logsRes.data ?? [];
      const latestLogByAthlete = new Map();
      for (const log of logs) {
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
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          role: profile?.role ?? 'athlete',
          latestLog: latestLogByAthlete.get(athleteId) ?? null,
        };
      });

      setAthletes(merged);
      setAllLogs(logs);
    } catch (err) {
      setError(err.message ?? 'Failed to load team data.');
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { athletes, allLogs, loading, error, refresh };
}
