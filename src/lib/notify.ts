"use client";

import { site } from "@/lib/site";

/**
 * Fire-and-forget transactional emails sent via the Crush Mortgage backend
 * (which holds the Resend key). These never block the UI and never surface an
 * error — if email isn't configured the endpoint no-ops and returns ok.
 */

/** Welcome email, sent once right after an agent confirms their account. */
export function sendWelcomeEmail(email: string, name?: string | null): void {
  if (!email) return;
  void fetch(`${site.flyerApiBase}/api/public/welcome-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name: name ?? undefined }),
    keepalive: true,
  }).catch(() => {});
}

/** New-listing nudge, sent when an agent adds a listing for the first time. */
export function notifyNewListing(
  agent: { name?: string | null; email?: string | null },
  listing: { id?: string; address?: string | null; price?: number | null; beds?: number | null; baths?: number | null; sqft?: number | null },
): void {
  if (!agent.email) return;
  void fetch(`${site.flyerApiBase}/api/public/new-listing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent, listing }),
    keepalive: true,
  }).catch(() => {});
}
