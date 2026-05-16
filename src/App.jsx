import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <main>
        <p className="muted">Loading session...</p>
      </main>
    );
  }

  return session ? <DashboardPage /> : <AuthPage />;
}
