import { useEffect, useState } from 'react';
import { displayName, personInitials } from '../lib/recoveryStatus.js';

/**
 * Renders an avatar image when `profile.avatar_url` is set, falling back to
 * gradient initials derived from `profile.full_name` (or email).
 *
 * `profile` accepts any of:
 *   - The coach profile shape: { full_name, email, avatar_url, ... }
 *   - The athlete shape from useTeamData: { full_name, email, avatar_url, ... }
 *   - null/undefined: renders a generic "?" placeholder.
 */
export default function Avatar({ profile, size = 44, className = '' }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [profile?.avatar_url]);

  const url = profile?.avatar_url;
  const alt = displayName(profile, 'Avatar');
  const baseStyle = {
    width: size,
    height: size,
    fontSize: Math.max(11, Math.round(size * 0.36)),
  };

  if (url && !errored) {
    return (
      <img
        src={url}
        alt={alt}
        className={`avatar avatar--image ${className}`.trim()}
        style={baseStyle}
        onError={() => setErrored(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`avatar avatar--initials ${className}`.trim()}
      style={baseStyle}
      role="img"
      aria-label={alt}
    >
      {personInitials(profile)}
    </div>
  );
}
