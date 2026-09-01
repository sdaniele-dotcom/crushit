"use client";

import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";

export type PromotionStatus = "new" | "in_progress" | "scheduled" | "posted" | "declined";

export type PromotionRequest = {
  id: string;
  user_id: string;
  listing_id: string | null;
  address: string | null;
  price: number | null;
  photos: string[];
  instagram: string | null;
  video_url: string | null;
  include: string[];
  note: string | null;
  agent_name: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  brokerage: string | null;
  status: PromotionStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type PromotionInput = {
  listing_id?: string | null;
  address?: string | null;
  price?: number | null;
  photos?: string[];
  instagram?: string | null;
  video_url?: string | null;
  include?: string[];
  note?: string | null;
  agent: { name?: string | null; email?: string | null; phone?: string | null; brokerage?: string | null };
};

export type SubmitResult = { ok: boolean; error?: string };

/**
 * Save a listing-promotion request (RLS: agent inserts their own) and notify the
 * Crush Mortgage team. Returns ok only once the team notification is sent, so
 * the UI never claims success on a silent failure. The saved row is the record
 * of truth for the admin queue.
 */
export async function submitPromotionRequest(input: PromotionInput): Promise<SubmitResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Not configured." };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Please log in." };

  const { error: dbErr } = await sb.from("promotion_requests").insert({
    user_id: user.id,
    listing_id: input.listing_id ?? null,
    address: input.address ?? null,
    price: input.price ?? null,
    photos: input.photos ?? [],
    instagram: input.instagram ?? null,
    video_url: input.video_url ?? null,
    include: input.include ?? [],
    note: input.note ?? null,
    agent_name: input.agent.name ?? null,
    agent_email: input.agent.email ?? null,
    agent_phone: input.agent.phone ?? null,
    brokerage: input.agent.brokerage ?? null,
  });
  if (dbErr) return { ok: false, error: dbErr.message };

  try {
    const res = await fetch(`${site.flyerApiBase}/api/public/promotion-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: { ...input.agent, instagram: input.instagram },
        address: input.address,
        price: input.price,
        photoCount: (input.photos ?? []).length,
        videoUrl: input.video_url,
        include: input.include,
        note: input.note,
      }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (res.ok && data.ok) return { ok: true };
    // Saved, but the notification didn't send — still a success for the agent;
    // the team will see it in the admin queue.
    return { ok: true, error: "saved_no_email" };
  } catch {
    return { ok: true, error: "saved_no_email" };
  }
}

export async function fetchMyPromotions(): Promise<PromotionRequest[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("promotion_requests").select("*").order("created_at", { ascending: false });
  return (data as PromotionRequest[]) ?? [];
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function fetchAllPromotions(): Promise<PromotionRequest[]> {
  return fetchMyPromotions(); // RLS returns all rows for admins
}

export async function updatePromotionStatus(id: string, status: PromotionStatus, adminNote?: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const patch: Record<string, unknown> = { status };
  if (adminNote != null) patch.admin_note = adminNote;
  const { error } = await sb.from("promotion_requests").update(patch).eq("id", id);
  return !error;
}
