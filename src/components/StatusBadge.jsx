export default function StatusBadge({ status }) {
  return (
    <span className="status-badge" style={{ '--badge-color': status.color }}>
      <span className="status-badge__dot" />
      {status.label}
    </span>
  );
}
