/**
 * businessHours.ts — when the Crush Mortgage team is at their desks.
 *
 * The flyer-request page promises a reply "weekdays 9–5, and first thing the
 * next business morning otherwise." That promise is only honest if the page
 * knows which side of it the agent is on when they hit send — a 9pm Saturday
 * request that says "we'll reach out as soon as possible" reads like a broken
 * promise by Sunday lunchtime.
 *
 * Everything here is computed in Pacific time regardless of where the agent's
 * browser thinks it is: the team is in Long Beach, and an agent travelling in
 * Denver should still be told when OUR phones are answered.
 */

export const BUSINESS_ZONE = "America/Los_Angeles";
export const OPEN_HOUR = 9; // 9:00am Pacific
export const CLOSE_HOUR = 17; // 5:00pm Pacific
export const HOURS_LABEL = "Monday–Friday, 9:00am–5:00pm Pacific";

/** The weekday (0 = Sunday) and hour in Pacific time, for any instant. */
function pacificParts(at: Date): { weekday: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_ZONE,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // hour12:false yields 24 at midnight in some runtimes; normalise it to 0.
  const hour = Number(get("hour")) % 24;
  return {
    weekday: Math.max(0, days.indexOf(get("weekday"))),
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number(get("minute")) || 0,
  };
}

/** True when the team is open: Mon–Fri between 9:00am and 5:00pm Pacific. */
export function isBusinessHours(at: Date = new Date()): boolean {
  const { weekday, hour } = pacificParts(at);
  if (weekday === 0 || weekday === 6) return false;
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

/**
 * A plain-English answer to "when will I hear back?", written for the moment
 * the agent is reading it. Never promises a turnaround we have not committed
 * to — "as soon as possible" during the day, "when we open" outside it.
 */
export function replyWindow(at: Date = new Date()): string {
  if (isBusinessHours(at)) return "as soon as possible today";
  const { weekday, hour } = pacificParts(at);
  const beforeOpen = weekday >= 1 && weekday <= 5 && hour < OPEN_HOUR;
  if (beforeOpen) return "after we open at 9:00am Pacific";
  // Friday after 5, Saturday, Sunday — the next desk is Monday morning.
  const nextIsMonday = weekday === 5 || weekday === 6 || weekday === 0;
  return nextIsMonday
    ? "first thing Monday morning"
    : "first thing the next business morning";
}
