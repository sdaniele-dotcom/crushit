"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui";
import { submitFeedback } from "@/lib/openHouse";
import { site } from "@/lib/site";

const input = "w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const label = "text-sm font-semibold text-ink-800";

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-1.5 flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} stars`}
          className={`text-3xl leading-none ${n <= value ? "text-crush-500" : "text-border"}`}>★</button>
      ))}
    </div>
  );
}

const CATS = [["location", "Location"], ["condition", "Condition"], ["layout", "Layout"], ["kitchen", "Kitchen"], ["bedrooms", "Bedrooms"], ["outdoor", "Outdoor space"]] as const;
const PRICE = [["great_value", "Great value"], ["appropriate", "Priced appropriately"], ["slightly_high", "Slightly high"], ["too_high", "Too high"], ["not_sure", "Not sure"]] as const;
const OFFER = [["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]] as const;
const BLOCKERS = ["Price", "Condition", "Location", "Layout", "Size", "Financing", "Another property", "Other"];
const INFO = ["This property", "Similar properties", "Mortgage / payment options"];

export default function FeedbackPage() {
  const [listingId, setListingId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [overall, setOverall] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [likedMost, setLikedMost] = useState("");
  const [likedLeast, setLikedLeast] = useState("");
  const [priceOpinion, setPriceOpinion] = useState("");
  const [wouldOffer, setWouldOffer] = useState("");
  const [blockers, setBlockers] = useState<string[]>([]);
  const [suggested, setSuggested] = useState("");
  const [wantsInfo, setWantsInfo] = useState<string[]>([]);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setListingId(q.get("l")); setAddress(q.get("a") || "");
  }, []);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await submitFeedback({
      listing_id: listingId, listing_address: address || null,
      overall_rating: overall || null, ratings, liked_most: likedMost || null, liked_least: likedLeast || null,
      price_opinion: priceOpinion || null, would_offer: wouldOffer || null, blockers,
      suggested_price: suggested ? Number(suggested.replace(/[^\d.]/g, "")) : null, wants_info: wantsInfo,
      name: name || null, phone: phone || null, email: email || null,
    });
    setBusy(false);
    if (ok) setDone(true);
  }

  const chip = (active: boolean) => `rounded-full border px-3.5 py-2 text-sm font-medium ${active ? "border-crush-400 bg-crush-50 text-crush-700" : "border-border bg-white text-ink-800"}`;

  return (
    <Container className="max-w-lg py-10">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {done ? (
          <div className="py-8 text-center">
            <p className="text-4xl">🙏</p>
            <h1 className="mt-3 text-2xl font-bold text-ink-900">Thank you!</h1>
            <p className="mt-2 text-muted">Your feedback helps us and the seller. Enjoy the rest of your day!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-crush-600">Open house feedback</p>
              <h1 className="mt-1 text-2xl font-bold text-ink-900">How was the home?</h1>
              {address && <p className="mt-1 text-muted">{address}</p>}
            </div>

            <div><label className={label}>Overall impression</label><Stars value={overall} onChange={setOverall} /></div>
            <div><label className={label}>What did you like most?</label><textarea className={`${input} min-h-[80px]`} value={likedMost} onChange={(e) => setLikedMost(e.target.value)} /></div>
            <div><label className={label}>What did you like least?</label><textarea className={`${input} min-h-[80px]`} value={likedLeast} onChange={(e) => setLikedLeast(e.target.value)} /></div>

            <div><label className={label}>How do you feel about the asking price?</label>
              <div className="mt-2 flex flex-wrap gap-2">{PRICE.map(([v, t]) => <button key={v} type="button" onClick={() => setPriceOpinion(v)} className={chip(priceOpinion === v)}>{t}</button>)}</div>
            </div>

            <div>
              <label className={label}>Rate the details</label>
              <div className="mt-2 space-y-2">
                {CATS.map(([k, t]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-ink-800">{t}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setRatings((r) => ({ ...r, [k]: n }))} aria-label={`${t} ${n}`}
                          className={`text-xl leading-none ${n <= (ratings[k] ?? 0) ? "text-crush-500" : "text-border"}`}>★</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div><label className={label}>Would you consider making an offer?</label>
              <div className="mt-2 flex gap-2">{OFFER.map(([v, t]) => <button key={v} type="button" onClick={() => setWouldOffer(v)} className={`flex-1 ${chip(wouldOffer === v)}`}>{t}</button>)}</div>
            </div>

            <div><label className={label}>If not, what&apos;s stopping you?</label>
              <div className="mt-2 flex flex-wrap gap-2">{BLOCKERS.map((b) => <button key={b} type="button" onClick={() => toggle(blockers, b, setBlockers)} className={chip(blockers.includes(b))}>{b}</button>)}</div>
            </div>

            <div><label className={label}>What price do you think this home should sell for?</label><input className={input} inputMode="numeric" value={suggested} onChange={(e) => setSuggested(e.target.value)} placeholder="$000,000" /></div>

            <div><label className={label}>Would you like more information about…</label>
              <div className="mt-2 flex flex-wrap gap-2">{INFO.map((i) => <button key={i} type="button" onClick={() => toggle(wantsInfo, i, setWantsInfo)} className={chip(wantsInfo.includes(i))}>{i}</button>)}</div>
            </div>

            {wantsInfo.length > 0 && (
              <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold text-muted">So we can follow up (optional):</p>
                <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={input} placeholder="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input className={input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

            <button type="submit" disabled={busy} className="rounded-full bg-crush-500 px-6 py-3.5 text-base font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
              {busy ? "Submitting…" : "Submit feedback"}
            </button>
            <p className="text-center text-xs text-muted">Powered by {site.brand} · Financing by {site.company}</p>
          </form>
        )}
      </div>
    </Container>
  );
}
