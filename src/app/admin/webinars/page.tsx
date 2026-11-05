"use client";

import { useCallback, useEffect, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { formatWhen, webinarState } from "@/lib/webinars";
import { toast } from "@/lib/toast";

/**
 * Add and edit webinars.
 *
 * WRITES GO STRAIGHT TO SUPABASE with the admin's own JWT, not through the
 * backend. Migration 0071's policy checks profiles.role, so the database is
 * the thing enforcing admin-ness — an endpoint in front of it would be a
 * second place to get the same check wrong. Registrations are the opposite
 * case and deliberately not readable here at all: that table is service-role
 * only, because it holds consumer phone numbers.
 *
 * PUBLISHED IS NOT THE ONLY GATE. A row with neither a date nor a recording
 * has nothing for a button to do, so the public list hides it even when
 * published. The status column below says so rather than letting someone tick
 * Published and wonder where it went.
 */

type Row = {
  id: string;
  slug: string;
  title: string;
  blurb: string | null;
  description: string | null;
  starts_at: string | null;
  duration_mins: number | null;
  recording_url: string | null;
  join_url: string | null;
  host_name: string | null;
  topic: string | null;
  published: boolean;
  sort_weight: number;
};

const EMPTY: Omit<Row, "id"> = {
  slug: "",
  title: "",
  blurb: "",
  description: "",
  starts_at: null,
  duration_mins: 30,
  recording_url: "",
  join_url: "",
  host_name: "",
  topic: "",
  published: false,
  sort_weight: 0,
};

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

/** "First-Time Buyer 101!" → "first-time-buyer-101". */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** A datetime-local value needs the LOCAL wall clock, not an ISO Z string. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Inner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Omit<Row, "id"> & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const { data, error } = await sb
      .from("webinars")
      .select("*")
      .order("starts_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) {
      toast({
        emoji: "⚠️",
        title: "Couldn't load webinars",
        body: error.message.includes("does not exist")
          ? "Migration 0071 has not been applied yet."
          : error.message,
      });
    }
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!editing) return;
    const sb = getSupabase();
    if (!sb) return;

    const slug = slugify(editing.slug || editing.title);
    if (!slug || !editing.title.trim()) {
      toast({ emoji: "⚠️", title: "Needs a title", body: "A title and a slug are required." });
      return;
    }

    setBusy(true);
    const payload = {
      slug,
      title: editing.title.trim(),
      blurb: editing.blurb?.trim() || null,
      description: editing.description?.trim() || null,
      // The input gives local wall-clock time; store the real instant.
      starts_at: editing.starts_at ? new Date(editing.starts_at).toISOString() : null,
      duration_mins: editing.duration_mins || null,
      recording_url: editing.recording_url?.trim() || null,
      join_url: editing.join_url?.trim() || null,
      host_name: editing.host_name?.trim() || null,
      topic: editing.topic?.trim() || null,
      published: editing.published,
      sort_weight: editing.sort_weight || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = editing.id
      ? await sb.from("webinars").update(payload).eq("id", editing.id)
      : await sb.from("webinars").insert(payload);

    setBusy(false);
    if (error) {
      toast({
        emoji: "⚠️",
        title: "Couldn't save",
        body: error.code === "23505" ? "That slug is already taken." : error.message,
      });
      return;
    }
    toast({ emoji: "✅", title: editing.id ? "Saved" : "Webinar created" });
    setEditing(null);
    void load();
  }

  async function remove(r: Row) {
    const sb = getSupabase();
    if (!sb) return;
    // Registrations survive: the foreign key is ON DELETE SET NULL and each row
    // keeps a snapshot of the slug and title. Worth saying, because "delete the
    // webinar" sounds like it should take the sign-ups with it.
    if (!confirm(`Delete "${r.title}"? Sign-ups already collected are kept.`)) return;
    const { error } = await sb.from("webinars").delete().eq("id", r.id);
    if (error) {
      toast({ emoji: "⚠️", title: "Couldn't delete", body: error.message });
      return;
    }
    toast({ emoji: "🗑️", title: "Deleted" });
    void load();
  }

  async function togglePublished(r: Row) {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb
      .from("webinars")
      .update({ published: !r.published, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    if (error) {
      toast({ emoji: "⚠️", title: "Couldn't update", body: error.message });
      return;
    }
    void load();
  }

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Webinars"
        subtitle="What appears on the public site. Upcoming events take registrations; once the date passes, add a recording and the same entry becomes a replay."
      />
      <Container className="py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          {!editing && (
            <button
              onClick={() => setEditing({ ...EMPTY })}
              className="rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
            >
              + New webinar
            </button>
          )}

          {editing && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold text-ink-900">
                {editing.id ? "Edit webinar" : "New webinar"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">Title</span>
                  <input
                    className={input}
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="What's a payment on a $700k house?"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">
                    Slug <span className="font-normal text-muted">— leave blank to build from the title</span>
                  </span>
                  <input
                    className={input}
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    placeholder={slugify(editing.title) || "whats-a-payment-700k"}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">One-line blurb</span>
                  <input
                    className={input}
                    value={editing.blurb ?? ""}
                    onChange={(e) => setEditing({ ...editing, blurb: e.target.value })}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">
                    Description <span className="font-normal text-muted">— blank line between paragraphs</span>
                  </span>
                  <textarea
                    className={`${input} min-h-[110px]`}
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-ink-700">Date &amp; time</span>
                  <input
                    type="datetime-local"
                    className={input}
                    value={toLocalInput(editing.starts_at)}
                    onChange={(e) => setEditing({ ...editing, starts_at: e.target.value || null })}
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-ink-700">Minutes</span>
                  <input
                    type="number"
                    className={input}
                    value={editing.duration_mins ?? ""}
                    onChange={(e) => setEditing({ ...editing, duration_mins: Number(e.target.value) || null })}
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-ink-700">Host</span>
                  <input
                    className={input}
                    value={editing.host_name ?? ""}
                    onChange={(e) => setEditing({ ...editing, host_name: e.target.value })}
                    placeholder="Shannon Daniele"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-ink-700">Topic tag</span>
                  <input
                    className={input}
                    value={editing.topic ?? ""}
                    onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                    placeholder="First-time buyers"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">
                    Join link <span className="font-normal text-muted">— emailed to registrants</span>
                  </span>
                  <input
                    className={input}
                    value={editing.join_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, join_url: e.target.value })}
                    placeholder="https://zoom.us/j/…"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">
                    Recording link <span className="font-normal text-muted">— add after it airs; turns it into a replay</span>
                  </span>
                  <input
                    className={input}
                    value={editing.recording_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, recording_url: e.target.value })}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.published}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-semibold text-ink-900">Published</span>
                </label>
              </div>

              {/*
                Said here rather than discovered later: the join link is on a
                row the public can read once it is published.
              */}
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Once published, this webinar&apos;s join link is readable by anyone who views the
                page source. Fine for a free marketing webinar; do not put a paid or
                private event link here.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={save}
                  disabled={busy}
                  className="rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-full border border-border bg-white px-6 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-white">
            {loading ? (
              <p className="px-5 py-6 text-sm text-muted">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                No webinars yet. Add one and tick Published to put it on the site.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r) => {
                  const state = webinarState(r);
                  return (
                    <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink-900">{r.title}</p>
                        <p className="text-xs text-muted">
                          {formatWhen(r.starts_at) ?? "No date"}
                          {" · "}
                          <span className={state === "draft" ? "font-semibold text-amber-700" : ""}>
                            {state === "upcoming"
                              ? "Upcoming"
                              : state === "replay"
                                ? "Replay"
                                : "Needs a date or a recording — hidden"}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => togglePublished(r)}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          r.published ? "bg-emerald-50 text-emerald-700" : "bg-surface-2 text-muted"
                        }`}
                      >
                        {r.published ? "Published" : "Draft"}
                      </button>
                      <button
                        onClick={() => setEditing({ ...r, starts_at: r.starts_at })}
                        className="text-sm font-semibold text-crush-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="text-sm font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default function AdminWebinarsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
