"use client";

import { getSupabase } from "@/lib/supabase";
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
 * WHY THERE IS NO AUTO-CREATE YET, stated plainly rather than stubbed into
 * something that looks like it works. Floify has a REST API and offers free
 * developer accounts, but the reference is not public — checked 10/1, the
 * developers page carries no endpoint list — so whether partners and their
 * co-branding can be created through it is unknown. Writing a `createPartner()`
 * against a guessed endpoint shape would produce code that compiles, ships, and
 * fails the first time anybody relies on it.
 *
 * The seam is here instead: `requestFloifyPage` records that an agent wants
 * one, an admin makes it in Floify and pastes the URL back. If Floify confirms
 * the endpoints, the admin step becomes an API call behind this same function
 * and nothing in the UI changes.
 *
 * TO FIND OUT: ask Floify (sales@floify.com) for API reference access and
 * whether the Partners resource supports create + co-branding. If yes, the
 * credential belongs in Vercel as FLOIFY_API_KEY, server-side only, used from
 * a crushmortgage route — never in this file, which ships to the browser.
 */

/** Has an admin set this agent's co-branded page up yet? */
export function floifyUrl(p: Partial<Profile> | null | undefined): string | null {
  const u = p?.floify_url?.trim();
  return u ? u : null;
}

/** Agent asks for their page. Idempotent — asking twice is not a problem. */
export async function requestFloifyPage(userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("profiles")
    .update({ floify_requested_at: new Date().toISOString() })
    .eq("id", userId);
  return !error;
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
