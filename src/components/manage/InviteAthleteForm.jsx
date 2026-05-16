import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import SymbolIcon from '../SymbolIcon.jsx';

/**
 * Adds an athlete to the coach's roster by email.
 *
 * The athlete must already have a Recoveree account (created in the iOS app)
 * — otherwise no `profiles` row exists for them and the FK on `team_roster`
 * would fail. We resolve the email to a profile id with a case-insensitive
 * lookup before inserting, so the FK error never surfaces to the coach.
 */
export default function InviteAthleteForm({ coachId, onAdded }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  async function resolveAthleteByEmail(rawEmail) {
    const normalized = rawEmail.trim().toLowerCase();
    if (!normalized) throw new Error("Enter the athlete's email address.");

    // `ilike` is case-insensitive. Supabase Auth lowercases emails on its end,
    // but `profiles.email` may have been written by the iOS app with arbitrary
    // casing, so we match defensively. Emails almost never contain `_` or `%`,
    // which would otherwise be treated as `ilike` wildcards.
    const { data, error: lookupError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .ilike('email', normalized)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!data) {
      throw new Error(
        `No Recoveree account found for "${normalized}". Ask the athlete to sign up in the iOS app first.`
      );
    }
    if (data.role === 'coach') {
      throw new Error(`"${normalized}" is registered as a coach, not an athlete.`);
    }
    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const athlete = await resolveAthleteByEmail(email);

      const { data: existing, error: existingError } = await supabase
        .from('team_roster')
        .select('id')
        .eq('coach_id', coachId)
        .eq('athlete_id', athlete.id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) throw new Error('That athlete is already on your roster.');

      const { error: insertError } = await supabase
        .from('team_roster')
        .insert({ coach_id: coachId, athlete_id: athlete.id });
      if (insertError) throw insertError;

      setInfo(`Added ${athlete.email ?? email.trim()} to your roster.`);
      setEmail('');
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
        Athletes must have a Recoveree account (created in the iOS app). Enter
        their email below to add them to your team.
      </p>

      <label htmlFor="athlete-email">Athlete email</label>
      <input
        id="athlete-email"
        type="email"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck="false"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="athlete@example.com"
        required
      />

      {error && (
        <p className="error state-message state-message--error" style={{ marginTop: 10 }}>
          <SymbolIcon name="cross" size={14} />
          {error}
        </p>
      )}
      {info && (
        <p className="success state-message state-message--success" style={{ marginTop: 10 }}>
          <SymbolIcon name="check" size={14} />
          {info}
        </p>
      )}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="primary" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden="true" />}
          {submitting ? 'Adding...' : 'Add to roster'}
        </button>
      </div>
    </form>
  );
}
