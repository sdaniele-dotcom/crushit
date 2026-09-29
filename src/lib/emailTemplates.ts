"use client";

import { getSupabase } from "@/lib/supabase";

export type EmailTemplate = { key: string; subject: string; body: string; updated_at?: string };

/** Metadata for the editable transactional templates (agent-facing help). */
export const TEMPLATE_META: Record<string, { title: string; blurb: string; tokens: string[]; defaultSubject: string }> = {
  welcome: {
    title: "Welcome email",
    blurb: "Sent automatically the moment a new agent confirms their account.",
    tokens: ["first_name"],
    defaultSubject: "Welcome to the CRUSH IT Agent Suite 🎉",
  },
  new_listing: {
    title: "New-listing email",
    blurb:
      "Sent to an agent when they add a brand-new listing. The built-in design ends with a down-payment-assistance prompt for that address; a custom body replaces the whole email, so include {{dpa_url}} if you want that link to stay.",
    tokens: ["first_name", "address", "price", "beds", "baths", "sqft", "dpa_url"],
    defaultSubject: "Your listing is ready to market — {{address}} 🏡",
  },
  condo_note: {
    title: "Condo guideline note",
    blurb:
      "Added to the flyer email only when the listing is a condominium (not a townhouse or PUD). Body only — the subject is ignored. Leave blank for the built-in draft; enter a single dash to switch the note off. Keep this current as agency condo guidelines change.",
    tokens: [],
    defaultSubject: "",
  },
};

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("email_templates").select("*").order("key");
  return (data as EmailTemplate[]) ?? [];
}

export async function saveEmailTemplate(key: string, subject: string, body: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("email_templates").upsert({ key, subject, body }, { onConflict: "key" });
  return !error;
}
