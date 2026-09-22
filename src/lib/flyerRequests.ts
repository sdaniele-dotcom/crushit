"use client";

import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";

export type FlyerRequestStatus = "new" | "in_progress" | "sent" | "declined";

export type FlyerRequest = {
  id: string;
  user_id: string;
  listing_id: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  property_type: string | null;
  photos: string[];
  annual_taxes: number | null;
  monthly_hoa: number | null;
  down_payment_pct: number | null;
  occupancy: string | null;
  programs: string[];
  loan_officer: string | null;
  note: string | null;
  agent_name: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  brokerage: string | null;
  agent_dre: string | null;
  status: FlyerRequestStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type FlyerRequestInput = {
  listing_id?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  price?: number | null;
  property_type?: string | null;
  photos?: string[];
  annual_taxes?: number | null;
  monthly_hoa?: number | null;
  down_payment_pct?: number | null;
  occupancy?: string | null;
  programs?: string[];
  loan_officer?: string | null;
  note?: string | null;
  agent: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    brokerage?: string | null;
    dre?: string | null;
  };
};

export type SubmitResult = { ok: boolean; error?: string };

/**
 * Save a mortgage-flyer request (RLS: an agent inserts their own) and notify
 * the Crush Mortgage team.
 *
 * The saved row is the record of truth — it is what the admin queue reads, and
 * it is why a failed notification is still reported as a success: the request
 * is safely in the queue and the team will see it there. An insert failure, by
 * contrast, is a real failure and is surfaced, because nothing was recorded
 * anywhere and the agent needs to know their listing did NOT reach us.
 */
export async function submitFlyerRequest(input: FlyerRequestInput): Promise<SubmitResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Not configured." };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Please log in." };

  const { error: dbErr } = await sb.from("flyer_requests").insert({
    user_id: user.id,
    listing_id: input.listing_id ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    zip: input.zip ?? null,
    price: input.price ?? null,
    property_type: input.property_type ?? null,
    photos: input.photos ?? [],
    annual_taxes: input.annual_taxes ?? null,
    monthly_hoa: input.monthly_hoa ?? null,
    down_payment_pct: input.down_payment_pct ?? null,
    occupancy: input.occupancy ?? null,
    programs: input.programs ?? [],
    loan_officer: input.loan_officer ?? null,
    note: input.note ?? null,
    agent_name: input.agent.name ?? null,
    agent_email: input.agent.email ?? null,
    agent_phone: input.agent.phone ?? null,
    brokerage: input.agent.brokerage ?? null,
    agent_dre: input.agent.dre ?? null,
  });
  if (dbErr) return { ok: false, error: dbErr.message };

  try {
    const res = await fetch(`${site.flyerApiBase}/api/public/flyer-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: input.agent,
        address: [input.address, input.city, input.state].filter(Boolean).join(", "),
        price: input.price,
        propertyType: input.property_type,
        photoCount: (input.photos ?? []).length,
        annualTaxes: input.annual_taxes,
        monthlyHoa: input.monthly_hoa,
        downPaymentPct: input.down_payment_pct,
        occupancy: input.occupancy,
        programs: input.programs,
        loanOfficer: input.loan_officer,
        note: input.note,
      }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (res.ok && data.ok) return { ok: true };
    return { ok: true, error: "saved_no_email" };
  } catch {
    return { ok: true, error: "saved_no_email" };
  }
}

/** The agent's own requests (RLS scopes this to them). */
export async function fetchMyFlyerRequests(): Promise<FlyerRequest[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("flyer_requests").select("*").order("created_at", { ascending: false });
  return (data as FlyerRequest[]) ?? [];
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function fetchAllFlyerRequests(): Promise<FlyerRequest[]> {
  return fetchMyFlyerRequests(); // RLS returns all rows for admins
}

export async function updateFlyerRequestStatus(
  id: string,
  status: FlyerRequestStatus,
  adminNote?: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const patch: Record<string, unknown> = { status };
  if (adminNote != null) patch.admin_note = adminNote;
  const { error } = await sb.from("flyer_requests").update(patch).eq("id", id);
  return !error;
}
