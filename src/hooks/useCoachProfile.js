import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AVATAR_BUCKET = 'avatars';

/**
 * Loads the current coach's row from `profiles` and exposes an `updateProfile`
 * helper that mirrors the upload-then-update pattern documented in the
 * project's reference snippet:
 *   1. Upload the file to the public `avatars` storage bucket.
 *   2. Resolve a public URL.
 *   3. Update the `profiles` row with the new `full_name` (and `avatar_url` if
 *      a new file was uploaded).
 *
 * Errors at any step are surfaced to the caller rather than silently swallowed.
 */
export function useCoachProfile(coachId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!coachId) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', coachId)
        .maybeSingle();
      if (fetchError) throw fetchError;
      setProfile(data ?? null);
    } catch (err) {
      setError(err.message ?? 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async ({ fullName, avatarFile }) => {
      if (!coachId) throw new Error('Not signed in.');

      let avatarUrl = null;

      if (avatarFile) {
        const ext = (avatarFile.name.split('.').pop() ?? 'png').toLowerCase();
        // Random suffix matches the reference snippet: it sidesteps caching
        // (every save returns a new public URL) at the cost of leaving stale
        // files in the bucket. Acceptable for the hackathon.
        const fileName = `${coachId}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(fileName, avatarFile, {
            contentType: avatarFile.type || undefined,
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) {
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(fileName);
        avatarUrl = publicUrlData?.publicUrl ?? null;
      }

      const updateData = { full_name: fullName?.trim() || null };
      if (avatarUrl) updateData.avatar_url = avatarUrl;

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', coachId)
        .select('id, email, full_name, avatar_url, role')
        .maybeSingle();
      if (updateError) throw updateError;

      if (data) setProfile(data);
      return data;
    },
    [coachId]
  );

  return { profile, loading, error, refresh, updateProfile };
}
