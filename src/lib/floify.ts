"use client";

import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";
import type { Profile } from "@/lib/profile";

/**
 * floify.ts — the agent's co-branded loan application page.
 *
 * WHAT FLOIFY ALREADY DOES, which decides this whole design. Floify builds
 * co-branded partner landing pages natively: Settings → Realtors, Partners →
 * Edit Co-Branding → tick "Enable Co-Branding for this realtor/partner", set a
 * custom link path, add their photo, Save. The result is a real Floify page on
 * the Crush account that takes a real application, carrying Crush's branding
 * and the agent's photo.
 *
 * So the suite does NOT rebuild that page. It could draw something prettier
 * and it would collect nothing — the application has to live where the loan
 * officer's pipeline is. What the suite holds is the LINK, and everything
 * around it an agent actually needs: a QR code for a flyer, copy for a text,
 * and a preview of what their client will see.
 *
 * BUILDING THE PAGE IS A MANUAL JOB, and that is the decision rather than a
 * gap waiting to be filled. The agent asks; someone makes it in Floify in
 * about a minute and pastes the URL back. Floify does have a REST API, but
 * chasing API access to automate a once-per-agent task that takes four clicks
 * would buy a dependency and a stored credential in exchange for almost
 * nothing — and the thing it would automate is the part a person should
 * eyeball anyway, since a co-branded page goes out with someone's name, photo
 * and licence on it.
 *
 * WHAT THAT PUTS THE WEIGHT ON is the notification. The timestamp written here
 * is not the mechanism — nobody has a reason to go looking at a column. The
 * request POSTs to crushmortgage's /api/public/floify-request, which emails
 * the team with the agent's details, their headshot, and the Floify steps. If
 * that email stops arriving, requests silently rot, so it is the part to check
 * first if an agent ever says they asked and heard nothing.
 */

/** Has an admin set this agent's co-branded page up yet? */
export function floifyUrl(p: Partial<Profile> | null | undefined): string | null {
  const u = p?.floify_url?.trim();
  return u ? u : null;
}

/**
 * Agent asks for their page. Idempotent — asking twice is not a problem.
 *
 * `notified` is false when the request was recorded but the team email did not
 * go out. The caller tells the agent the truth in that case rather than
 * promising a reply nobody was told to send.
 */
export async function requestFloifyPage(): Promise<{ ok: boolean; notified: boolean }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, notified: false };
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, notified: false };

  /*
    The server stamps the profile AND sends the email, from the agent's own
    token. Doing the write here and the email there would mean a request that
    is recorded but unannounced whenever the second call fails — the exact
    failure that leaves an agent waiting on a queue nobody can see.
  */
  try {
    const res = await fetch(`${site.flyerApiBase}/api/public/floify-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const d = (await res.json().catch(() => ({ ok: false }))) as {
      ok?: boolean;
      notified?: boolean;
    };
    return { ok: res.ok && !!d.ok, notified: !!d.notified };
  } catch {
    return { ok: false, notified: false };
  }
}

/** Ready-to-send copy. Kept here so the page and any future email share it. */
export function shareText(agentName: string, url: string): string {
  const first = agentName.trim().split(/\s+/)[0] || "me";
  return (
    `Ready to get pre-approved? Here's my secure application page — it takes about ` +
    `10 minutes and you can upload documents straight from your phone.\n\n${url}\n\n` +
    `It goes to my lending partner at Crush Mortgage, and they'll keep ${first} in ` +
    `the loop so nothing falls through the cracks.`
  );
}
