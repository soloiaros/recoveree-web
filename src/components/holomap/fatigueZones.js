/**
 * Anatomical fatigue-zone map.
 *
 * Coordinates assume a humanoid mesh roughly 1.8m tall, standing on the floor
 * with its origin at the feet, centered on X/Z, facing +Z. This is the
 * convention used by MakeHuman, Mixamo, ReadyPlayerMe, etc. — drop in any of
 * those `.glb`s and these positions will land in roughly the right place.
 *
 * Single-string entries (e.g. `'lower_back'`) resolve to one marker. Plural /
 * symmetric entries (e.g. `'calves'`, `'quads'`) fan out to both sides.
 *
 * Add new zones here; nothing else needs to change.
 */

const SINGLE_ZONES = {
  head: [0, 1.65, 0],
  neck: [0, 1.5, 0],
  chest: [0, 1.3, 0.06],
  upper_back: [0, 1.3, -0.06],
  lower_back: [0, 1.05, -0.07],
  core: [0, 1.05, 0.07],
  hips: [0, 0.95, 0],

  left_shoulder: [-0.2, 1.45, 0],
  right_shoulder: [0.2, 1.45, 0],
  left_bicep: [-0.3, 1.25, 0],
  right_bicep: [0.3, 1.25, 0],
  left_forearm: [-0.4, 1.0, 0],
  right_forearm: [0.4, 1.0, 0],

  left_quad: [-0.1, 0.7, 0.06],
  right_quad: [0.1, 0.7, 0.06],
  left_hamstring: [-0.1, 0.7, -0.06],
  right_hamstring: [0.1, 0.7, -0.06],
  left_knee: [-0.1, 0.5, 0.04],
  right_knee: [0.1, 0.5, 0.04],
  left_calf: [-0.1, 0.3, -0.05],
  right_calf: [0.1, 0.3, -0.05],
  left_ankle: [-0.1, 0.08, 0],
  right_ankle: [0.1, 0.08, 0],
};

const SYMMETRIC_ALIASES = {
  shoulders: ['left_shoulder', 'right_shoulder'],
  biceps: ['left_bicep', 'right_bicep'],
  arms: ['left_bicep', 'right_bicep', 'left_forearm', 'right_forearm'],
  forearms: ['left_forearm', 'right_forearm'],
  quads: ['left_quad', 'right_quad'],
  hamstrings: ['left_hamstring', 'right_hamstring'],
  knees: ['left_knee', 'right_knee'],
  calves: ['left_calf', 'right_calf'],
  ankles: ['left_ankle', 'right_ankle'],
  legs: [
    'left_quad',
    'right_quad',
    'left_hamstring',
    'right_hamstring',
    'left_calf',
    'right_calf',
  ],
};

/**
 * Resolve a list of zone keys (single or symmetric) into concrete
 * `{ id, position: [x,y,z] }` marker descriptors. Unknown keys are silently
 * dropped (and logged in dev) so a stray label can't crash the scene.
 */
export function resolveFatigueMarkers(zones = []) {
  const seen = new Set();
  const out = [];

  for (const raw of zones) {
    if (typeof raw !== 'string') continue;
    const key = raw.trim().toLowerCase();
    if (!key) continue;

    const expanded = SYMMETRIC_ALIASES[key] ?? [key];
    for (const id of expanded) {
      if (seen.has(id)) continue;
      const position = SINGLE_ZONES[id];
      if (!position) {
        if (import.meta.env.DEV) {
          console.warn(`[fatigueZones] unknown zone: "${id}"`);
        }
        continue;
      }
      seen.add(id);
      out.push({ id, position });
    }
  }

  return out;
}

export const ALL_FATIGUE_ZONES = Object.keys(SINGLE_ZONES);

/**
 * Keyword → zone key map used by `inferFatigueZonesFromAthlete`. Order
 * matters: longer / more specific phrases must come before their substrings
 * so e.g. "lower back" doesn't get stolen by a plain "back" match.
 */
const KEYWORD_TO_ZONES = [
  ['lower back', ['lower_back']],
  ['upper back', ['upper_back']],
  ['hamstring', ['hamstrings']],
  ['quadricep', ['quads']],
  ['quad', ['quads']],
  ['calf', ['calves']],
  ['calves', ['calves']],
  ['shin', ['ankles']],
  ['ankle', ['ankles']],
  ['knee', ['knees']],
  ['shoulder', ['shoulders']],
  ['bicep', ['biceps']],
  ['forearm', ['forearms']],
  ['arm', ['arms']],
  ['neck', ['neck']],
  ['head', ['head']],
  ['chest', ['chest']],
  ['core', ['core']],
  ['abs', ['core']],
  ['hip', ['hips']],
  ['back', ['lower_back']],
  ['leg', ['legs']],
];

/**
 * Best-effort inference of which body zones an athlete is fatiguing, given
 * the data we have today (no dedicated DB column yet).
 *
 *   1. Scan the latest `ai_advice` text for body-part keywords.
 *   2. If nothing matches but recovery is poor, surface a sensible default
 *      (lower back + calves — the most common general-fatigue hotspots).
 *   3. Otherwise return an empty list (no warnings glowing on a fresh
 *      athlete is the right UX).
 */
export function inferFatigueZonesFromAthlete(athlete) {
  const log = athlete?.latestLog;
  if (!log) return [];

  const advice = (log.ai_advice ?? '').toLowerCase();
  const matched = new Set();
  for (const [keyword, zones] of KEYWORD_TO_ZONES) {
    if (advice.includes(keyword)) {
      zones.forEach((z) => matched.add(z));
    }
  }

  if (matched.size > 0) return Array.from(matched);

  const score = Number(log.recovery_score);
  if (Number.isFinite(score) && score < 60) {
    return ['lower_back', 'calves'];
  }

  return [];
}
