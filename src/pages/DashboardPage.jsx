import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTeamData } from '../hooks/useTeamData.js';
import { useTeamName } from '../hooks/useTeamName.js';
import DashboardHeader from '../components/DashboardHeader.jsx';
import PillNavBar from '../components/PillNavBar.jsx';
import SymbolIcon from '../components/SymbolIcon.jsx';
import OverviewTab from '../components/overview/OverviewTab.jsx';
import MembersTab from '../components/members/MembersTab.jsx';
import ManageTab from '../components/manage/ManageTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'activity' },
  { id: 'members', label: 'Members', icon: 'person' },
  { id: 'manage', label: 'Manage', icon: 'grid' },
];

export default function DashboardPage({ theme, onThemeToggle }) {
  const { user } = useAuth();
  const coachId = user?.id;

  const { athletes, allLogs, loading, error, refresh } = useTeamData(coachId);
  const { teamName, setTeamName } = useTeamName(coachId);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app-shell">
      <DashboardHeader
        teamName={teamName}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      <PillNavBar tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <main className="app-main">
        {error && (
          <div className="card section" role="alert">
            <p className="error state-message state-message--error" style={{ margin: 0 }}>
              <SymbolIcon name="cross" size={14} />
              {error}
            </p>
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
