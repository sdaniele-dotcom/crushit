"use client";

import { getSupabase } from "@/lib/supabase";

/**
 * realtorCrm.ts — one timeline per realtor, assembled rather than stored.
 *
 * NOTHING HERE DUPLICATES A SEND. Flyers are already recorded in
 * flyer_records (with the loan officer and whether it was emailed or texted),
 * every email is in email_log, and listing_flyers knows which agent each flyer
 * was built for. A CRM that wrote its own copy of all that would drift from it
 * within a week and then quietly disagree about what we sent someone. This
 * reads the records that already exist and interleaves them.
 *
 * The only thing stored fresh is contact_touches: calls, texts typed from
 * somebody's own phone, notes after a meeting. Nothing can capture those
 * automatically, so they are the one thing worth asking a person to type.
 *
 * THE KEY IS AN EMAIL ADDRESS. Most realtors we send flyers to have no account
 * — the flyer goes out before anyone signs up — so keying on a user id would
 * make this blind to exactly the people it exists to track.
 */

export type TouchKind = "call" | "text" | "email" | "meeting" | "note";

export type Contact = {
  email: string;
  name: string | null;
  brokerage: string | null;
  /** Set when this realtor also has a suite account. */
  profileId: string | null;
  headshotUrl: string | null;
  phone: string | null;
  flyerCount: number;
  lastTouchAt: string | null;
};

export type TimelineItem = {
  id: string;
  at: string;
  kind: TouchKind | "flyer";
  /** One-line summary for the row. */
  title: string;
  detail: string | null;
  /** Who did it — the loan officer, or whoever logged the touch. */
  who: string | null;
  direction?: "outbound" | "inbound";
  /** Flyers only: 'preview' never left the building. */
  purpose?: string | null;
  /** Lets a logged touch be removed; absent on derived rows. */
  touchId?: string;
};

const lower = (s: string) => s.trim().toLowerCase();

/** Everyone we have ever sent a flyer to, plus anyone with a logged touch. */
export async function fetchContacts(): Promise<Contact[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const [flyers, touches, profiles] = await Promise.all([
    sb.from("listing_flyers").select("agent_email, agent_name, agent_brokerage, created_at"),
    sb.from("contact_touches").select("contact_email, contact_name, occurred_at"),
    sb.from("profiles").select("id, email, display_name, first_name, last_name, brokerage, phone, headshot_url"),
  ]);

  type Row = { agent_email: string | null; agent_name: string | null; agent_brokerage: string | null; created_at: string };
  type Touch = { contact_email: string; contact_name: string | null; occurred_at: string };
  type Prof = { id: string; email: string | null; display_name: string | null; first_name: string | null; last_name: string | null; brokerage: string | null; phone: string | null; headshot_url: string | null };

  const byEmail = new Map<string, Contact>();
  const upsert = (email: string, patch: Partial<Contact>) => {
    const k = lower(email);
    const cur = byEmail.get(k) ?? {
      email,
      name: null, brokerage: null, profileId: null, headshotUrl: null, phone: null,
      flyerCount: 0, lastTouchAt: null,
    };
    byEmail.set(k, {
      ...cur,
      ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v != null && v !== "")),
      // Counts and maxima accumulate rather than overwrite.
      flyerCount: cur.flyerCount + (patch.flyerCount ?? 0),
      lastTouchAt:
        [cur.lastTouchAt, patch.lastTouchAt].filter(Boolean).sort().pop() ?? null,
    });
  };

  for (const r of (flyers.data as Row[]) ?? []) {
    if (!r.agent_email?.trim()) continue;
    upsert(r.agent_email, {
      name: r.agent_name, brokerage: r.agent_brokerage,
      flyerCount: 1, lastTouchAt: r.created_at,
    });
  }
  for (const t of (touches.data as Touch[]) ?? []) {
    if (!t.contact_email?.trim()) continue;
    upsert(t.contact_email, { name: t.contact_name, lastTouchAt: t.occurred_at });
  }
  /*
    Profiles enrich contacts we already know about but do NOT create them. A
    list of every signed-up agent is the Users page; this one is people we have
    actually reached out to, and padding it with accounts nobody has contacted
    would bury the ones that matter.
  */
  for (const p of (profiles.data as Prof[]) ?? []) {
    if (!p.email) continue;
    if (!byEmail.has(lower(p.email))) continue;
    upsert(p.email, {
      profileId: p.id,
      name: p.display_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || null,
      brokerage: p.brokerage, phone: p.phone, headshotUrl: p.headshot_url,
    });
  }

  return [...byEmail.values()].sort((a, b) =>
    (b.lastTouchAt ?? "").localeCompare(a.lastTouchAt ?? ""),
  );
}

/** Everything we've sent this realtor, newest first. */
export async function fetchTimeline(
  email: string,
): Promise<{ items: TimelineItem[]; errors: string[] }> {
  const sb = getSupabase();
  if (!sb) return { items: [], errors: [] };
  const e = lower(email);
  const items: TimelineItem[] = [];
  /*
    Collected and returned rather than swallowed. Every one of these queries
    used to drop its error on the floor, so a missing migration or a missing
    RLS policy rendered as "nothing recorded yet" — the one message guaranteed
    to send someone looking in the wrong place.
  */
  const errors: string[] = [];

  /*
    TWO QUERIES RATHER THAN AN EMBEDDED JOIN. This was
    `flyer_records...listing_flyers!inner(agent_email)` filtered on the embedded
    column, which depends on PostgREST detecting the relationship and on the
    embedded filter restricting parent rows. When any of that does not hold the
    result is an empty array, not an error, so a broken query and a realtor with
    no flyers looked identical. Finding the listings first and matching on their
    ids is one more round trip and has nothing to go quietly wrong.
  */
  const { data: flyerRows, error: flyerErr } = await sb
    .from("listing_flyers")
    .select("id")
    .ilike("agent_email", e);
  if (flyerErr) errors.push(`flyers: ${flyerErr.message}`);

  const ids = ((flyerRows as { id: string }[]) ?? []).map((f) => f.id);
  type Rec = { id: string; generated_at: string; purpose: string | null; generated_by: string | null; street_address: string | null; city: string | null };
  let recs: Rec[] = [];
  if (ids.length) {
    const { data, error } = await sb
      .from("flyer_records")
      .select("id, generated_at, purpose, generated_by, street_address, city")
      .in("listing_flyer_id", ids)
      .order("generated_at", { ascending: false })
      .limit(300);
    if (error) errors.push(`flyer records: ${error.message}`);
    recs = (data as Rec[]) ?? [];
  }

  for (const r of recs) {
    const where = [r.street_address, r.city].filter(Boolean).join(", ") || "a listing";
    items.push({
      id: `f-${r.id}`,
      at: r.generated_at,
      kind: "flyer",
      title:
        r.purpose === "email" ? `Flyer emailed — ${where}`
        : r.purpose === "text" ? `Flyer texted — ${where}`
        : `Flyer generated — ${where}`,
      detail: null,
      who: r.generated_by,
      purpose: r.purpose,
    });
  }

  const { data: mails, error: mailErr } = await sb
    .from("email_log")
    .select("id, created_at, subject, kind, status, error, from_email")
    .ilike("to_email", e)
    .order("created_at", { ascending: false })
    .limit(300);
  if (mailErr) errors.push(`emails: ${mailErr.message}`);

  type Mail = { id: string; created_at: string; subject: string; kind: string; status: string; error: string | null; from_email: string };
  for (const m of (mails as Mail[]) ?? []) {
    items.push({
      id: `m-${m.id}`,
      at: m.created_at,
      kind: "email",
      title: m.status === "failed" ? `Email FAILED — ${m.subject}` : m.subject,
      detail: m.status === "failed" ? m.error : null,
      who: m.from_email,
      direction: "outbound",
    });
  }

  const { data: touches, error: touchErr } = await sb
    .from("contact_touches")
    .select("id, occurred_at, kind, direction, body, logged_by_name")
    .ilike("contact_email", e)
    .order("occurred_at", { ascending: false })
    .limit(300);
  if (touchErr) errors.push(`logged touches: ${touchErr.message}`);

  type T = { id: string; occurred_at: string; kind: TouchKind; direction: "outbound" | "inbound"; body: string | null; logged_by_name: string | null };
  for (const t of (touches as T[]) ?? []) {
    const verb = t.direction === "inbound" ? "from" : "to";
    items.push({
      id: `t-${t.id}`,
      touchId: t.id,
      at: t.occurred_at,
      kind: t.kind,
      title:
        t.kind === "call" ? `Call ${verb} them`
        : t.kind === "text" ? `Text ${verb} them`
        : t.kind === "meeting" ? "Meeting"
        : t.kind === "email" ? `Email ${verb} them (logged)`
        : "Note",
      detail: t.body,
      who: t.logged_by_name,
      direction: t.direction,
    });
  }

  return { items: items.sort((a, b) => b.at.localeCompare(a.at)), errors };
}

export async function logTouch(input: {
  email: string;
  name: string | null;
  kind: TouchKind;
  direction: "outbound" | "inbound";
  body: string;
  occurredAt: string;
  loggedBy: string | null;
  loggedByName: string | null;
}): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("contact_touches").insert({
    contact_email: input.email.trim(),
    contact_name: input.name,
    kind: input.kind,
    direction: input.direction,
    body: input.body.trim() || null,
    occurred_at: input.occurredAt,
    logged_by: input.loggedBy,
    logged_by_name: input.loggedByName,
  });
  return !error;
}

export async function deleteTouch(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("contact_touches").delete().eq("id", id);
  return !error;
}
