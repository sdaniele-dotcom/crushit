"use client";

import { getSupabase } from "@/lib/supabase";

export type TierReward = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  min_stars: number;
  level_name: string | null;
  fulfillment: string | null;
  repeatable: boolean;
  active: boolean;
  sort: number;
};

export type ClaimStatus = "requested" | "approved" | "fulfilled" | "declined";

export type RewardClaim = {
  id: string;
  user_id: string;
  reward_id: string;
  reward_title: string | null;
  status: ClaimStatus;
  note: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

/** Active perks (the whole catalog for admins, thanks to RLS). */
export async function fetchTierRewards(): Promise<TierReward[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("tier_rewards").select("*").order("min_stars").order("sort");
  return (data as TierReward[]) ?? [];
}

/** The signed-in agent's own claims. */
export async function fetchMyClaims(): Promise<RewardClaim[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("reward_claims").select("*").order("created_at", { ascending: false });
  return (data as RewardClaim[]) ?? [];
}

export type ClaimResult = { ok: boolean; reason?: string; needed?: number; have?: number };

/** Claim an unlocked perk. Eligibility is verified server-side. */
export async function claimReward(rewardId: string, note?: string): Promise<ClaimResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: "not_configured" };
  const { data, error } = await sb.rpc("claim_reward", { p_reward_id: rewardId, p_note: note ?? null });
  if (error) return { ok: false, reason: error.message };
  return (data as ClaimResult) ?? { ok: false, reason: "unknown" };
}

// ── Admin ────────────────────────────────────────────────────────────────────

export type AdminClaim = RewardClaim & {
  agent_name: string | null;
  agent_email: string | null;
};

/** Admin: all claims with the claiming agent's name/email. */
export async function fetchAllClaims(): Promise<AdminClaim[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("reward_claims")
    .select("*, profiles!reward_claims_user_id_fkey(first_name,last_name,display_name,email)")
    .order("created_at", { ascending: false });
  type Row = RewardClaim & {
    profiles: { first_name: string | null; last_name: string | null; display_name: string | null; email: string | null } | null;
  };
  return ((data as Row[]) ?? []).map((r) => {
    const p = r.profiles;
    const name =
      p?.display_name?.trim() ||
      [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() ||
      null;
    return { ...r, agent_name: name, agent_email: p?.email ?? null };
  });
}

export async function updateClaim(id: string, status: ClaimStatus, adminNote?: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb.rpc("admin_update_claim", {
    p_claim_id: id,
    p_status: status,
    p_admin_note: adminNote ?? null,
  });
  if (error) return false;
  return Boolean((data as { ok?: boolean })?.ok);
}

export async function upsertReward(r: Partial<TierReward>): Promise<TierReward | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("tier_rewards").upsert(r).select("*").maybeSingle();
  return (data as TierReward) ?? null;
}

export async function deleteReward(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("tier_rewards").delete().eq("id", id);
}
