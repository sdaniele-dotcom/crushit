"use client";

import { getSupabase } from "@/lib/supabase";

export type ResourceLink = { label: string; url: string };

export type Vendor = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  action_url: string | null;
  action_label: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  resource_urls: ResourceLink[];
  notes: string | null;
  active: boolean;
  featured: boolean;
  sort: number;
  updated_at: string;
};

export const VENDOR_CATEGORIES = [
  "Escrow", "Title", "Natural Hazard Disclosure", "Home Warranty", "Insurance",
  "Marketing", "CRM", "Lead Generation", "Transaction Management", "Homebuyer Tools",
  "Photography", "Printing", "Moving Services", "Other",
];

export async function fetchVendors(activeOnly = true): Promise<Vendor[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb.from("vendors").select("*").order("featured", { ascending: false }).order("sort");
  if (activeOnly) q = q.eq("active", true);
  const { data } = await q;
  return (data as Vendor[]) ?? [];
}
