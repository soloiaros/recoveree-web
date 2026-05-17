import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import SymbolIcon from '../components/SymbolIcon.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function AuthPage({ theme, onThemeToggle }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const VISITOR_EMAIL = 'coach@test.com';
  const VISITOR_PASSWORD = '111111';

  async function handleVisitorLogin() {
    setError(null);
    setSubmitting(true);
    setEmail(VISITOR_EMAIL);
    setPassword(VISITOR_PASSWORD);
    try {
      await signIn(VISITOR_EMAIL, VISITOR_PASSWORD);
    } catch (err) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // Routing is handled by App.jsx watching session state.
    } catch (err) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-theme">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>

      <section className="auth-hero">
        <div className="brand-mark brand-mark--large">
          <SymbolIcon name="spark" size={24} />
        </div>
        <h1>Recoveree Coach</h1>
        <p className="muted-strong">
          {isLogin ? 'Log in to monitor team recovery.' : 'Create a coach account to monitor your team.'}
        </p>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="ghost"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 14px',
            }}
            onClick={handleVisitorLogin}
            disabled={submitting}
          >
            Log in with visitor&apos;s account
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <p className="error state-message state-message--error">
            <SymbolIcon name="cross" size={14} />
            {error}
          </p>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Working...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? 'signup' : 'login');
              setError(null);
            }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
          </button>
        </div>
      </form>
    </main>
  );
}
