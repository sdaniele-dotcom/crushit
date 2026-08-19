/**
 * Crush levels (based on LIFETIME stars). These mirror the seed values in the
 * database; the Admin can change the thresholds there, and a later phase reads
 * them live. Defaults are used for instant client-side display.
 */
export type Level = { name: string; min: number };

export const LEVELS: Level[] = [
  { name: "Rookie", min: 0 },
  { name: "Rising Agent", min: 100 },
  { name: "Gold Agent", min: 250 },
  { name: "Platinum Agent", min: 500 },
  { name: "CRUSH IT Elite", min: 1000 },
];

export function level_name(lifetime: number, levels: Level[] = LEVELS): string {
  let name = levels[0].name;
  for (const l of [...levels].sort((a, b) => a.min - b.min)) if (lifetime >= l.min) name = l.name;
  return name;
}

/** Current level, next level, and progress toward it. */
export function levelProgress(lifetime: number, levels: Level[] = LEVELS) {
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  let current = sorted[0];
  let next: Level | null = null;
  for (let i = 0; i < sorted.length; i++) {
    if (lifetime >= sorted[i].min) {
      current = sorted[i];
      next = sorted[i + 1] ?? null;
    }
  }
  const starsToNext = next ? Math.max(0, next.min - lifetime) : 0;
  const span = next ? next.min - current.min : 1;
  const pct = next ? Math.min(100, Math.round(((lifetime - current.min) / span) * 100)) : 100;
  return { current, next, starsToNext, pct };
}
