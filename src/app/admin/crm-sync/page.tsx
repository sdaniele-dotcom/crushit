"use client";

import { useMemo, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";

/**
 * Push every realtor we have ever contacted into Lofty as a lead.
 *
 * NOT JUST ACCOUNT HOLDERS. The first version of this queued `profiles`, which
 * is the agents who signed up and nobody else — and most of the realtors the
 * CRM exists for have no account, because the flyer goes out before anyone
 * signs up. Migration 0069 moved the queue to realtor_crm and seeded it from
 * the flyers, the logged calls and the accounts, so this now covers everyone.
 *
 * WHY A PAGE AND NOT A SCRIPT. The backfill endpoint needs an admin's Supabase
 * token, which only exists inside a logged-in browser session. There is no way
 * to run it from a terminal without copying a credential out of one, and the
 * standing rule here is that nobody pastes credentials anywhere. So the button
 * lives where the token already is.
 *
 * IT WALKS FORWARD. The backend reads only contacts with no lofty_lead_id, so
 * each real batch removes its own rows from the next query. Press until
 * "still without a lead" reaches zero. Pressing twice over the same people
 * costs lookups and creates nothing — upsertAgentLead finds the existing lead
 * by email before it creates one.
 *
 * IT DOES NOT BACKFILL HISTORY. Leads get created; emails sent before today
 * are not replayed onto a timeline. Backdated activity reads as contact that
 * never happened, and a date in a CRM gets trusted. Past sends stay in
 * /admin/emails, which is where they actually happened.
 */

type Outcome = "created_or_found" | "skipped_has_lead" | "no_email" | "failed";
type Result = {
  email: string;
  name?: string | null;
  outcome: Outcome;
  leadId?: number;
  detail?: string;
};

const LABEL: Record<Outcome, string> = {
  // Named for what a dry run means, not for what a real run means — the
  // invites page shipped with one label for both and a dry run read as a send.
  created_or_found: "Created or matched",
  skipped_has_lead: "Already linked — skipped",
  no_email: "Skipped — no email",
  failed: "Failed",
};

function Inner() {
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [lastWasDry, setLastWasDry] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [ranReal, setRanReal] = useState(false);

  async function run(dryRun: boolean) {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setBusy(false);
      toast({ emoji: "🔒", title: "Session expired", body: "Please log in again." });
      return;
    }
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/lofty-backfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dryRun, limit: 25 }),
      });
      const d = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        error?: string;
        results?: Result[];
        withoutLeadBefore?: number | null;
      };
      if (!res.ok || !d.ok) {
        toast({ emoji: "⚠️", title: "Couldn't run", body: d.error || "Please try again." });
        return;
      }
      const got = d.results ?? [];
      // A dry run replaces the table; a real batch appends, because the real
      // batches are a sequence and the operator is watching a total build up.
      setResults((prev) => (dryRun ? got : [...prev, ...got]));
      setLastWasDry(dryRun);
      if (!dryRun) setRanReal(true);
      // Reported BEFORE this batch ran, so subtract what a real batch just took.
      const before = d.withoutLeadBefore ?? null;
      setRemaining(
        before === null ? null : dryRun ? before : Math.max(before - got.length, 0),
      );
      setConfirm(false);
      const made = got.filter((r) => r.outcome === "created_or_found").length;
      toast({
        emoji: dryRun ? "🔎" : "🔗",
        title: dryRun ? "Dry run finished" : `Batch done — ${made} of ${got.length}`,
        body: dryRun
          ? "Nothing was created in Lofty. Check the table, then run for real."
          : "Press again while any agents are still without a lead.",
      });
    } catch {
      toast({ emoji: "⚠️", title: "Network error", body: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const tally = useMemo(
    () =>
      results.reduce<Record<string, number>>((a, r) => {
        a[r.outcome] = (a[r.outcome] ?? 0) + 1;
        return a;
      }, {}),
    [results],
  );

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Sync agents to Lofty"
        subtitle="Create a Lofty lead for every realtor in the system — flyer recipients included, not just the ones with accounts. Runs 25 at a time."
      />
      <Container className="py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-semibold text-ink-900">What this does</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>
                • <strong>Everyone we have contacted</strong> — every agent a listing
                flyer was built for, everyone with a logged call, text or note, and every
                account holder. Having a Crush account is not required.
              </li>
              <li>
                • Each becomes a lead of type <strong>Agent</strong> in the Lofty account
                on <strong>amraj@crushmortgage.com</strong>, owned by that account.
              </li>
              <li>
                • Every lead is tagged <strong>Crush Realtor Suite</strong>, plus{" "}
                <strong>LO: &lt;name&gt;</strong> for the loan officer who owns that
                realtor — filter on that tag to get one view per officer.
              </li>
              <li>
                • Anyone who unsubscribed still goes in, carrying a visible{" "}
                <strong>Do not email</strong> tag. Leaving them out would make the CRM
                look complete while hiding them; leaving them unmarked would let someone
                email them from Lofty, which Lofty has no other way to know.
              </li>
              <li>
                • Contacts already linked to a lead are skipped, so running this twice is
                safe and creates no duplicates.
              </li>
              <li>
                • <strong>Emails sent before today are not added to any timeline.</strong>{" "}
                Backdated activity would read as contact that never happened. From here
                every send logs itself; the history stays in the email archive.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => run(true)}
                disabled={busy}
                className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2 disabled:opacity-50"
              >
                {busy ? "Working…" : "Dry run — show me who"}
              </button>
              {!confirm ? (
                <button
                  onClick={() => setConfirm(true)}
                  disabled={busy}
                  className="rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
                >
                  {ranReal ? "Run next 25" : "Create the leads"}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 px-4 py-2">
                  <span className="text-sm text-ink-700">
                    Creates up to 25 real leads in Lofty.
                  </span>
                  <button
                    onClick={() => run(false)}
                    disabled={busy}
                    className="rounded-full bg-crush-500 px-5 py-2 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
                  >
                    Yes, create them
                  </button>
                  <button
                    onClick={() => setConfirm(false)}
                    className="text-sm font-semibold text-ink-600 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {remaining !== null && (
                <span className="text-sm text-ink-600">
                  {remaining === 0
                    ? "Everybody has a lead."
                    : `${remaining} still without a lead.`}
                </span>
              )}
            </div>
          </div>

          {results.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold text-ink-900">
                {lastWasDry ? "Dry run — nothing was created" : "Results"}
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                {Object.entries(tally)
                  .map(([k, n]) => `${n} ${LABEL[k as Outcome] ?? k}`)
                  .join(" · ")}
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-ink-500">
                    <tr>
                      <th className="pb-2 pr-4">Agent</th>
                      <th className="pb-2 pr-4">Outcome</th>
                      <th className="pb-2">Tags / detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {results.map((r, i) => (
                      <tr key={`${r.email}-${i}`}>
                        <td className="py-2 pr-4 text-ink-900">
                          {r.name ? (
                            <>
                              <span className="font-medium">{r.name}</span>
                              <span className="block text-xs text-ink-500">{r.email}</span>
                            </>
                          ) : (
                            r.email
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={
                              r.outcome === "failed"
                                ? "font-semibold text-red-600"
                                : r.outcome === "created_or_found"
                                  ? "font-semibold text-emerald-700"
                                  : "text-ink-600"
                            }
                          >
                            {LABEL[r.outcome] ?? r.outcome}
                          </span>
                        </td>
                        <td className="py-2 text-ink-600">
                          {r.detail ?? (r.leadId ? `Lead ${r.leadId}` : "")}
                        </td>
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

export default function AdminCrmSyncPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
