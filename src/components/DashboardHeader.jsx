import { useAuth } from '../context/AuthContext.jsx';
import SymbolIcon from './SymbolIcon.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function DashboardHeader({ teamName, theme, onThemeToggle }) {
  const { user, signOut } = useAuth();
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
          <span>{user?.email}</span>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <button type="button" className="ghost" onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
