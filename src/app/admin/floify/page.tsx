"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

type Row = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  brokerage: string | null;
  headshot_url: string | null;
  floify_url: string | null;
  floify_requested_at: string | null;
};

const nameOf = (r: Row) =>
  r.display_name?.trim() ||
  [r.first_name, r.last_name].filter(Boolean).join(" ").trim() ||
  r.email ||
  "Agent";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function Inner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    // Everyone who has asked, or already has one — pending first.
    const { data } = await sb
      .from("profiles")
      .select("id, display_name, first_name, last_name, email, brokerage, headshot_url, floify_url, floify_requested_at")
      .or("floify_requested_at.not.is.null,floify_url.not.is.null")
      .order("floify_requested_at", { ascending: true, nullsFirst: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(r: Row) {
    const sb = getSupabase();
    if (!sb) return;
    const raw = (draft[r.id] ?? "").trim();
    // Empty clears it; anything else has to be a real https URL, because this
    // value gets handed to buyers as a place to type financial details.
    if (raw && !/^https:\/\/[^\s]+\.[^\s]+/i.test(raw)) {
      toast({ emoji: "⚠️", title: "That doesn't look like a link", body: "It should start with https://" });
      return;
    }
    setSaving(r.id);
    const { error } = await sb
      .from("profiles")
      .update({ floify_url: raw || null })
      .eq("id", r.id);
    setSaving(null);
    if (error) {
      toast({ emoji: "⚠️", title: "Couldn't save", body: "Check your admin access and try again." });
      return;
    }
    toast({ emoji: "✅", title: raw ? "Link saved" : "Link cleared", body: `${nameOf(r)}'s page is ${raw ? "live in their suite" : "no longer shown"}.` });
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, floify_url: raw || null } : x)));
  }

  const pending = rows.filter((r) => !r.floify_url);

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title={<>Co-branded <span className="text-gradient">application pages</span></>}
        subtitle="Agents who've asked for a Floify application page, and the links for the ones that are built."
      />

      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-bold text-ink-900">How to build one</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-800">
            <li>In Floify: <strong>Settings → Realtors, Partners</strong>.</li>
            <li>Find the agent (add them if they&apos;re not there yet).</li>
            <li>Click <strong>Edit Co-Branding Settings</strong> and tick <strong>Enable Co-Branding for this realtor/partner</strong>.</li>
            <li>Set the link path and upload their headshot — it&apos;s on their profile here.</li>
            <li>Save, copy the resulting URL, and paste it below.</li>
          </ol>
          <p className="mt-3 text-xs text-muted">
            Only Floify&apos;s general landing page can be co-branded, so that&apos;s the
            link to use. This is manual because Floify&apos;s API reference isn&apos;t
            public — if they confirm partner creation is supported, this step goes away.
          </p>
        </div>

        <p className="mt-6 text-xs text-muted">
          {loading ? "Loading…" : `${rows.length} agent${rows.length === 1 ? "" : "s"}${pending.length ? ` · ${pending.length} waiting` : ""}`}
        </p>

        {!loading && rows.length === 0 && (
          <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
            Nobody has requested a page yet. Agents ask from their Application Page
            section in the suite.
          </p>
        )}

        <div className="mt-5 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                {r.headshot_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.headshot_url} alt="" className="h-10 w-10 rounded-full object-cover object-top" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-[9px] text-muted">
                    no photo
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{nameOf(r)}</p>
                  <p className="truncate text-xs text-muted">
                    {[r.brokerage, r.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {r.floify_url ? (
                  <span className="rounded-full bg-mint-500/15 px-2.5 py-0.5 text-[11px] font-bold text-mint-600">Built</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    Requested{r.floify_requested_at ? ` ${when(r.floify_requested_at)}` : ""}
                  </span>
                )}
              </div>

              {!r.headshot_url && !r.floify_url && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  No headshot on their profile yet — the co-branded page needs one.
                  Worth asking before you build it.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  className={`${input} min-w-[260px] flex-1`}
                  placeholder="https://crushmortgage.floify.com/…"
                  defaultValue={r.floify_url ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                />
                <button
                  type="button"
                  disabled={saving === r.id}
                  onClick={() => save(r)}
                  className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
                >
                  {saving === r.id ? "Saving…" : "Save"}
                </button>
                {r.floify_url && (
                  <a
                    href={r.floify_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2"
                  >
                    Open
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

export default function AdminFloifyPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
