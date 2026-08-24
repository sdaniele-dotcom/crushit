"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useActiveListing } from "@/components/ActiveListing";
import { listingLabel } from "@/lib/listings";
import { listLeads, listFeedback, summarize, qrImage, signInUrl, feedbackUrl, type Lead, type Feedback } from "@/lib/openHouse";

const PRICE_LABEL: Record<string, string> = { great_value: "Great value", appropriate: "Priced appropriately", slightly_high: "Slightly high", too_high: "Too high", not_sure: "Not sure" };

function QrCard({ title, desc, url }: { title: string; desc: string; url: string }) {
  function printPoster() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>@page{size:letter;margin:0.5in}body{font-family:Arial;text-align:center;color:#111}h1{font-size:34pt;margin:24pt 0 6pt}p{font-size:15pt;color:#555}img{width:4in;height:4in;margin:24pt auto}.__b{position:fixed;top:0;left:0;right:0;background:#111;color:#fff;padding:8px}@media print{.__b{display:none}}</style></head>
      <body><div class="__b"><button onclick="window.print()">Print</button></div>
      <h1>${title}</h1><p>${desc}</p><img src="${qrImage(url, 800)}" alt="QR"><p style="font-size:18pt;font-weight:700;color:#e62c2c">Scan with your phone camera</p></body></html>`);
    w.document.close(); w.focus();
  }
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-white p-5 text-center">
      <h4 className="font-bold text-ink-900">{title}</h4>
      <p className="mt-1 text-xs text-muted">{desc}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrImage(url, 220)} alt="QR code" className="mt-3 h-40 w-40" />
      <button type="button" onClick={printPoster} className="mt-3 rounded-full bg-crush-500 px-5 py-2 text-sm font-semibold text-white hover:bg-crush-600">Print QR poster</button>
    </div>
  );
}

export function DigitalOpenHouse() {
  const { listing } = useActiveListing();
  const [tab, setTab] = useState<"leads" | "feedback">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const load = useCallback(async () => {
    if (!listing) return;
    setLeads(await listLeads(listing.id));
    setFeedback(await listFeedback(listing.id));
  }, [listing]);
  useEffect(() => { load(); }, [load]);

  if (!listing) {
    return (
      <div className="rounded-2xl border border-crush-200 bg-crush-50 p-5 text-sm text-crush-800">
        Pick a saved listing above to generate a digital sign-in &amp; feedback QR. <Link href="/listings" className="font-semibold underline">Add a listing</Link>.
      </div>
    );
  }

  const address = [listing.address, listing.city, listing.state].filter(Boolean).join(", ");
  const s = summarize(feedback);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <QrCard title="Digital sign-in" desc="Visitors scan to sign in on their phone." url={signInUrl(listing.id, address)} />
        <QrCard title="Feedback QR" desc="Visitors scan to leave feedback." url={feedbackUrl(listing.id, address)} />
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setTab("leads")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "leads" ? "bg-crush-500 text-white" : "bg-surface-2 text-ink-800"}`}>Sign-ins ({leads.length})</button>
            <button type="button" onClick={() => setTab("feedback")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "feedback" ? "bg-crush-500 text-white" : "bg-surface-2 text-ink-800"}`}>Feedback ({feedback.length})</button>
          </div>
          <button type="button" onClick={load} className="text-xs font-semibold text-crush-600">Refresh</button>
        </div>
        <p className="mt-1 text-xs text-muted">{listingLabel(listing)}</p>

        {tab === "leads" ? (
          <div className="mt-4 space-y-2">
            {leads.length === 0 && <p className="text-sm text-muted">No sign-ins yet. Share the QR at the door.</p>}
            {leads.map((l) => (
              <div key={l.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900">{l.name || "Visitor"}</p>
                  <p className="text-xs text-muted">{new Date(l.created_at).toLocaleString("en-US")}</p>
                </div>
                <p className="text-xs text-muted">{[l.phone, l.email].filter(Boolean).join(" · ")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {l.working_with_agent === false && <span className="rounded-full bg-crush-50 px-2 py-0.5 text-xs font-semibold text-crush-700">No agent</span>}
                  {l.interested_this && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-800">Interested in this home</span>}
                  {l.interested_similar && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-800">Wants similar</span>}
                  {l.wants_financing && <span className="rounded-full bg-mint-500/15 px-2 py-0.5 text-xs font-semibold text-mint-500">Financing help</span>}
                  {l.timeline && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-800">{l.timeline}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            {feedback.length === 0 ? (
              <p className="text-sm text-muted">No feedback yet. Share the feedback QR with visitors.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border p-3"><p className="text-2xl font-extrabold text-crush-600">{s.count}</p><p className="text-xs text-muted">responses</p></div>
                  <div className="rounded-xl border border-border p-3"><p className="text-2xl font-extrabold text-ink-900">{s.overall || "—"}<span className="text-sm text-muted">/5</span></p><p className="text-xs text-muted">avg rating</p></div>
                  <div className="rounded-xl border border-border p-3"><p className="text-2xl font-extrabold text-ink-900">{s.avgSuggestedPrice ? `$${(s.avgSuggestedPrice / 1000).toFixed(0)}k` : "—"}</p><p className="text-xs text-muted">avg suggested price</p></div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-crush-700">Price feedback</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(s.priceCounts).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm"><span className="text-ink-800">{PRICE_LABEL[k] ?? k}</span><span className="font-semibold">{Math.round((v / s.count) * 100)}%</span></div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-crush-700">Offer interest</p>
                    <div className="mt-2 flex gap-3 text-sm">
                      <span>✅ {s.offerCounts.yes} yes</span><span>🤔 {s.offerCounts.maybe} maybe</span><span>❌ {s.offerCounts.no} no</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-crush-700">Ratings by area</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(s.categoryAverages).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm capitalize"><span className="text-ink-800">{k}</span><span className="font-semibold">{v}/5</span></div>
                      ))}
                    </div>
                    {s.topBlockers.length > 0 && (
                      <>
                        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-crush-700">Top concerns</p>
                        <p className="mt-1 text-sm text-ink-800">{s.topBlockers.join(" · ")}</p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
