import SymbolIcon from './SymbolIcon.jsx';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="theme-toggle__thumb">
        <SymbolIcon name={isDark ? 'moon' : 'sun'} size={15} />
      </span>
      <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
