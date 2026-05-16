import { useCallback, useEffect, useState } from 'react';

/**
 * Persists the team name in localStorage, scoped per coach.
 *
 * The DB schema doesn't have a `teams` table for the hackathon, so we keep this
 * client-side. When that table is added, swap this hook for a Supabase-backed
 * one with the same signature.
 */
export function useTeamName(coachId) {
  const storageKey = coachId ? `recoveree.teamName.${coachId}` : null;
  const [teamName, setTeamNameState] = useState('My Team');

  useEffect(() => {
    if (!storageKey) return;
    const stored = window.localStorage.getItem(storageKey);
    setTeamNameState(stored && stored.trim() ? stored : 'My Team');
  }, [storageKey]);

  const setTeamName = useCallback(
    (next) => {
      const value = (next ?? '').trim() || 'My Team';
      setTeamNameState(value);
      if (storageKey) window.localStorage.setItem(storageKey, value);
    },
    [storageKey]
  );

  return { teamName, setTeamName };
}
