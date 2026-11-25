/**
 * Which routes are readable without an account.
 *
 * This lives here, and not in AppFrame, because two places need the same
 * answer: AppFrame decides what to render, and sitemap.ts decides what to
 * tell search engines. They disagreed for a long time — the sitemap listed
 * every exported route while AppFrame gated all but one of them — so a
 * crawler was invited to 21 pages that redirect to /login.
 *
 * Keeping the list in one module means making a page public is one edit and
 * both behaviours follow. AppFrame is a client component; a sitemap is
 * server-only, so the shared value cannot live in either of them.
 */

/**
 * Self-contained pages with their own layout: the auth flow, plus the
 * QR-driven open-house forms that logged-out visitors scan at a showing.
 * Public, but deliberately not advertised to search engines.
 */
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
  "/auth/callback",
  "/open-house",
  "/feedback",
];

/**
 * Readable without an account AND without having accepted the terms.
 *
 * /terms has to be on this list or the gate traps you: the gate links to the
 * terms, and a gate that blocks the document it is asking you to agree to is
 * asking you to agree to something you cannot read.
 *
 * The home page is public too, but it is not listed here — it has its own
 * branch in AppFrame because a signed-in visitor gets redirected off it to
 * the dashboard, which is not true of anything in this list.
 */
export const PUBLIC_ROUTES = ["/terms"];

/** Normalise a pathname for comparison against the lists above. */
export function normalizePath(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}
