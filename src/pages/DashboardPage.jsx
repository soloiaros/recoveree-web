import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTeamData } from '../hooks/useTeamData.js';
import { useTeamName } from '../hooks/useTeamName.js';
import DashboardHeader from '../components/DashboardHeader.jsx';
import PillNavBar from '../components/PillNavBar.jsx';
import OverviewTab from '../components/overview/OverviewTab.jsx';
import MembersTab from '../components/members/MembersTab.jsx';
import ManageTab from '../components/manage/ManageTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'manage', label: 'Manage' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const coachId = user?.id;

  const { athletes, allLogs, loading, error, refresh } = useTeamData(coachId);
  const { teamName, setTeamName } = useTeamName(coachId);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app-shell">
      <DashboardHeader teamName={teamName} />

      <PillNavBar tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <main className="app-main">
        {error && (
          <div className="card section" role="alert">
            <p className="error" style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewTab
            teamName={teamName}
            athletes={athletes}
            allLogs={allLogs}
            loading={loading}
            onRefresh={refresh}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab athletes={athletes} allLogs={allLogs} />
        )}

        {activeTab === 'manage' && (
          <ManageTab
            coachId={coachId}
            athletes={athletes}
            teamName={teamName}
            onTeamNameChange={setTeamName}
            onRosterChange={refresh}
          />
        )}
      </main>
    </div>
  );
}
