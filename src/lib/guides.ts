"use client";

import { getSupabase } from "@/lib/supabase";

/**
 * Buyer guides, read with the anon key.
 *
 * Safe because migration 0072's policy exposes only published rows. Note what
 * that means for a GATED guide: its file_url is on the row, so the gate is a
 * courtesy that costs a bot nothing — which is exactly why the download
 * endpoint hands the link back rather than withholding it from somebody who
 * just filled the form.
 *
 * Leads are a different matter: guide_downloads is service-role only, so the
 * form posts to the backend rather than inserting from here.
 */

export type Guide = {
  id: string;
  slug: string;
  title: string;
  blurb: string | null;
  topic: string | null;
  file_url: string | null;
  cover_url: string | null;
  page_count: number | null;
  requires_email: boolean;
  sort_weight: number;
};

export async function fetchGuides(): Promise<Guide[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("guides")
    .select(
      "id, slug, title, blurb, topic, file_url, cover_url, page_count, requires_email, sort_weight",
    )
    .eq("published", true)
    .order("sort_weight", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  // A guide with no file has nothing to give: hiding it beats a button that
  // opens nothing.
  return ((data as Guide[]) ?? []).filter((g) => (g.file_url ?? "").trim());
}
