"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import {
  fetchContacts, fetchTimeline, logTouch, deleteTouch,
  type Contact, type TimelineItem, type TouchKind,
} from "@/lib/realtorCrm";
import { toast } from "@/lib/toast";

const field =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

const ICON: Record<string, string> = {
  flyer: "📄", email: "✉️", call: "📞", text: "💬", meeting: "🤝", note: "📝",
};

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function dayAgo(iso: string | null) {
  if (!iso) return "never";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d}d ago`;
}

/** The log-a-touch form. Defaults to a call today, which is the common case. */
function LogTouch({ contact, onLogged }: { contact: Contact; onLogged: () => void }) {
  const { user, profile } = useAuth();
  const [kind, setKind] = useState<TouchKind>("call");
  const [direction, setDirection] = useState<"outbound" | "inbound">("outbound");
  const [body, setBody] = useState("");
  // datetime-local wants local wall-clock with no zone, hence the slice.
  const [at, setAt] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const ok = await logTouch({
      email: contact.email,
      name: contact.name,
      kind,
      direction,
      body,
      occurredAt: new Date(at).toISOString(),
      loggedBy: user?.id ?? null,
      loggedByName: fullName(profile) || null,
    });
    setBusy(false);
    if (!ok) {
      toast({ emoji: "⚠️", title: "Couldn't save", body: "Check your admin access and try again." });
      return;
    }
    setBody("");
    onLogged();
    toast({ emoji: "✅", title: "Logged", body: `Added to ${contact.name || contact.email}'s timeline.` });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Log a touch</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["call", "text", "meeting", "note", "email"] as TouchKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${
              kind === k ? "bg-crush-500 text-white" : "border border-border bg-white text-ink-900 hover:bg-surface-2"
            }`}
          >
            {ICON[k]} {k}
          </button>
        ))}
      </div>
      {kind !== "note" && (
        <div className="mt-3 flex gap-2">
          {(["outbound", "inbound"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                direction === d ? "bg-ink-900 text-white" : "border border-border bg-white text-ink-900 hover:bg-surface-2"
              }`}
            >
              {d === "outbound" ? "We reached out" : "They reached out"}
            </button>
          ))}
        </div>
      )}
      <textarea
        className={`${field} mt-3 min-h-[80px]`}
        placeholder={kind === "call" ? "What was said, and what happens next…" : "Details…"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input type="datetime-local" className={`${field} max-w-[220px]`} value={at} onChange={(e) => setAt(e.target.value)} />
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Log it"}
        </button>
      </div>
    </div>
  );
}

function Inner() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [tlLoading, setTlLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setContacts(await fetchContacts());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const loadTimeline = useCallback(async (c: Contact) => {
    setTlLoading(true);
    setTimeline(await fetchTimeline(c.email));
    setTlLoading(false);
  }, []);

  function select(c: Contact) {
    setSelected(c);
    setTimeline([]);
    void loadTimeline(c);
  }

  async function remove(id: string) {
    if (!(await deleteTouch(id))) {
      toast({ emoji: "⚠️", title: "Couldn't remove that", body: "Please try again." });
      return;
    }
    if (selected) void loadTimeline(selected);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) =>
      [c.email, c.name, c.brokerage].filter(Boolean).some((v) => v!.toLowerCase().includes(s)),
    );
  }, [contacts, q]);

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title={<>Realtor <span className="text-gradient">contacts</span></>}
        subtitle="Every agent we've sent a flyer to, and everything we've sent them — flyers with the loan officer who sent them, emails, and the calls and texts you log."
      />

      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* ── The list ─────────────────────────────────────────────── */}
          <div>
            <input
              className={field}
              placeholder="Search name, email, brokerage…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted">
              {loading ? "Loading…" : `${filtered.length} realtor${filtered.length === 1 ? "" : "s"}`}
            </p>

            {!loading && contacts.length === 0 && (
              <p className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
                Nobody yet. Realtors appear here once a flyer has been created for
                them, or once you log a call or a note against their email.
              </p>
            )}

            <div className="mt-3 max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
              {filtered.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => select(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
                    selected?.email === c.email
                      ? "border-crush-300 bg-crush-50"
                      : "border-border bg-white hover:bg-surface-2"
                  }`}
                >
                  {c.headshotUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.headshotUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover object-top" />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold text-muted">
                      {(c.name || c.email).slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">
                      {c.name || c.email}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {c.brokerage || c.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {c.profileId && <span className="block text-[10px] font-bold text-mint-600">account</span>}
                    <span className="block text-[10px] text-muted">{dayAgo(c.lastTouchAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── The timeline ─────────────────────────────────────────── */}
          <div>
            {!selected ? (
              <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
                Pick a realtor to see everything we&apos;ve sent them.
              </p>
            ) : (
              <>
                <div className="rounded-2xl border border-border bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-ink-900">{selected.name || selected.email}</h2>
                      <p className="mt-0.5 text-sm text-muted">
                        {[selected.brokerage, selected.email, selected.phone].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`mailto:${selected.email}`} className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-surface-2">Email</a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-surface-2">Call</a>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {selected.flyerCount} flyer{selected.flyerCount === 1 ? "" : "s"} ·
                    last touch {dayAgo(selected.lastTouchAt)}
                    {selected.profileId ? " · has a suite account" : " · no account yet"}
                  </p>
                </div>

                <div className="mt-4">
                  <LogTouch contact={selected} onLogged={() => { void loadTimeline(selected); void load(); }} />
                </div>

                <div className="mt-6 space-y-2">
                  {tlLoading && <p className="text-sm text-muted">Loading timeline…</p>}
                  {!tlLoading && timeline.length === 0 && (
                    <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
                      Nothing recorded yet. Flyers and emails appear automatically;
                      calls and texts show up here once you log them above.
                    </p>
                  )}
                  {timeline.map((t) => (
                    <div key={t.id} className="flex gap-3 rounded-2xl border border-border bg-white p-4">
                      <span className="text-lg" aria-hidden>{ICON[t.kind] ?? "•"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink-900">
                          {t.title}
                          {t.purpose === "preview" && (
                            <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted">
                              not sent
                            </span>
                          )}
                        </p>
                        {t.detail && <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{t.detail}</p>}
                        <p className="mt-1 text-xs text-muted">
                          {when(t.at)}
                          {t.who ? ` · ${t.who}` : ""}
                        </p>
                      </div>
                      {t.touchId && (
                        <button
                          type="button"
                          onClick={() => remove(t.touchId!)}
                          className="shrink-0 self-start text-xs font-semibold text-muted hover:text-crush-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default function AdminRealtorsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
