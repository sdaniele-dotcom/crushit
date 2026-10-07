"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import {
  fetchEmailLog,
  KIND_LABELS,
  type EmailLogRow,
} from "@/lib/emailLog";

const input =
  "rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/**
 * The body of a logged email, shown in a sandboxed frame.
 *
 * srcDoc + `sandbox` with nothing enabled: the stored HTML is rendered with no
 * scripts, no form submission and no same-origin access. These bodies are ours,
 * but they are stored data being replayed into an admin's authenticated
 * session, and that is exactly the shape of thing that should not be injected
 * into the page directly.
 */
function Preview({ html }: { html: string }) {
  return (
    <iframe
      title="Email body"
      srcDoc={html}
      sandbox=""
      className="h-[60vh] w-full rounded-xl border border-border bg-white"
    />
  );
}

function Inner() {
  const [rows, setRows] = useState<EmailLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState<"" | "sent" | "failed">("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<EmailLogRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(
      await fetchEmailLog({
        kind: kind || undefined,
        status: status || undefined,
        search: search || undefined,
      }),
    );
    setLoading(false);
  }, [kind, status, search]);

  // Filters re-query; the search box is debounced so typing doesn't fire one
  // request per keystroke against a table that will get large.
  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const failed = rows.filter((r) => r.status === "failed").length;

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title={<>Email <span className="text-gradient">archive</span></>}
        subtitle="Every email the system has tried to send — flyers, welcomes, newsletters, CRM leads — including the ones that failed."
      />

      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">
          ← Admin overview
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            className={`${input} min-w-[240px] flex-1`}
            placeholder="Search recipient or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(KIND_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          <select
            className={input}
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | "sent" | "failed")}
          >
            <option value="">Sent &amp; failed</option>
            <option value="sent">Sent only</option>
            <option value="failed">Failed only</option>
          </select>
        </div>

        <p className="mt-3 text-xs text-muted">
          {loading
            ? "Loading…"
            : `${rows.length} email${rows.length === 1 ? "" : "s"}${
                failed ? ` · ${failed} failed` : ""
              }${rows.length >= 200 ? " · showing the 200 most recent" : ""}`}
        </p>

        {!loading && rows.length === 0 && (
          <p className="mt-8 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
            Nothing logged yet. Rows appear here from the moment migration 0060 is
            applied — emails sent before that were not recorded and cannot be
            backfilled.
          </p>
        )}

        <div className="mt-5 space-y-2">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpen(r)}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-border bg-white px-4 py-3 text-left hover:bg-surface-2"
            >
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  r.status === "failed"
                    ? "bg-crush-50 text-crush-700"
                    : "bg-mint-500/15 text-mint-600"
                }`}
              >
                {r.status === "failed" ? "Failed" : "Sent"}
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                {KIND_LABELS[r.kind] ?? r.kind}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">
                {r.subject}
              </span>
              <span className="truncate text-xs text-muted">{r.to_email}</span>
              <span className="text-xs text-muted">{when(r.created_at)}</span>
            </button>
          ))}
        </div>
      </Container>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/60 p-4 sm:p-8"
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-ink-900">{open.subject}</h2>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="shrink-0 rounded-full border border-border px-3 py-1 text-sm font-semibold text-ink-900 hover:bg-surface-2"
              >
                Close
              </button>
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
              {([
                ["To", open.to_email],
                ["From", open.from_email],
                ["CC", open.cc_email],
                /*
                  BCC is the answer to "did the loan officer get their copy?",
                  and it was missing from this list — the column arrived with
                  migration 0065, after this page was written. Its absence read
                  as "no blind copy was sent", which is the one thing this
                  archive exists not to leave anybody guessing about.
                */
                ["BCC", open.bcc_email],
                ["Reply-to", open.reply_to],
                ["Type", KIND_LABELS[open.kind] ?? open.kind],
                ["When", when(open.created_at)],
                ["Attachments", open.attachment_names?.join(", ") ?? null],
                ["Resend ID", open.provider_id],
              ] as [string, string | null][])
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-semibold text-muted">{k}</dt>
                    <dd className="truncate text-ink-800">{v}</dd>
                  </div>
                ))}
            </dl>

            {open.error && (
              <p className="mt-4 rounded-xl border border-crush-200 bg-crush-50 px-4 py-3 text-sm text-crush-700">
                <span className="font-bold">Failed:</span> {open.error}
              </p>
            )}

            {open.html ? (
              <div className="mt-5">
                <Preview html={open.html} />
                {open.html_truncated && (
                  <p className="mt-2 text-xs text-muted">
                    The stored copy was truncated — this is the start of the email,
                    not all of it.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted">No body was stored for this one.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminEmailsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
