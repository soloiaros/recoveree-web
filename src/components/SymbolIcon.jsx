const ICON_PATHS = {
  activity: (
    <path d="M3 12h3.2l2.2-5.6 4.2 11.2 2.2-5.6H21" />
  ),
  check: (
    <path d="m5 12 4.2 4.2L19 6.8" />
  ),
  cross: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  grid: (
    <>
      <path d="M5 5h5v5H5z" />
      <path d="M14 5h5v5h-5z" />
      <path d="M5 14h5v5H5z" />
      <path d="M14 14h5v5h-5z" />
    </>
  ),
  moon: (
    <path d="M19.4 14.1A7.2 7.2 0 0 1 9.9 4.6 8.1 8.1 0 1 0 19.4 14.1Z" />
  ),
  person: (
    <>
      <path d="M12 12.4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  question: (
    <>
      <path d="M9.2 9a3 3 0 1 1 4.8 2.4c-1.1.8-2 1.5-2 3.1" />
      <path d="M12 18.2h.01" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9 12 3.5Z" />
      <path d="m19 4 .6 1.6L21 6.2l-1.4.6L19 8.4l-.6-1.6-1.4-.6 1.4-.6L19 4Z" />
    </>
  ),
  sun: (
    <>
      <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" />
      <path d="M12 2.8V5" />
      <path d="M12 19v2.2" />
      <path d="m4.9 4.9 1.6 1.6" />
      <path d="m17.5 17.5 1.6 1.6" />
      <path d="M2.8 12H5" />
      <path d="M19 12h2.2" />
      <path d="m4.9 19.1 1.6-1.6" />
      <path d="m17.5 6.5 1.6-1.6" />
    </>
  ),
  wave: (
    <path d="M4 13c1.6 0 1.6-2 3.2-2s1.6 2 3.2 2 1.6-2 3.2-2 1.6 2 3.2 2S18.4 11 20 11" />
  ),
};

export default function SymbolIcon({ name, size = 18, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={`symbol-icon ${className}`.trim()}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      {ICON_PATHS[name] ?? ICON_PATHS.spark}
    </svg>
  );
}
