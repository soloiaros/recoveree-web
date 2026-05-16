import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h1>Coach Dashboard</h1>
        <span className="muted">Signed in as {user?.email}</span>
      </div>
      <button type="button" onClick={() => signOut()}>Log out</button>
    </header>
  );
}
