"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { fullName } from "@/lib/profile";
import { listingLabel } from "@/lib/listings";
import { submitFlyerRequest } from "@/lib/flyerRequests";
import { HOURS_LABEL, isBusinessHours, replyWindow } from "@/lib/businessHours";
import { toast } from "@/lib/toast";

const inp =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-500/20";
const lbl = "text-xs font-semibold uppercase tracking-wide text-muted";

/** The programs we can price. The team quotes whichever of these apply. */
const PROGRAMS: [string, string][] = [
  ["conv20", "Conventional 20% down"],
  ["conv10", "Conventional 10% down"],
  ["conv5", "Conventional 5% down"],
  ["fha", "FHA 3.5% down"],
  ["va", "VA"],
  ["dscr", "DSCR (investor)"],
  ["bankstmt", "Bank statement"],
  ["jumbo", "Jumbo"],
];

const OCCUPANCY: [string, string][] = [
  ["primary", "Primary residence"],
  ["second_home", "Second home"],
  ["investment", "Investment"],
];

const num = (s: string): number | null => {
  const v = s.replace(/[^0-9.]/g, "");
  return v ? Number(v) : null;
};

/**
 * "Send us a request" — the front door for a co-branded financing flyer.
 *
 * This replaced a self-serve generator that built the flyer on the spot from
 * whatever was typed in. The numbers on a financing flyer are a quote, and a
 * quote is only as good as the taxes, HOA and rate sheet behind it; an agent
 * filling in "taxes: probably 1.25%" got a flyer that looked authoritative and
 * was wrong. So the form still collects everything the flyer needs, but a
 * human prices it and sends it back.
 *
 * Fields are optional on purpose. A blank HOA box tells the team "the agent
 * doesn't know" — which is useful — where a pre-filled zero silently becomes a
 * wrong number printed on a flyer with our name on it.
 */
export function FlyerRequestForm() {
  const { user, profile } = useAuth();
  const { listing } = useActiveListing();

  const [officers, setOfficers] = useState<{ id: string; name: string; title: string }[]>([]);
  const [officer, setOfficer] = useState("");
  const [programs, setPrograms] = useState<string[]>(["conv20", "conv10", "fha"]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("CA");
  const [zip, setZip] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [taxes, setTaxes] = useState("");
  const [hoa, setHoa] = useState("");
  const [downPct, setDownPct] = useState("");
  const [occupancy, setOccupancy] = useState("primary");
  const [note, setNote] = useState("");

  const [aName, setAName] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aBrokerage, setABrokerage] = useState("");
  const [aDre, setADre] = useState("");
  // Whose profile / which listing the fields were last filled from. Prefilling
  // is a state adjustment driven by a prop change, not a side effect, so it
  // happens during render (React's documented pattern) rather than in an
  // effect that would render once with blank fields and then again with them.
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  const [filledFromListing, setFilledFromListing] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // When we'll get back to them, decided at render time rather than promised
  // in fixed copy — see lib/businessHours.
  const openNow = useMemo(() => isBusinessHours(), []);
  const window = useMemo(() => replyWindow(), []);

  useEffect(() => {
    fetch(`${site.flyerApiBase}/api/public/loan-officers`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.officers)) setOfficers(d.officers);
      })
      .catch(() => {});
  }, []);

  // Fill the agent's half of the form from their saved profile, once it loads.
  if (profile && profile.id !== prefilledFor) {
    setPrefilledFor(profile.id);
    setAName(fullName(profile));
    setAEmail(profile.email ?? user?.email ?? "");
    setAPhone(profile.phone ?? "");
    setABrokerage(profile.brokerage ?? "");
    setADre(profile.dre_license ?? "");
  }

  // Fill the property from whichever listing is selected across the suite.
  // Keyed on the listing id so switching listings refills, but the agent's own
  // edits to these fields survive every other render.
  if (listing && listing.id !== filledFromListing) {
    setFilledFromListing(listing.id);
    setAddress(listing.address ?? "");
    setCity(listing.city ?? "");
    setState(listing.state ?? "CA");
    setZip(listing.zip ?? "");
    setPrice(listing.price ? Math.round(listing.price).toLocaleString("en-US") : "");
  }

  function toggleProgram(key: string) {
    setPrograms((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ emoji: "🔒", title: "Log in to send a request", body: "Your free account keeps your listings and flyers in one place." });
      return;
    }
    setSending(true);
    const res = await submitFlyerRequest({
      listing_id: listing?.id ?? null,
      address: address.trim() || (listing ? listingLabel(listing) : null),
      city: city.trim() || null,
      state: state.trim() || null,
      zip: zip.trim() || null,
      price: num(price),
      property_type: propertyType.trim() || null,
      photos: listing?.photos ?? [],
      annual_taxes: num(taxes),
      monthly_hoa: num(hoa),
      down_payment_pct: num(downPct),
      occupancy,
      programs: programs.map((k) => PROGRAMS.find(([key]) => key === k)?.[1] ?? k),
      loan_officer: officer || null,
      note: note.trim() || null,
      agent: {
        name: aName.trim() || null,
        email: aEmail.trim() || null,
        phone: aPhone.trim() || null,
        brokerage: aBrokerage.trim() || null,
        dre: aDre.trim() || null,
      },
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      toast({ emoji: "📨", title: "Request received!", body: `We'll reach out ${window}.` });
    } else {
      toast({ emoji: "⚠️", title: "Couldn't send", body: res.error || "Please try again in a moment." });
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-mint-500/30 bg-mint-500/5 p-8 text-center sm:p-10">
        <p className="text-4xl">📨</p>
        <h2 className="mt-3 text-2xl font-bold text-ink-900">Request received</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          {aName ? `Thanks, ${aName.split(" ")[0]}. ` : ""}
          A loan officer is pricing {address ? <strong>{address}</strong> : "your listing"} now and will reach out{" "}
          <strong>{window}</strong> with the flyer and the numbers behind it.
        </p>
        <p className="mt-2 text-sm text-muted">
          Need it sooner? Call <a href={`tel:${site.phone}`} className="font-semibold text-crush-600">{site.phone}</a>.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setNote(""); }}
          className="mt-5 text-sm font-semibold text-crush-600 hover:text-crush-700"
        >
          Request another flyer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="order-2 lg:order-1">
        <h2 className="text-2xl font-bold text-ink-900">The listing</h2>
        <p className="mt-1 text-sm text-muted">
          Pick a saved listing above and this fills in for you. Anything you leave blank, we&apos;ll research or
          confirm with you — we&apos;d rather ask than guess.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={lbl}>Property address *</span>
            <input required className={inp} placeholder="3337 Los Flores Blvd" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>City</span>
            <input className={inp} placeholder="Lynwood" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={lbl}>State</span>
              <input className={inp} value={state} onChange={(e) => setState(e.target.value)} />
            </label>
            <label className="block">
              <span className={lbl}>ZIP</span>
              <input className={inp} placeholder="90262" value={zip} onChange={(e) => setZip(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className={lbl}>List price</span>
            <input className={inp} inputMode="numeric" placeholder="999,900" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Property type</span>
            <input className={inp} placeholder="Single family · Duplex · Condo" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Annual property taxes</span>
            <input className={inp} inputMode="numeric" placeholder="From the MLS, if you have it" value={taxes} onChange={(e) => setTaxes(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Monthly HOA</span>
            <input className={inp} inputMode="numeric" placeholder="Leave blank if none / unknown" value={hoa} onChange={(e) => setHoa(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Down payment the buyer has in mind</span>
            <input className={inp} inputMode="numeric" placeholder="e.g. 20 (%)" value={downPct} onChange={(e) => setDownPct(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Occupancy</span>
            <select className={inp} value={occupancy} onChange={(e) => setOccupancy(e.target.value)}>
              {OCCUPANCY.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <span className={lbl}>Which scenarios should the flyer show?</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROGRAMS.map(([key, label]) => {
              const on = programs.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleProgram(key)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${on ? "bg-crush-500 text-white" : "border border-border bg-white text-ink-800 hover:bg-surface-2"}`}
                >
                  {on ? "✓ " : ""}{label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Three or four fit the flyer best. Not sure which? Leave it to us and we&apos;ll pick what fits the buyer.
          </p>
        </div>

        <h2 className="mt-9 text-2xl font-bold text-ink-900">Your info</h2>
        {user && prefilledFor && (
          <p className="mt-2 rounded-xl border border-crush-200 bg-crush-50 px-3 py-2 text-xs text-crush-700">
            ✓ Filled in from your saved profile — this is the branding that goes on the flyer.
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={lbl}>Full name *</span>
            <input required className={inp} value={aName} onChange={(e) => setAName(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Email *</span>
            <input required type="email" className={inp} value={aEmail} onChange={(e) => setAEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Phone</span>
            <input className={inp} value={aPhone} onChange={(e) => setAPhone(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Brokerage</span>
            <input className={inp} value={aBrokerage} onChange={(e) => setABrokerage(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>DRE license #</span>
            <input className={inp} value={aDre} onChange={(e) => setADre(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Co-brand with</span>
            <select className={inp} value={officer} onChange={(e) => setOfficer(e.target.value)}>
              <option value="">Any available loan officer</option>
              {officers.map((o) => (
                <option key={o.id} value={o.name}>{o.name}{o.title ? ` — ${o.title}` : ""}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className={lbl}>Anything else we should know?</span>
          <textarea
            className={`${inp} min-h-[90px]`}
            placeholder="Open house Saturday, seller may credit closing costs, buyer is a veteran, need it by Thursday…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-crush-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 hover:bg-crush-600 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send my flyer request"}
          </button>
          {!user && (
            <span className="text-xs text-muted">
              <Link href="/login" className="font-semibold text-crush-600">Log in</Link> or{" "}
              <Link href="/signup" className="font-semibold text-crush-600">create a free account</Link> to send a request.
            </span>
          )}
        </div>
      </div>

      {/* Why we do it this way, and when you'll hear back. */}
      <aside className="order-1 lg:order-2">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-crush-600">Why a request, not a button</p>
            <h3 className="mt-2 text-lg font-bold text-ink-900">We want to give you the most accurate numbers</h3>
            <p className="mt-2 text-sm text-muted">
              That is exactly why automation is not ideal here. Real pricing depends on the buyer&apos;s credit and
              income, the property&apos;s actual taxes, HOA and insurance, and today&apos;s rate sheet — not on an
              average. A payment that is off by a couple of hundred dollars is worse than no flyer at all.
            </p>
            <p className="mt-2 text-sm text-muted">
              So send us a request and a loan officer prices it by hand, then sends you a co-branded flyer you can put
              in front of a buyer with confidence.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${openNow ? "bg-mint-500" : "bg-amber-400"}`} aria-hidden />
              <p className="text-sm font-bold text-ink-900">{openNow ? "We're in the office now" : "Outside business hours"}</p>
            </div>
            <p className="mt-2 text-sm text-muted">
              We&apos;ll reach out <strong className="text-ink-900">{window}</strong>. Our hours are{" "}
              {HOURS_LABEL}. Requests that come in after hours or on a weekend are answered first thing during the
              next business hours — nothing gets lost.
            </p>
            <div className="mt-4 space-y-1.5 text-sm">
              <a href={`tel:${site.phone}`} className="block font-semibold text-crush-600">{site.phone}</a>
              <a href="mailto:team@crushmortgage.com" className="block font-semibold text-crush-600">team@crushmortgage.com</a>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="text-sm font-bold text-ink-900">What you get back</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• A print-ready PDF co-branded with your photo, logo and DRE</li>
              <li>• Three to four financing scenarios with real, quoted pricing</li>
              <li>• Every payment broken down — P&amp;I, taxes, insurance, MI and HOA</li>
              <li>• The disclosures that have to be on it, already there</li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              Just want a photo flyer with no financing on it? The{" "}
              <Link href="/flyer-studio" className="font-semibold text-crush-600">template library</Link> is
              self-serve and instant — no numbers involved.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
