import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './hooks/useTheme.js';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const { session, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <main className="loading-shell">
        <p className="muted">Loading session...</p>
      </main>
    );
  }

  return session ? (
    <DashboardPage theme={theme} onThemeToggle={toggleTheme} />
  ) : (
    <AuthPage theme={theme} onThemeToggle={toggleTheme} />
  );
}
