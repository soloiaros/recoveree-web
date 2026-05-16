import { useAuth } from '../context/AuthContext.jsx';
import { useTeamData } from '../hooks/useTeamData.js';
import AddAthleteForm from '../components/AddAthleteForm.jsx';
import AthleteTable from '../components/AthleteTable.jsx';
import DashboardHeader from '../components/DashboardHeader.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { athletes, loading, error, refresh } = useTeamData(user?.id);

  return (
    <main>
      <DashboardHeader />

      <AddAthleteForm coachId={user?.id} onAdded={refresh} />

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Your team</h2>
          <button type="button" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div style={{ marginTop: 12 }}>
          <AthleteTable athletes={athletes} />
        </div>
      </section>
    </main>
  );
}
