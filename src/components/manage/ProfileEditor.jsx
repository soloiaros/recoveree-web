import { useEffect, useRef, useState } from 'react';
import Avatar from '../Avatar.jsx';
import SymbolIcon from '../SymbolIcon.jsx';

/**
 * Coach's own profile: display name + avatar image upload.
 *
 * Receives `profile` (read-only) and `onSave({ fullName, avatarFile })` from
 * `useCoachProfile`. The hook handles the actual storage upload + DB update;
 * this component is purely UI / form state.
 */
export default function ProfileEditor({ profile, onSave }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
  }, [profile?.full_name]);

  // Object URLs are local memory references — revoke them when we no longer
  // need the preview to avoid leaking on long sessions.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event) {
    const next = event.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await onSave({ fullName: fullName.trim(), avatarFile: file });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setInfo('Profile updated.');
      setTimeout(() => setInfo(null), 1800);
    } catch (err) {
      setError(err.message ?? 'Failed to save your profile.');
    } finally {
      setSubmitting(false);
    }
  }

  // The avatar in the form should reflect the staged change immediately even
  // before the upload finishes.
  const previewProfile = previewUrl
    ? { ...profile, avatar_url: previewUrl, full_name: fullName }
    : { ...profile, full_name: fullName };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>My profile</h3>
      <p className="muted" style={{ marginTop: 4 }}>
        Shown in the header and to your team. Your email stays the one you
        signed up with.
      </p>

      <div className="profile-editor__row">
        <Avatar profile={previewProfile} size={72} />
        <div className="profile-editor__fields">
          <div>
            <label htmlFor="profile-full-name">Full name</label>
            <input
              id="profile-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Coach Smith"
              maxLength={64}
            />
          </div>

          <div>
            <label htmlFor="profile-avatar">Avatar image</label>
            <input
              id="profile-avatar"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="file-input"
              onChange={handleFileChange}
            />
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {profile?.avatar_url
                ? 'Pick a new image to replace your current avatar.'
                : 'Optional. JPEG or PNG works best.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="error state-message state-message--error" style={{ marginTop: 12 }}>
          <SymbolIcon name="cross" size={14} />
          {error}
        </p>
      )}
      {info && (
        <p className="success state-message state-message--success" style={{ marginTop: 12 }}>
          <SymbolIcon name="check" size={14} />
          {info}
        </p>
      )}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="primary" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden="true" />}
          {submitting ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
