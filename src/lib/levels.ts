/**
 * Crush levels (based on LIFETIME stars). These mirror the seed values in the
 * database; the Admin can change the thresholds there, and a later phase reads
 * them live. Defaults are used for instant client-side display.
 */
export type Level = { name: string; min: number; icon?: string; blurb?: string };

export const LEVELS: Level[] = [
  { name: "CRUSH ROOKIE", min: 0, icon: "⭐", blurb: "Full Realtor Suite access — start earning." },
  { name: "CRUSH PRO", min: 250, icon: "⭐", blurb: "Extra templates plus occasional perks." },
  { name: "CRUSH ELITE", min: 750, icon: "⭐", blurb: "Priority marketing requests and exclusive events." },
  { name: "CRUSH VIP", min: 1500, icon: "⭐", blurb: "Monthly marketing perks and VIP event access." },
  { name: "CRUSH LEGEND", min: 3000, icon: "👑", blurb: "Profile badge, premium marketing, an annual gift, and invite-only experiences." },
];

/** The badge icon for a given tier name (falls back to a star). */
export function level_icon(name: string | null | undefined, levels: Level[] = LEVELS): string {
  return levels.find((l) => l.name === name)?.icon || "⭐";
}

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
