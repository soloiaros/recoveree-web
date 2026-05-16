import { useEffect, useState } from 'react';

export default function TeamNameEditor({ teamName, onSave }) {
  const [draft, setDraft] = useState(teamName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(teamName);
  }, [teamName]);

  function handleSubmit(event) {
    event.preventDefault();
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Team name</h3>
      <p className="muted" style={{ marginTop: 4, marginBottom: 12 }}>
        Shown in the header. Stored locally on this device for the hackathon build.
      </p>

      <label htmlFor="team-name-input">Name</label>
      <input
        id="team-name-input"
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={48}
      />

      <div className="row" style={{ marginTop: 12 }}>
        <button type="submit" className="primary">Save</button>
        {saved && <span className="success">Saved</span>}
      </div>
    </form>
  );
}
