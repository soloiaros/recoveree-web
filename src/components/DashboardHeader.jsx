import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardHeader({ teamName }) {
  const { user, signOut } = useAuth();
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-brand">
          <span className="brand-mark">R</span>
          <span>{teamName ?? 'Recoveree'}</span>
        </div>
        <div className="app-header__user">
          <span>{user?.email}</span>
          <button type="button" className="ghost" onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
