"use client";

import { useState } from "react";
import { fetchLoanPrograms, matchPrograms, splitMatches, saveScenario, type BuyerAnswers, type Match } from "@/lib/loanPrograms";
import { recordUse } from "@/lib/rewards";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/lib/toast";

const inp = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const lbl = "text-xs font-semibold uppercase tracking-wide text-muted";

const CREDIT = ["740+", "680-739", "620-679", "580-619", "<580"];
const PROPERTY = ["single-family", "condo", "townhome", "multi-unit"];
const OCCUPANCY = ["primary", "second", "investment"];

function num(v: string): number { return parseFloat(v.replace(/[^\d.]/g, "")) || 0; }

export function LoanFinder() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [a, setA] = useState<BuyerAnswers>({
    creditRange: "680-739", price: 0, down: 0, firstTime: false, veteran: false,
    selfEmployed: false, propertyType: "single-family", occupancy: "primary",
  });
  const [results, setResults] = useState<Match[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = <K extends keyof BuyerAnswers>(k: K, v: BuyerAnswers[K]) => setA((s) => ({ ...s, [k]: v }));

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSent(false);
    const programs = await fetchLoanPrograms(true);
    const m = matchPrograms(a, programs);
    setResults(m);
    setBusy(false);
    if (user) void recordUse("loan_finder", { events: ["financing_tool_used"], relatedType: "loan_finder", description: "Used the loan program finder" });
  }

  async function send() {
    if (!results) return;
    if (!user) { toast({ emoji: "🔒", title: "Log in to send", body: "Create a free account to send scenarios to Crush Mortgage." }); return; }
    const ok = await saveScenario(a, results.map((r) => r.program.slug));
    if (ok) { setSent(true); toast({ emoji: "📨", title: "Scenario sent to Crush Mortgage", body: "A loan officer will follow up with you." }); }
  }

  return (
    <div className="rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Find a loan for my buyer</h2>
          <p className="mt-1 text-sm text-muted">Answer a few questions — we&apos;ll suggest programs worth exploring. This is informational, not a qualification decision.</p>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">
          {open ? "Hide" : "Start"}
        </button>
      </div>

      {open && (
        <form onSubmit={run} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block"><span className={lbl}>Credit score range</span>
              <select className={inp} value={a.creditRange} onChange={(e) => set("creditRange", e.target.value)}>
                {CREDIT.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block"><span className={lbl}>Purchase price</span>
              <input className={inp} inputMode="numeric" placeholder="$450,000" onChange={(e) => set("price", num(e.target.value))} />
            </label>
            <label className="block"><span className={lbl}>Down payment available</span>
              <input className={inp} inputMode="numeric" placeholder="$45,000" onChange={(e) => set("down", num(e.target.value))} />
            </label>
            <label className="block"><span className={lbl}>Property type</span>
              <select className={inp} value={a.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
                {PROPERTY.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block"><span className={lbl}>Occupancy</span>
              <select className={inp} value={a.occupancy} onChange={(e) => set("occupancy", e.target.value)}>
                {OCCUPANCY.map((o) => <option key={o} value={o}>{o === "primary" ? "primary residence" : o === "second" ? "second home" : "investment"}</option>)}
              </select>
            </label>
            <label className="block"><span className={lbl}>Approx. annual income (optional)</span>
              <input className={inp} inputMode="numeric" placeholder="$120,000" onChange={(e) => set("income", num(e.target.value))} />
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            {([["firstTime", "First-time buyer"], ["veteran", "Veteran / active-duty"], ["selfEmployed", "Self-employed / 1099"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-ink-800">
                <input type="checkbox" className="h-4 w-4 accent-crush-500" checked={a[k]} onChange={(e) => set(k, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          <button type="submit" disabled={busy} className="justify-self-start rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
            {busy ? "Matching…" : "Show programs worth exploring"}
          </button>
        </form>
      )}

      {results && (() => {
        const { standard, exclusive } = splitMatches(results);
        return (
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Programs that may be worth exploring</h3>
          {results.length === 0 && <p className="mt-3 text-sm text-muted">No clear matches from the answers given — a quick chat with a loan officer is the best next step.</p>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {standard.map((m) => <ProgramCard key={m.program.id} m={m} />)}
          </div>

          {exclusive.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-crush-500 px-2.5 py-1 text-xs font-bold text-white">⭐ Exclusive</span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Exclusive Crush Mortgage programs to ask about</h3>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {exclusive.map((m) => <ProgramCard key={m.program.id} m={m} exclusive />)}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={send} disabled={sent} className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60">
              {sent ? "Sent ✓" : "Send scenario to Crush Mortgage"}
            </button>
            <span className="text-xs text-muted">Your agent info is attached automatically.</span>
          </div>
          <p className="mt-4 rounded-xl border border-border bg-surface p-3 text-xs text-muted">
            Informational only. This does not confirm eligibility, rates, or approval — a licensed Crush Mortgage loan officer reviews every scenario before anything is final.
          </p>
        </div>
        );
      })()}
    </div>
  );
}

function ProgramCard({ m, exclusive = false }: { m: Match; exclusive?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-white p-5 ${exclusive ? "border-crush-300 ring-1 ring-crush-100" : "border-border"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-ink-900">{m.program.name}</p>
        {m.program.category && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${exclusive ? "bg-crush-500 text-white" : "bg-surface-2 text-muted"}`}>{m.program.category}</span>
        )}
      </div>
      {m.program.tagline && <p className="mt-0.5 text-sm text-muted">{m.program.tagline}</p>}
      <ul className="mt-3 space-y-1 text-sm text-ink-800">
        {m.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-crush-500">✓</span> {r}</li>)}
      </ul>
      {m.considerations.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {m.considerations.map((c, i) => <li key={i} className="flex gap-2"><span>•</span> {c}</li>)}
        </ul>
      )}
    </div>
  );
}
