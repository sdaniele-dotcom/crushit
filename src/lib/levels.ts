/**
 * Crush levels (based on LIFETIME stars). These mirror the seed values in the
 * database; the Admin can change the thresholds there, and a later phase reads
 * them live. Defaults are used for instant client-side display.
 */
export type Level = { name: string; min: number };

export const LEVELS: Level[] = [
  { name: "Starter", min: 0 },
  { name: "Pro", min: 100 },
  { name: "Elite", min: 250 },
  { name: "Crush Club", min: 500 },
];

export function level_name(lifetime: number): string {
  let name = LEVELS[0].name;
  for (const l of LEVELS) if (lifetime >= l.min) name = l.name;
  return name;
}

/** Current level, next level, and progress toward it. */
export function levelProgress(lifetime: number) {
  const sorted = [...LEVELS].sort((a, b) => a.min - b.min);
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
