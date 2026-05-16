import SymbolIcon from './SymbolIcon.jsx';

export default function StatusBadge({ status }) {
  return (
    <span className="status-badge" style={{ '--badge-color': status.color }}>
      <SymbolIcon name={status.icon} size={12} />
      {status.label}
    </span>
  );
}
