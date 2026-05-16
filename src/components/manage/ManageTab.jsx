import TeamNameEditor from './TeamNameEditor.jsx';
import InviteAthleteForm from './InviteAthleteForm.jsx';
import RosterManagementList from './RosterManagementList.jsx';

export default function ManageTab({
  coachId,
  athletes,
  teamName,
  onTeamNameChange,
  onRosterChange,
}) {
  return (
    <div className="section stack" style={{ gap: 16 }}>
      <h1>Manage</h1>

      <TeamNameEditor teamName={teamName} onSave={onTeamNameChange} />
      <InviteAthleteForm coachId={coachId} onAdded={onRosterChange} />
      <RosterManagementList
        coachId={coachId}
        athletes={athletes}
        onChanged={onRosterChange}
      />
    </div>
  );
}
