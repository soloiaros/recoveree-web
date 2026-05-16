/**
 * Single source of truth for how we classify an athlete's current state from
 * their latest `recovery_logs` row. The DB schema doesn't yet have a dedicated
 * "injury" flag, so we infer it from the AI advice text.
 *
 * If the schema later gains an `is_injured` (or similar) column, only this
 * file needs to change.
 */

export const STATUS = {
  injured: {
    id: 'injured',
    label: 'Injury recovery',
    short: 'Injured',
    color: '#ff3b30',
    icon: 'cross',
  },
  needsRecovery: {
    id: 'needsRecovery',
    label: 'Needs recovery',
    short: 'Recovering',
    color: '#ff9500',
    icon: 'wave',
  },
  rested: {
    id: 'rested',
    label: 'Fully rested',
    short: 'Rested',
    color: '#34c759',
    icon: 'check',
  },
  unknown: {
    id: 'unknown',
    label: 'No data yet',
    short: 'No data',
    color: '#8e8e93',
    icon: 'question',
  },
};

const INJURY_KEYWORDS = [
  'injury',
  'injured',
  'strain',
  'sprain',
  'pulled muscle',
  'pain',
  'rest the',
  'do not train',
];

/**
 * Bin thresholds, expressed once so the Overview "progress" visuals stay
 * consistent with the badge classification.
 */
export const RESTED_MIN_SCORE = 75;
export const NEEDS_RECOVERY_MIN_SCORE = 50;

export function classifyAthlete(athlete) {
  const log = athlete?.latestLog;
  if (!log) return STATUS.unknown;

  const advice = (log.ai_advice ?? '').toLowerCase();
  if (INJURY_KEYWORDS.some((kw) => advice.includes(kw))) {
    return STATUS.injured;
  }

  const score = Number(log.recovery_score);
  if (Number.isFinite(score)) {
    if (score >= RESTED_MIN_SCORE) return STATUS.rested;
    if (score < NEEDS_RECOVERY_MIN_SCORE) return STATUS.injured;
    return STATUS.needsRecovery;
  }

  return STATUS.unknown;
}

export function summarizeTeam(athletes) {
  const summary = {
    total: athletes.length,
    rested: 0,
    needsRecovery: 0,
    injured: 0,
    unknown: 0,
  };
  for (const athlete of athletes) {
    const status = classifyAthlete(athlete);
    summary[status.id] += 1;
  }
  return summary;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelative(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function emailToInitials(email = '') {
  const trimmed = email.trim();
  if (!trimmed) return '?';
  const local = trimmed.split('@')[0];
  const parts = local.split(/[._\-+]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}
