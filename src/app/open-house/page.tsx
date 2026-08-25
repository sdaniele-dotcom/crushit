"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui";
import { submitLead } from "@/lib/openHouse";
import { site } from "@/lib/site";

const input = "w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const label = "text-sm font-semibold text-ink-800";

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-1.5 flex gap-2">
      {[["Yes", true], ["No", false]].map(([t, v]) => (
        <button key={t as string} type="button" onClick={() => onChange(v as boolean)}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold ${value === v ? "border-crush-400 bg-crush-50 text-crush-700" : "border-border bg-white text-ink-800"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

export default function OpenHouseSignInPage() {
  const [listingId, setListingId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [f, setF] = useState<{ name: string; phone: string; email: string; working_with_agent: boolean | null; interested_this: boolean | null; interested_similar: boolean | null; wants_financing: boolean | null; timeline: string }>(
    { name: "", phone: "", email: "", working_with_agent: null, interested_this: null, interested_similar: null, wants_financing: null, timeline: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setListingId(q.get("l"));
    setAddress(q.get("a") || "");
  }, []);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    const ok = await submitLead({ listing_id: listingId, listing_address: address || null, ...f, timeline: f.timeline || null });
    setBusy(false);
    if (ok) setDone(true);
  }

  return (
    <Container className="max-w-md py-10">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {done ? (
          <div className="py-8 text-center">
            <p className="text-4xl">🎉</p>
            <h1 className="mt-3 text-2xl font-bold text-ink-900">Thanks for signing in!</h1>
            <p className="mt-2 text-muted">Enjoy the open house{address ? ` at ${address}` : ""}. We&apos;ll be in touch with anything you need.</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-wide text-crush-600">Open house sign-in</p>
            <h1 className="mt-1 text-2xl font-bold text-ink-900">Welcome! 👋</h1>
            {address && <p className="mt-1 text-muted">{address}</p>}
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div><label className={label}>Your name *</label><input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required autoFocus /></div>
              <div><label className={label}>Phone</label><input className={input} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              <div><label className={label}>Email</label><input className={input} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div><label className={label}>Are you working with an agent?</label><YesNo value={f.working_with_agent} onChange={(v) => set("working_with_agent", v)} /></div>
              <div><label className={label}>Interested in this property?</label><YesNo value={f.interested_this} onChange={(v) => set("interested_this", v)} /></div>
              <div><label className={label}>Interested in similar homes?</label><YesNo value={f.interested_similar} onChange={(v) => set("interested_similar", v)} /></div>
              <div><label className={label}>Want info about financing?</label><YesNo value={f.wants_financing} onChange={(v) => set("wants_financing", v)} /></div>
              <div><label className={label}>When are you hoping to move?</label>
                <select className={input} value={f.timeline} onChange={(e) => set("timeline", e.target.value)}>
                  <option value="">Select…</option>
                  <option>ASAP</option><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option><option>Just looking</option>
                </select>
              </div>
              <button type="submit" disabled={busy} className="rounded-full bg-crush-500 px-6 py-3.5 text-base font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
                {busy ? "Submitting…" : "Sign in"}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-muted">Powered by {site.brand} · Financing by {site.company}</p>
          </>
        )}
      </div>
    </Container>
  );
}
