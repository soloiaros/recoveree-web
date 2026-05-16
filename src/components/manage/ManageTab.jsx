import SymbolIcon from '../SymbolIcon.jsx';
import ProfileEditor from './ProfileEditor.jsx';
import TeamNameEditor from './TeamNameEditor.jsx';
import InviteAthleteForm from './InviteAthleteForm.jsx';
import RosterManagementList from './RosterManagementList.jsx';

export default function ManageTab({
  coachId,
  athletes,
  teamName,
  onTeamNameChange,
  onRosterChange,
  coachProfile,
  onCoachProfileSave,
}) {
  return (
    <div className="section stack page-panel" style={{ gap: 16 }}>
      <h1 className="section-title">
        <SymbolIcon name="grid" size={22} />
        Manage
      </h1>

      <ProfileEditor profile={coachProfile} onSave={onCoachProfileSave} />
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
