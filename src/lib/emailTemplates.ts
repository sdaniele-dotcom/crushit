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
    blurb: "Sent to an agent when they add a brand-new listing.",
    tokens: ["first_name", "address", "price", "beds", "baths", "sqft"],
    defaultSubject: "Your listing is ready to market — {{address}} 🏡",
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
