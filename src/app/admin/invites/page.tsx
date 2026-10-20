"use client";

import { useEffect, useMemo, useState } from "react";
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
 * YOU PICK WHO GOES. Every row has a checkbox and a fresh paste selects them
 * all, so inviting the whole roster is still one press — but the first send
 * should be five people you can walk over to, and that was impossible when the
 * button simply took the first 25 in file order.
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
  | "would_invite" | "invited" | "reinvited" | "suppressed" | "invalid"
  | "duplicate" | "link_failed" | "send_failed";
type Result = { email: string; name: string | null; outcome: Outcome; detail?: string };

const LABEL: Record<Outcome, string> = {
  // "Invited" was used for the dry run too, with the explanation tucked into
  // the detail column — so a dry run read as a completed send.
  would_invite: "Would be invited — NOT sent",
  invited: "Invited",
  reinvited: "Re-sent (already had an account)",
  suppressed: "Skipped — on do-not-contact",
  invalid: "Skipped — bad email",
  duplicate: "Skipped — duplicate",
  link_failed: "Failed — no link",
  send_failed: "Failed — not delivered",
};
const GOOD = new Set<Outcome>(["would_invite", "invited", "reinvited"]);

function Inner() {
  const [text, setText] = useState("");
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [optIn, setOptIn] = useState(true);
  const [lastWasDry, setLastWasDry] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [find, setFind] = useState("");

  const parsed = useMemo(() => parseRoster(text), [text]);

  /*
    A FRESH PASTE SELECTS EVERYBODY. The common case is still "invite the whole
    roster", so the default has to be one click — the selection exists so you
    can send to FIVE PEOPLE YOU CAN WALK OVER TO before trusting it with 150,
    which was impossible when the button just took the first 25 in file order.
  */
  useEffect(() => {
    setPicked(new Set(parsed.rows.map((r) => r.email)));
  }, [parsed.rows]);

  // Not yet attempted in this session, so pressing the button again continues
  // rather than re-mailing the wave that just went out.
  const unsent = useMemo(
    () => parsed.rows.filter((r) => !sentEmails.has(r.email)),
    [parsed.rows, sentEmails],
  );
  const remaining = useMemo(
    () => unsent.filter((r) => picked.has(r.email)),
    [unsent, picked],
  );
  const batches = waves(remaining, WAVE);

  // Narrowing the table, not the selection: typing a name must never silently
  // change who is about to be emailed.
  const needle = find.trim().toLowerCase();
  const shown = needle
    ? parsed.rows.filter((r) =>
        `${r.first_name} ${r.last_name} ${r.email} ${r.brokerage}`.toLowerCase().includes(needle))
    : parsed.rows;

  const toggle = (email: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  // Acts on what is VISIBLE, so "find smith, select these" works as expected.
  const setAllShown = (on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const r of shown) {
        if (on) next.add(r.email);
        else next.delete(r.email);
      }
      return next;
    });

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
          optIn,
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
      setLastWasDry(dryRun);
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
                    {" "}· <strong>{remaining.length}</strong> selected to send
                    {sentEmails.size > 0 && (
                      <> · <strong>{sentEmails.size}</strong> already attempted</>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Columns used:{" "}
                    {Object.entries(parsed.mapping)
                      .map(([k, v]) => `${k} → "${v}"`)
                      .join(" · ") || "none"}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      className={`${input} max-w-xs`}
                      value={find}
                      onChange={(e) => setFind(e.target.value)}
                      placeholder="Find by name, email or brokerage…"
                    />
                    <button
                      type="button"
                      onClick={() => setAllShown(true)}
                      className="rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink-900"
                    >
                      Select {needle ? `these ${shown.length}` : "all"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllShown(false)}
                      className="rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink-900"
                    >
                      Clear {needle ? "these" : "all"}
                    </button>
                    {needle && (
                      <span className="text-xs text-muted">
                        showing {shown.length} of {parsed.rows.length} — the filter does not change
                        who is selected
                      </span>
                    )}
                  </div>
                  <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ink-50 text-muted">
                        <tr>
                          <th className="w-8 px-3 py-2">
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 accent-crush-500"
                              aria-label="Select all shown"
                              checked={shown.length > 0 && shown.every((r) => picked.has(r.email))}
                              onChange={(e) => setAllShown(e.target.checked)}
                            />
                          </th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">DRE</th>
                          <th className="px-3 py-2">Brokerage</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((r) => (
                          <tr
                            key={r.email}
                            className={`border-t border-border ${sentEmails.has(r.email) ? "text-muted" : "text-ink-900"}`}
                          >
                            <td className="px-3 py-1.5">
                              <input
                                type="checkbox"
                                className="h-3.5 w-3.5 accent-crush-500"
                                aria-label={`Select ${r.email}`}
                                checked={picked.has(r.email)}
                                disabled={sentEmails.has(r.email)}
                                onChange={() => toggle(r.email)}
                              />
                            </td>
                            <td className="px-3 py-1.5">
                              {[r.first_name, r.last_name].filter(Boolean).join(" ") || (
                                <span className="text-crush-600">no name</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5">{r.email}</td>
                            <td className="px-3 py-1.5">{r.phone || "—"}</td>
                            <td className="px-3 py-1.5">{r.dre_license || "—"}</td>
                            <td className="px-3 py-1.5">{r.brokerage || "—"}</td>
                            <td className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted">
                              {sentEmails.has(r.email) ? "attempted" : ""}
                            </td>
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
                3 · Send to {Math.min(WAVE, remaining.length)} of {remaining.length} selected
              </h2>
              <p className="mt-2 text-sm text-ink-800">
                {remaining.length > WAVE ? (
                  <>
                    {remaining.length} selected, sent {WAVE} at a time —{" "}
                    <strong>{batches.length} presses</strong> to get through them. A domain that
                    normally sends a few flyers a day looks like a different sender if it emits 150
                    at once, and the pause is also when you read the outcomes.
                  </>
                ) : (
                  <>All {remaining.length} go out in one press.</>
                )}
              </p>
              <div className="mt-3 rounded-xl border border-crush-200 bg-white p-4 text-sm text-ink-800">
                <p className="font-semibold">What each agent receives</p>
                <ul className="mt-1.5 grid gap-1 pl-4 text-[13px] [list-style:disc]">
                  <li>
                    One email, subject &ldquo;Your Crush account from{" "}
                    {remaining[0]?.brokerage || "your brokerage"}&rdquo;
                  </li>
                  <li>
                    A <strong>Set my password</strong> button —{" "}
                    <strong>no password is created or emailed</strong>, they choose their own
                  </li>
                  <li>Their name, phone, DRE and brokerage already in the account</li>
                  <li>What the suite includes, and an unsubscribe link</li>
                </ul>
              </div>
              <label className="mt-3 flex items-start gap-3 rounded-xl border border-crush-200 bg-white p-4 text-sm text-ink-800">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-crush-500"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                />
                <span>
                  <strong>Subscribe them to market-update emails.</strong>{" "}
                  {optIn ? (
                    <span className="text-muted">
                      The invite will say their brokerage subscribed them and how to stop. They can
                      untick it when they set their password, change it in their profile, or
                      unsubscribe — none of which touches their account or flyers.
                    </span>
                  ) : (
                    <span className="text-muted">
                      Off — they get the account and their flyers, and the set-password page offers
                      the newsletter as a checkbox they can tick themselves.
                    </span>
                  )}
                </span>
              </label>
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
                    {busy
                      ? "Sending…"
                      : `Yes — invite ${Math.min(WAVE, remaining.length)}: ${remaining
                          .slice(0, 3)
                          .map((r) => r.first_name || r.email)
                          .join(", ")}${remaining.length > 3 ? ` +${Math.min(WAVE, remaining.length) - 3} more` : ""}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirm(true)}
                    className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {remaining.length <= WAVE
                    ? `Invite ${remaining.length} selected…`
                    : `Invite the next ${WAVE}…`}
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

          {parsed.rows.length > 0 && remaining.length === 0 && unsent.length > 0 && (
            <div className="rounded-3xl border border-border bg-surface-2 p-6 text-sm text-ink-800">
              Nothing is selected. Tick the agents you want above — or use{" "}
              <strong>Select all</strong> — and the send panel appears.
            </div>
          )}

          {results.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
                {lastWasDry ? "Dry run — nothing was sent" : "Outcomes"}
              </h2>
              {lastWasDry && (
                <p className="mt-2 rounded-xl border border-border bg-surface-2 p-3 text-sm text-ink-800">
                  No accounts were created and no email left the building. This is what would
                  happen. Tick through it, then use <strong>Invite this wave</strong>.
                </p>
              )}
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
