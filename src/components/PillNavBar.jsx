import SymbolIcon from './SymbolIcon.jsx';

/**
 * iOS-style floating segmented control. Stays sticky to the top of the
 * scrollable area and uses backdrop-filter for the frosted-glass look.
 */
export default function PillNavBar({ tabs, activeId, onChange }) {
  return (
    <nav className="pill-nav-wrap" aria-label="Dashboard sections">
      <div className="pill-nav" role="tablist">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`pill-nav__item${active ? ' pill-nav__item--active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon && <SymbolIcon name={tab.icon} size={15} />}
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
