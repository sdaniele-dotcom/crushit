"use client";

import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";

export type Lead = {
  id: string; listing_id: string | null; listing_address: string | null;
  name: string | null; phone: string | null; email: string | null;
  working_with_agent: boolean | null; interested_this: boolean | null;
  interested_similar: boolean | null; wants_financing: boolean | null;
  timeline: string | null; created_at: string;
};

export type Feedback = {
  id: string; listing_id: string | null; listing_address: string | null;
  overall_rating: number | null; liked_most: string | null; liked_least: string | null;
  price_opinion: string | null; ratings: Record<string, number>; would_offer: string | null;
  blockers: string[]; suggested_price: number | null; wants_info: string[];
  name: string | null; phone: string | null; email: string | null; created_at: string;
};

export async function submitLead(input: Partial<Lead>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("open_house_leads").insert(input);
  return !error;
}

export async function submitFeedback(input: Partial<Feedback>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("open_house_feedback").insert(input);
  return !error;
}

export async function listLeads(listingId: string): Promise<Lead[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("open_house_leads").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
  return (data as Lead[]) ?? [];
}

export async function listFeedback(listingId: string): Promise<Feedback[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("open_house_feedback").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
  return (data as Feedback[]) ?? [];
}

/** QR image URL (rendered in the user's browser) for a given target URL. */
export function qrImage(url: string, sizePx = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${sizePx}x${sizePx}&margin=0&data=${encodeURIComponent(url)}`;
}

/** Public URLs a visitor scans (address passed so the page can show it). */
export function signInUrl(listingId: string, address: string): string {
  return `${site.siteUrl}/open-house/?l=${encodeURIComponent(listingId)}&a=${encodeURIComponent(address)}`;
}
export function feedbackUrl(listingId: string, address: string): string {
  return `${site.siteUrl}/feedback/?l=${encodeURIComponent(listingId)}&a=${encodeURIComponent(address)}`;
}

/** Aggregate feedback into a simple summary for the agent/seller recap. */
export function summarize(fb: Feedback[]) {
  const n = fb.length;
  const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);
  const overall = avg(fb.map((f) => f.overall_rating ?? 0).filter(Boolean));
  const priceCounts: Record<string, number> = {};
  const offerCounts: Record<string, number> = { yes: 0, maybe: 0, no: 0 };
  const blockerCounts: Record<string, number> = {};
  const catTotals: Record<string, number[]> = {};
  for (const f of fb) {
    if (f.price_opinion) priceCounts[f.price_opinion] = (priceCounts[f.price_opinion] ?? 0) + 1;
    if (f.would_offer && offerCounts[f.would_offer] != null) offerCounts[f.would_offer] += 1;
    for (const b of f.blockers ?? []) blockerCounts[b] = (blockerCounts[b] ?? 0) + 1;
    for (const [k, v] of Object.entries(f.ratings ?? {})) {
      if (typeof v === "number" && v > 0) (catTotals[k] ??= []).push(v);
    }
  }
  const categoryAverages = Object.fromEntries(Object.entries(catTotals).map(([k, v]) => [k, Number(avg(v).toFixed(1))]));
  const topBlockers = Object.entries(blockerCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
  const suggestedPrices = fb.map((f) => f.suggested_price).filter((p): p is number => p != null);
  return {
    count: n,
    overall: Number(overall.toFixed(1)),
    priceCounts,
    offerCounts,
    categoryAverages,
    topBlockers,
    avgSuggestedPrice: suggestedPrices.length ? Math.round(avg(suggestedPrices)) : null,
  };
}
