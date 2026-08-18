"use client";

import { getSupabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";

/** Tell the AuthProvider to re-fetch the profile (updates stars in the header). */
export function refreshProfileSoon() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("crush:refresh-profile"));
  }
}

type AwardResult = {
  awarded: boolean;
  stars?: number;
  label?: string;
  level?: string;
  leveled_up?: boolean;
  reason?: string;
} | null;

/**
 * Award Crush Stars for an action. The SERVER decides the amount and enforces
 * anti-farming limits — we only name the action. Shows a toast when awarded.
 */
export async function awardStars(
  action: string,
  opts: {
    dedupeKey?: string;
    relatedType?: string;
    relatedId?: string;
    description?: string;
    silent?: boolean;
  } = {},
): Promise<AwardResult> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("award_stars", {
    p_action: action,
    p_dedupe_key: opts.dedupeKey ?? null,
    p_related_type: opts.relatedType ?? null,
    p_related_id: opts.relatedId ?? null,
    p_description: opts.description ?? null,
  });
  if (error) return null;
  const res = data as AwardResult;
  if (res?.awarded) {
    if (!opts.silent) {
      toast({ emoji: "⭐", title: `+${res.stars} Crush Stars`, body: res.label });
      if (res.leveled_up && res.level) {
        toast({ emoji: "🎉", title: `You reached ${res.level}!` });
      }
    }
    refreshProfileSoon();
  }
  return res;
}

/** Log a platform activity event (used for achievements + admin analytics). */
export async function logActivity(
  event: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.rpc("log_activity", { p_event: event, p_metadata: metadata });
}

/** Save a created marketing piece so the user can find it later ("My Marketing"). */
export async function saveProject(input: {
  kind: string;
  title?: string;
  data?: Record<string, unknown>;
  publicUrl?: string;
  pdfUrl?: string;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("saved_projects").insert({
    user_id: user.id,
    kind: input.kind,
    title: input.title ?? null,
    data: input.data ?? {},
    public_url: input.publicUrl ?? null,
    pdf_url: input.pdfUrl ?? null,
  });
}
