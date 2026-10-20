"use client";

import { useMemo, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";
import { parseRoster, waves, type RosterRow } from "@/lib/rosterParse";

/**
 * Bulk-invite the brokerage roster.
 *
 * NOBODY IS SENT A PASSWORD. The backend creates each account WITHOUT one and
 * emails a link to set it, so there is no credential in an inbox, nothing
 * stored, and nothing for anyone here to know. "Email them their login" is the
 * thing this page exists to avoid.
 *
 * IT SENDS IN WAVES, AND THAT IS NOT A TECHNICAL LIMIT. A domain that normally
 * sends a handful of flyers a day looks like a different sender if it emits 150
 * messages at once, which is how a sending reputation gets spent. More to the
 * point, the operator should read the first wave's outcomes before committing
 * the rest — so the button sends one wave and stops.
 */

const WAVE = 25;
const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

type Outcome =
  | "invited" | "reinvited" | "suppressed" | "invalid"
  | "duplicate" | "link_failed" | "send_failed";
type Result = { email: string; name: string | null; outcome: Outcome; detail?: string };

const LABEL: Record<Outcome, string> = {
  invited: "Invited",
  reinvited: "Re-sent (already had an account)",
  suppressed: "Skipped — on do-not-contact",
  invalid: "Skipped — bad email",
  duplicate: "Skipped — duplicate",
  link_failed: "Failed — no link",
  send_failed: "Failed — not delivered",
};
const GOOD = new Set<Outcome>(["invited", "reinvited"]);

function Inner() {
  const [text, setText] = useState("");
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const parsed = useMemo(() => parseRoster(text), [text]);
  // Everything not yet attempted in this session, so pressing the button again
  // continues rather than re-mailing the wave that just went out.
  const remaining = useMemo(
    () => parsed.rows.filter((r) => !sentEmails.has(r.email)),
    [parsed.rows, sentEmails],
  );
  const batches = waves(remaining, WAVE);

  async function send(dryRun: boolean) {
    const sb = getSupabase();
    if (!sb) return;
    const batch = batches[0];
    if (!batch?.length) return;
    setBusy(true);
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setBusy(false);
      toast({ emoji: "🔒", title: "Session expired", body: "Please log in again." });
      return;
    }
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/invite-agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dryRun,
          agents: batch.map((r: RosterRow) => ({
            email: r.email,
            first_name: r.first_name,
            last_name: r.last_name,
            phone: r.phone,
            dre_license: r.dre_license,
            brokerage: r.brokerage,
          })),
        }),
      });
      const d = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean; error?: string; results?: Result[];
      };
      if (!res.ok || !d.ok) {
        toast({ emoji: "⚠️", title: "Couldn't send", body: d.error || "Please try again." });
        return;
      }
      const got = d.results ?? [];
      setResults((prev) => [...prev, ...got]);
      if (!dryRun) {
        // Mark EVERY address the backend reported on, not just the successes:
        // a bad address or a suppressed one must not be retried on the next
        // press, or the last wave never ends.
        setSentEmails((prev) => new Set([...prev, ...got.map((r) => r.email)]));
      }
      const good = got.filter((r) => GOOD.has(r.outcome)).length;
      toast({
        emoji: dryRun ? "🔎" : "✉️",
        title: dryRun ? "Dry run finished" : `Wave sent — ${good} of ${got.length}`,
        body: dryRun
          ? "Nothing was created or emailed. Check the table, then send for real."
          : "Read the outcomes before sending the next wave.",
      });
      setConfirm(false);
    } catch {
      toast({ emoji: "⚠️", title: "Network error", body: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const tally = results.reduce<Record<string, number>>((a, r) => {
    a[r.outcome] = (a[r.outcome] ?? 0) + 1;
    return a;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Invite agents"
        subtitle="Create Crush accounts for your brokerage and email each agent a link to set their own password."
      />
      <Container className="pb-20">
        <div className="grid gap-6">
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
              1 · Paste the roster
            </h2>
            <p className="mt-2 text-sm text-muted">
              CSV or a paste straight out of Excel. It finds its own header row and reads the
              columns it recognises — agent name, email, phone, DRE and brokerage — in whatever
              order they come. Save As CSV first if you have an .xlsx.
            </p>
            <textarea
              className={`${input} mt-3 min-h-[180px] font-mono text-xs`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Agent Name,Agent Email,Agent Phone,DRE #,Brokerage\nCruz Zavala,cruz4homes@gmail.com,562-682-7005,01240727,HomeSmart Realty Group"}
            />
            <div className="mt-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                …or pick a .csv file
              </label>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                className="mt-1 block w-full text-sm"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setText(await f.text());
                }}
              />
            </div>
          </div>

          {text.trim() && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
                2 · Check what it read
              </h2>
              {parsed.headerLine === 0 ? (
                <p className="mt-3 rounded-xl border border-crush-200 bg-crush-50 p-3 text-sm text-crush-700">
                  {parsed.skipped[0]?.reason ?? "Couldn't read that."}
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-ink-800">
                    <strong>{parsed.rows.length}</strong> agent
                    {parsed.rows.length === 1 ? "" : "s"} from header row {parsed.headerLine}
                    {parsed.skipped.length > 0 && (
                      <> · <strong>{parsed.skipped.length}</strong> row
                        {parsed.skipped.length === 1 ? "" : "s"} skipped</>
                    )}
                    {remaining.length !== parsed.rows.length && (
                      <> · <strong>{remaining.length}</strong> still to send</>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Columns used:{" "}
                    {Object.entries(parsed.mapping)
                      .map(([k, v]) => `${k} → "${v}"`)
                      .join(" · ") || "none"}
                  </p>
                  <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ink-50 text-muted">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">DRE</th>
                          <th className="px-3 py-2">Brokerage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.rows.map((r) => (
                          <tr
                            key={r.email}
                            className={`border-t border-border ${sentEmails.has(r.email) ? "text-muted" : "text-ink-900"}`}
                          >
                            <td className="px-3 py-1.5">
                              {[r.first_name, r.last_name].filter(Boolean).join(" ") || (
                                <span className="text-crush-600">no name</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5">{r.email}</td>
                            <td className="px-3 py-1.5">{r.phone || "—"}</td>
                            <td className="px-3 py-1.5">{r.dre_license || "—"}</td>
                            <td className="px-3 py-1.5">{r.brokerage || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsed.skipped.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-crush-700">
                        {parsed.skipped.length} skipped row
                        {parsed.skipped.length === 1 ? "" : "s"} — why
                      </summary>
                      <ul className="mt-2 grid gap-1 text-xs text-muted">
                        {parsed.skipped.map((s, i) => (
                          <li key={i}>
                            {s.line ? `Line ${s.line}: ` : ""}
                            {s.reason}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              )}
            </div>
          )}

          {remaining.length > 0 && (
            <div className="rounded-3xl border border-crush-200 bg-crush-50 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
                3 · Send a wave of {Math.min(WAVE, remaining.length)}
              </h2>
              <p className="mt-2 text-sm text-ink-800">
                {batches.length} wave{batches.length === 1 ? "" : "s"} to go. Each agent gets a
                link to set their own password — <strong>no password is created or emailed</strong>.
                They are added <strong>opted out</strong> of marketing email; the set-password page
                offers it as a checkbox.
              </p>
              <p className="mt-2 text-xs text-muted">
                Anyone on the do-not-contact list is skipped. That list lives on the mortgage
                side — clear wrongly-suppressed agents at{" "}
                <a
                  href={`${site.flyerApiBase}/admin/suppressions`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  suppressions
                </a>{" "}
                first, or their invite is silently dropped.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send(true)}
                  className="rounded-full border border-crush-300 bg-white px-5 py-2.5 text-sm font-semibold text-crush-700 disabled:opacity-60"
                >
                  {busy ? "Working…" : "Dry run (send nothing)"}
                </button>
                {confirm ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send(false)}
                    className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {busy ? "Sending…" : `Yes — invite these ${Math.min(WAVE, remaining.length)}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirm(true)}
                    className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Invite this wave…
                  </button>
                )}
                {confirm && (
                  <button
                    type="button"
                    onClick={() => setConfirm(false)}
                    className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
                Outcomes
              </h2>
              <p className="mt-2 text-sm text-ink-800">
                {Object.entries(tally)
                  .map(([k, n]) => `${n} ${LABEL[k as Outcome] ?? k}`)
                  .join(" · ")}
              </p>
              <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={`${r.email}-${i}`} className="border-t border-border">
                        <td className="px-3 py-1.5 text-ink-900">{r.email}</td>
                        <td className="px-3 py-1.5">
                          <span className={GOOD.has(r.outcome) ? "text-ink-800" : "text-crush-700"}>
                            {LABEL[r.outcome] ?? r.outcome}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-muted">{r.detail ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

export default function AdminInvitesPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
