"use client";

import { useCallback, useEffect, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";

/**
 * Add and edit the buyer guides.
 *
 * THE FILE LIVES WHEREVER YOU LIKE. This stores a URL, not an upload — a PDF
 * in the site's own /guides-library folder, a storage bucket, anywhere that
 * serves a link. That keeps a new guide from needing a storage integration to
 * exist, at the honest cost that nothing here checks the URL resolves: a typo
 * produces a broken download rather than an error.
 *
 * "REQUIRES EMAIL" IS A COURTESY, NOT A LOCK, and the form says so. The URL is
 * on a published row that anyone can read, so the gate earns leads from people
 * who play along — it does not protect the document.
 */

type Row = {
  id: string;
  slug: string;
  title: string;
  blurb: string | null;
  topic: string | null;
  file_url: string | null;
  page_count: number | null;
  requires_email: boolean;
  published: boolean;
  sort_weight: number;
};

const EMPTY: Omit<Row, "id"> = {
  slug: "",
  title: "",
  blurb: "",
  topic: "",
  file_url: "",
  page_count: null,
  requires_email: false,
  published: false,
  sort_weight: 0,
};

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
      .from("guides")
      .select("*")
      .order("sort_weight", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({
        emoji: "⚠️",
        title: "Couldn't load guides",
        body: error.message.includes("does not exist")
          ? "Migration 0072 has not been applied yet."
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
      topic: editing.topic?.trim() || null,
      file_url: editing.file_url?.trim() || null,
      page_count: editing.page_count || null,
      requires_email: editing.requires_email,
      published: editing.published,
      sort_weight: editing.sort_weight || 0,
      updated_at: new Date().toISOString(),
    };
    const { error } = editing.id
      ? await sb.from("guides").update(payload).eq("id", editing.id)
      : await sb.from("guides").insert(payload);
    setBusy(false);
    if (error) {
      toast({
        emoji: "⚠️",
        title: "Couldn't save",
        body: error.code === "23505" ? "That slug is already taken." : error.message,
      });
      return;
    }
    toast({ emoji: "✅", title: editing.id ? "Saved" : "Guide added" });
    setEditing(null);
    void load();
  }

  async function remove(r: Row) {
    const sb = getSupabase();
    if (!sb) return;
    if (!confirm(`Delete "${r.title}"? Downloads already collected are kept.`)) return;
    const { error } = await sb.from("guides").delete().eq("id", r.id);
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
      .from("guides")
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
        title="Buyer guides"
        subtitle="The downloadable guides on the public site. Each one can be free to open, or ask for a name and an email first."
      />
      <Container className="py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          {!editing && (
            <button
              onClick={() => setEditing({ ...EMPTY })}
              className="rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
            >
              + New guide
            </button>
          )}

          {editing && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold text-ink-900">
                {editing.id ? "Edit guide" : "New guide"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">Title</span>
                  <input
                    className={input}
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="Real Estate Wealth Road Map"
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
                    placeholder={slugify(editing.title) || "real-estate-wealth-road-map"}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">One-line blurb</span>
                  <input
                    className={input}
                    value={editing.blurb ?? ""}
                    onChange={(e) => setEditing({ ...editing, blurb: e.target.value })}
                    placeholder="How a first home becomes your first investment."
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold text-ink-700">
                    File URL <span className="font-normal text-muted">— e.g. /guides-library/your-file.pdf</span>
                  </span>
                  <input
                    className={input}
                    value={editing.file_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, file_url: e.target.value })}
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-ink-700">Topic tag</span>
                  <input
                    className={input}
                    value={editing.topic ?? ""}
                    onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                    placeholder="Building wealth"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-ink-700">Pages</span>
                  <input
                    type="number"
                    className={input}
                    value={editing.page_count ?? ""}
                    onChange={(e) => setEditing({ ...editing, page_count: Number(e.target.value) || null })}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.requires_email}
                    onChange={(e) => setEditing({ ...editing, requires_email: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-semibold text-ink-900">Ask for an email first</span>
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

              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <strong>&ldquo;Ask for an email&rdquo; is a courtesy, not a lock.</strong> Once
                published, the file URL is readable by anyone who views the page source — the
                gate earns you leads from people who play along, it does not protect the
                document. Don&apos;t put anything confidential behind it.
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
                No guides yet. Add one and tick Published to put it on the site.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{r.title}</p>
                      <p className="text-xs text-muted">
                        {r.requires_email ? "Email required" : "Free to open"}
                        {!r.file_url && (
                          <span className="font-semibold text-amber-700"> · no file yet — hidden</span>
                        )}
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
                    <button onClick={() => setEditing({ ...r })} className="text-sm font-semibold text-crush-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(r)} className="text-sm font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default function AdminGuidesPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
