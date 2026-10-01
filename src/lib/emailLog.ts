"use client";

import { getSupabase } from "@/lib/supabase";

/** One row of public.email_log (migration 0060). Admin-readable only. */
export type EmailLogRow = {
  id: string;
  kind: string;
  status: "sent" | "failed";
  to_email: string;
  from_email: string;
  cc_email: string | null;
  reply_to: string | null;
  subject: string;
  html: string | null;
  html_truncated: boolean;
  attachment_names: string[] | null;
  provider_id: string | null;
  error: string | null;
  listing_id: string | null;
  user_id: string | null;
  created_at: string;
};

/** Human labels for the `kind` column, so the filter reads like English. */
export const KIND_LABELS: Record<string, string> = {
  listing_flyer: "Listing flyer",
  welcome: "Welcome",
  new_listing: "New listing",
  broadcast: "Newsletter",
  signup_invite: "Signup invite",
  crm_lead: "CRM lead",
  diagnostic: "Diagnostic",
  other: "Other",
};

export type EmailLogFilter = {
  kind?: string;
  status?: "sent" | "failed";
  /** Matches the recipient or the subject. */
  search?: string;
  limit?: number;
};

export async function fetchEmailLog(f: EmailLogFilter = {}): Promise<EmailLogRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb
    .from("email_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(f.limit ?? 200);

  if (f.kind) q = q.eq("kind", f.kind);
  if (f.status) q = q.eq("status", f.status);
  const s = f.search?.trim();
  if (s) {
    /*
      Commas separate the branches of a PostgREST `or`, so a search containing
      one would be read as extra conditions and the query would fail. Stripping
      it loses nothing real — no email address has a comma, and a subject
      searched without it still matches on the rest.
    */
    const safe = s.replace(/[,()]/g, " ").trim();
    if (safe) q = q.or(`to_email.ilike.%${safe}%,subject.ilike.%${safe}%`);
  }

  const { data } = await q;
  return (data as EmailLogRow[]) ?? [];
}
