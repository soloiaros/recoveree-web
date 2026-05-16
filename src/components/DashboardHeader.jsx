import { useAuth } from '../context/AuthContext.jsx';
import { displayName } from '../lib/recoveryStatus.js';
import Avatar from './Avatar.jsx';
import SymbolIcon from './SymbolIcon.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function DashboardHeader({
  teamName,
  coachProfile,
  theme,
  onThemeToggle,
}) {
  const { user, signOut } = useAuth();
  const profile = coachProfile ?? { email: user?.email };
  const name = displayName(profile, user?.email ?? '');

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-brand">
          <span className="brand-mark">
            <SymbolIcon name="spark" size={17} />
          </span>
          <span>{teamName ?? 'Recoveree'}</span>
        </div>
        <div className="app-header__user">
          <Avatar profile={profile} size={32} />
          <span title={user?.email}>{name}</span>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <button type="button" className="ghost" onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
