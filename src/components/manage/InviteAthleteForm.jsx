import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Adds an athlete to the coach's roster.
 *
 * Note: there is no Supabase email-based invite flow for the hackathon, so the
 * athlete must already exist in `profiles` (e.g. they signed up via the iOS
 * app). The coach can paste the athlete's email or UUID and we resolve to the
 * profile row before inserting into `team_roster`.
 */
export default function InviteAthleteForm({ coachId, onAdded }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  async function resolveAthleteId(rawInput) {
    const input = rawInput.trim();
    if (!input) throw new Error('Enter an athlete email or UUID.');

    if (UUID_REGEX.test(input)) return input;

    const { data, error: lookupError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', input)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!data) throw new Error(`No athlete found with email "${input}".`);
    if (data.role && data.role !== 'athlete') {
      throw new Error(`Profile "${input}" has role "${data.role}", expected "athlete".`);
    }
    return data.id;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const athleteId = await resolveAthleteId(value);

      const { data: existing, error: existingError } = await supabase
        .from('team_roster')
        .select('id')
        .eq('coach_id', coachId)
        .eq('athlete_id', athleteId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) throw new Error('That athlete is already on your roster.');

      const { error: insertError } = await supabase
        .from('team_roster')
        .insert({ coach_id: coachId, athlete_id: athleteId });
      if (insertError) throw insertError;

      setInfo('Athlete added to your roster.');
      setValue('');
      onAdded?.();
    } catch (err) {
      setError(err.message ?? 'Failed to add athlete.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Invite athlete</h3>
      <p className="muted" style={{ marginTop: 4, marginBottom: 12 }}>
        Athletes need a Recoveree account first (created in the iOS app). Paste
        their email or profile UUID to add them to your team.
      </p>

      <label htmlFor="athlete-input">Email or UUID</label>
      <input
        id="athlete-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="athlete@example.com or 0a1b2c3d-…"
        required
      />

      {error && <p className="error" style={{ marginTop: 10 }}>{error}</p>}
      {info && <p className="success" style={{ marginTop: 10 }}>{info}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add to roster'}
        </button>
      </div>
    </form>
  );
}
