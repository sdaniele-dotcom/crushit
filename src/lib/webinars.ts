"use client";

import { getSupabase } from "@/lib/supabase";

/**
 * Webinars, read straight from Supabase in the browser.
 *
 * SAFE TO READ WITH THE ANON KEY because migration 0071's policy only exposes
 * rows where `published` is true — a draft, and the join link on it, is not
 * reachable from here. Registrations are a different matter entirely: that
 * table is service-role only, so signing up goes through the backend
 * (/api/public/webinar-register) rather than an insert from this file.
 *
 * The site is a static export, so there is no server to render these. A page
 * that fetches on mount is what lets somebody add a webinar in the admin and
 * have it appear without a rebuild.
 */

export type WebinarState = "upcoming" | "replay" | "draft";

export type Webinar = {
  id: string;
  slug: string;
  title: string;
  blurb: string | null;
  description: string | null;
  starts_at: string | null;
  duration_mins: number | null;
  recording_url: string | null;
  host_name: string | null;
  topic: string | null;
  cover_url: string | null;
  sort_weight: number;
};

/**
 * Which of the two things this webinar is right now.
 *
 * MUST MATCH webinarState in the backend's lib/webinars/registration.ts. The
 * page decides what button to show; the server decides what to email. If they
 * disagree, somebody clicks "register" and is sent a recording, or clicks
 * "watch" and is sent a calendar invite.
 */
export function webinarState(w: Pick<Webinar, "starts_at" | "recording_url">, now = new Date()): WebinarState {
  const rec = (w.recording_url ?? "").trim();
  const starts = (w.starts_at ?? "").trim();
  const d = starts ? new Date(starts) : null;
  const valid = d && !Number.isNaN(d.getTime());
  if (valid && d.getTime() > now.getTime()) return "upcoming";
  if (rec) return "replay";
  return "draft";
}

/** Published webinars, soonest event first, then replays. */
export async function fetchWebinars(): Promise<Webinar[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("webinars")
    .select(
      "id, slug, title, blurb, description, starts_at, duration_mins, recording_url, host_name, topic, cover_url, sort_weight",
    )
    .eq("published", true)
    .limit(100);
  if (error) return [];

  const rows = (data as Webinar[]) ?? [];
  const now = new Date();
  /*
    A published row with no date and no recording is a 'draft' by state even
    though somebody ticked Published. Hiding it is kinder than showing a card
    whose button cannot do anything.
  */
  const live = rows.filter((w) => webinarState(w, now) !== "draft");

  return live.sort((a, b) => {
    const sa = webinarState(a, now);
    const sb_ = webinarState(b, now);
    if (sa !== sb_) return sa === "upcoming" ? -1 : 1;
    if (sa === "upcoming") {
      // Soonest first: the next one is the one somebody can still attend.
      return (a.starts_at ?? "").localeCompare(b.starts_at ?? "");
    }
    // Replays: hand-weighted first, then newest.
    if (a.sort_weight !== b.sort_weight) return b.sort_weight - a.sort_weight;
    return (b.starts_at ?? "").localeCompare(a.starts_at ?? "");
  });
}

/** "Thursday, November 20 at 6:00 PM Pacific" — or null when there is no date. */
export function formatWhen(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return (
    d.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) + " Pacific"
  );
}
