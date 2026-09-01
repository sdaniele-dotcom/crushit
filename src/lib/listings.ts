"use client";

import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";

export type PropertyLookup = {
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  purchase_price?: number;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  photo_url?: string;
  /** All listing photos from Lofty, for the agent to choose from. */
  photos?: string[];
  description?: string;
};

/** Look up a property (photo + details) from the MLS source (Lofty) by address. */
export async function lookupProperty(address: string): Promise<PropertyLookup | null> {
  if (!address || address.trim().length < 3) return null;
  try {
    const res = await fetch(`${site.flyerApiBase}/api/public/property`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: address.trim() }),
    });
    const data = await res.json();
    return data?.ok ? (data.property as PropertyLookup) : null;
  } catch {
    return null;
  }
}

export type Listing = {
  id: string;
  user_id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  description: string | null;
  photos: string[];
  mls: string | null;
  open_house_at: string | null;
  open_house_end: string | null;
  open_house_notes: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ListingInput = Partial<Omit<Listing, "id" | "user_id" | "created_at" | "updated_at">> & {
  address: string;
};

/** All of the logged-in agent's saved listings, newest first. */
export async function listMyListings(): Promise<Listing[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("listings").select("*").order("created_at", { ascending: false });
  return (data as Listing[]) ?? [];
}

export async function getListing(id: string): Promise<Listing | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("listings").select("*").eq("id", id).maybeSingle();
  return (data as Listing) ?? null;
}

/**
 * Create a listing, or update the existing one at the same address (so entering
 * the same property twice reuses one record). Returns the listing id.
 */
export async function upsertListing(input: ListingInput): Promise<Listing | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const addr = input.address.trim();
  if (!addr) return null;

  // Reuse an existing listing at this address (case-insensitive).
  const { data: existing } = await sb
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .ilike("address", addr)
    .maybeSingle();

  const patch = { ...input, address: addr };
  if (existing) {
    // Only overwrite fields that were actually provided (don't wipe saved data).
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    );
    const { data } = await sb
      .from("listings")
      .update(clean)
      .eq("id", (existing as Listing).id)
      .select("*")
      .maybeSingle();
    return (data as Listing) ?? (existing as Listing);
  }

  const { data } = await sb
    .from("listings")
    .insert({ user_id: user.id, ...patch })
    .select("*")
    .maybeSingle();
  return (data as Listing) ?? null;
}

export async function deleteListing(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("listings").delete().eq("id", id);
}

/** A short one-line label for a listing card. */
export function listingLabel(l: Pick<Listing, "address" | "city" | "state">): string {
  return [l.address, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
}
