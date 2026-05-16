import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';

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
    <main>
      <h1>Recoveree | Coach Dashboard</h1>
      <p className="muted">
        {isLogin ? 'Log in to your coach account.' : 'Create a coach account to monitor your team.'}
      </p>

      <form className="card" onSubmit={handleSubmit}>
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

        {error && <p className="error">{error}</p>}

        <div className="row" style={{ marginTop: 8 }}>
          <button type="submit" disabled={submitting}>
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
