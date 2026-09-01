"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { fullName } from "@/lib/profile";
import { getSupabase } from "@/lib/supabase";
import { awardStars, logActivity, saveProject } from "@/lib/rewards";
import { upsertListing } from "@/lib/listings";

type Status = "idle" | "loading" | "success" | "error";

type Result = { publicUrl: string; pdfUrl: string };

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-500/20";

const label = "text-sm font-medium text-ink-800";

/** Load, downscale (max 640px), and JPEG-compress an image to a data URL. */
function resizeImage(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Live comma-format an uncontrolled money input as the user types. The submit
 *  handler strips non-digits, so the real numeric value is preserved. */
function fmtMoneyInput(e: React.FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  const d = el.value.replace(/[^\d]/g, "");
  el.value = d ? Number(d).toLocaleString("en-US") : "";
}

export function PropertyFlyerTool() {
  const { user, profile, refreshProfile } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [headshot, setHeadshot] = useState<string>(""); // new upload for this flyer only
  const [officers, setOfficers] = useState<
    { id: string; name: string; title: string; headshot?: string }[]
  >([]);
  const [officerId, setOfficerId] = useState<string>("");
  const selectedOfficer = officers.find((o) => o.id === officerId);

  // Agent fields — controlled so we can auto-fill them from the saved profile.
  const [aName, setAName] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aBrokerage, setABrokerage] = useState("");
  const [aLicense, setALicense] = useState("");
  const [headshotUrl, setHeadshotUrl] = useState(""); // from profile
  const [logoUrl, setLogoUrl] = useState(""); // brokerage logo from profile
  const [prefilled, setPrefilled] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [template, setTemplate] = useState<"classic" | "bold" | "editorial">("classic");
  const resultRef = useRef<HTMLDivElement>(null);

  // The one shared listing selected anywhere in the suite prefills the property.
  const { listing } = useActiveListing();

  useEffect(() => {
    fetch(`${site.flyerApiBase}/api/public/loan-officers`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.officers) && d.officers.length) {
          setOfficers(d.officers);
          setOfficerId(d.officers[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-fill from the logged-in agent's saved profile (once).
  useEffect(() => {
    if (profile && !prefilled) {
      setAName(fullName(profile));
      setAPhone(profile.phone ?? "");
      setAEmail(profile.email ?? user?.email ?? "");
      setABrokerage(profile.brokerage ?? "");
      setALicense(profile.dre_license ?? "");
      setHeadshotUrl(profile.headshot_url ?? "");
      setLogoUrl(profile.brokerage_logo_url ?? profile.team_logo_url ?? "");
      setPrefilled(true);
    }
  }, [profile, prefilled, user]);

  // After a flyer is generated, bring the "ready" CTA into view at the bottom
  // so the agent doesn't have to scroll back up.
  useEffect(() => {
    if (status === "success") resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setHeadshot(await resizeImage(file));
    } catch {
      setHeadshot("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const g = (k: string) => String(fd.get(k) ?? "").trim();
    const num = (k: string) => {
      const v = g(k).replace(/[^0-9.]/g, "");
      return v ? Number(v) : null;
    };

    const payload = {
      agent: {
        name: aName.trim(),
        email: aEmail.trim(),
        phone: aPhone.trim(),
        dre_license: aLicense.trim(),
        brokerage: aBrokerage.trim(),
        headshot_data: headshot, // a new upload takes priority
        headshot_url: headshot ? "" : headshotUrl,
        brokerage_logo_url: logoUrl,
      },
      property: {
        street_address: g("street_address"),
        city: g("city"),
        state: g("state"),
        zip: g("zip"),
        purchase_price: num("purchase_price"),
        property_type: g("property_type"),
        annual_property_taxes: num("annual_property_taxes"),
        monthly_hoa: num("monthly_hoa"),
        // Hero photo: an explicit URL wins, else the selected listing's first
        // Lofty photo. The server still auto-pulls from Lofty as a fallback.
        photo_url: g("photo_url") || listing?.photos?.[0] || "",
        // Full Lofty photo set so the flyer can show a second image.
        photos: listing?.photos && listing.photos.length ? listing.photos : undefined,
      },
      assumptions: {
        desired_down_pct: num("down_pct"),
        occupancy: g("occupancy") || null,
        first_time_buyer: fd.get("first_time_buyer") === "on" ? true : null,
        veteran: fd.get("veteran") === "on" ? true : null,
      },
      loan_officer_id: officerId || undefined,
      template,
    };

    setStatus("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/flyer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({ publicUrl: data.publicUrl, pdfUrl: data.pdfUrl });
        setStatus("success");

        // Logged-in extras: rewards, activity, saved project, optional profile save.
        if (user) {
          const address = [payload.property.street_address, payload.property.city]
            .filter(Boolean)
            .join(", ");
          awardStars("create_flyer", {
            relatedType: "flyer",
            relatedId: data.slug,
            description: "Created a co-branded flyer",
          });
          logActivity("flyer_created", { slug: data.slug });
          logActivity("marketing_piece_created", { kind: "property_flyer" });
          // Save/reuse the listing so the property is available in other tools.
          const savedListing = await upsertListing({
            address: payload.property.street_address,
            city: payload.property.city || undefined,
            state: payload.property.state || undefined,
            zip: payload.property.zip || undefined,
            price: payload.property.purchase_price ?? undefined,
          }).catch(() => null);
          saveProject({
            kind: "property_flyer",
            title: address || "Property flyer",
            publicUrl: data.publicUrl,
            pdfUrl: data.pdfUrl,
            listingId: savedListing?.id ?? listing?.id,
          });
          if (saveToProfile) {
            const sb = getSupabase();
            await sb
              ?.from("profiles")
              .update({
                phone: aPhone.trim(),
                brokerage: aBrokerage.trim(),
                dre_license: aLicense.trim(),
              })
              .eq("id", user.id);
            await refreshProfile();
          }
        }
      } else {
        setError(data.error || "Could not generate the flyer. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Couldn't reach the flyer service. Please try again in a moment.");
      setStatus("error");
    }
  }

  return (
    <>
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      {/* Form (re-keyed so a loaded listing prefills the uncontrolled fields) */}
      <form onSubmit={handleSubmit} key={listing?.id ?? "blank"}>
        <h2 className="text-2xl font-bold text-ink-900">Your info</h2>
        {user && prefilled && (
          <p className="mt-2 rounded-xl border border-crush-200 bg-crush-50 px-3 py-2 text-xs text-crush-700">
            ✓ Filled in from your saved profile. Edits here apply to this flyer
            only — tick &ldquo;save to my profile&rdquo; below to keep them.
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={label}>Full name *</span>
            <input required className={inputCls} placeholder="Jane Agent" value={aName} onChange={(e) => setAName(e.target.value)} />
          </label>
          <label className="block">
            <span className={label}>Phone</span>
            <input className={inputCls} placeholder="(555) 000-0000" value={aPhone} onChange={(e) => setAPhone(e.target.value)} />
          </label>
          <label className="block">
            <span className={label}>Email</span>
            <input type="email" className={inputCls} placeholder="jane@brokerage.com" value={aEmail} onChange={(e) => setAEmail(e.target.value)} />
          </label>
          {officers.length > 0 && (
            <label className="block sm:col-span-2">
              <span className={label}>Loan officer (co-brands with you)</span>
              <div className="flex items-center gap-3">
                {selectedOfficer?.headshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedOfficer.headshot}
                    alt={selectedOfficer.name}
                    className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-crush-100"
                  />
                ) : (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-lg">
                    🧑‍💼
                  </span>
                )}
                <select
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className={`${inputCls} flex-1`}
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                      {o.title ? ` — ${o.title}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-muted">
                Their photo appears on the finished flyer next to yours.
              </p>
            </label>
          )}
          <div className="sm:col-span-2">
            <span className={label}>Headshot</span>
            <div className="mt-1.5 flex items-center gap-4">
              {headshot || headshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={headshot || headshotUrl}
                  alt="Headshot preview"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-crush-500/40"
                />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
                  Photo
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onPhoto}
                className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
              />
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-ink-900">Property address</h2>
        <p className="mt-1 text-sm text-muted">
          Enter the address — we&apos;ll pull the price and details from the MLS.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={label}>Street address *</span>
            <input name="street_address" required className={inputCls} placeholder="123 Main St" defaultValue={listing?.address ?? ""} />
          </label>
          <label className="block">
            <span className={label}>City</span>
            <input name="city" className={inputCls} placeholder="Long Beach" defaultValue={listing?.city ?? ""} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={label}>State</span>
              <input name="state" className={inputCls} placeholder="CA" defaultValue={listing?.state ?? ""} />
            </label>
            <label className="block">
              <span className={label}>ZIP</span>
              <input name="zip" className={inputCls} placeholder="90808" defaultValue={listing?.zip ?? ""} />
            </label>
          </div>
        </div>
        {listing && (
          <p className="mt-3 rounded-xl border border-crush-200 bg-crush-50 px-3 py-2 text-xs text-crush-700">
            🏠 Using your saved listing — {listing.address}. Edits here apply to this flyer only.
          </p>
        )}

        {/* Flyer style / template */}
        <h2 className="mt-8 text-2xl font-bold text-ink-900">Flyer style</h2>
        <p className="mt-1 text-sm text-muted">
          Pick a look. Every flyer prints as two pages — payment scenarios on the
          front, a plain-English guide to the programs on the back.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { key: "classic" as const, name: "Classic", blurb: "Charcoal header, red accents" },
            { key: "bold" as const, name: "Bold", blurb: "Red header, high energy" },
            { key: "editorial" as const, name: "Editorial", blurb: "Clean, light, minimal" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTemplate(t.key)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${template === t.key ? "border-crush-400 bg-crush-50" : "border-border hover:bg-surface-2"}`}
            >
              <span className="block font-bold text-ink-900">{t.name}</span>
              <span className="block text-xs text-muted">{t.blurb}</span>
            </button>
          ))}
        </div>

        {/* Primary CTA — always visible right after the essentials */}
        <div className="mt-8">
          {user && (
            <label className="mb-3 flex items-center gap-2 text-sm text-ink-800">
              <input type="checkbox" className="h-4 w-4 accent-crush-500" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} />
              Save these changes to my profile
            </label>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-crush-500 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:opacity-60 sm:w-auto"
          >
            {status === "loading" ? "Generating flyer…" : "Generate my flyer"}
          </button>
          <p className="mt-3 text-xs text-muted">
            Estimated financing scenarios, co-branded with you and {site.company}.
            Estimates only — not a commitment to lend.
          </p>
        </div>

        {/* Optional overrides */}
        <details className="group mt-8 rounded-2xl border border-border bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-ink-900">
            Add optional details
            <span className="text-xs font-normal text-muted">
              brokerage, license, price override, scenario options
            </span>
          </summary>
          <div className="border-t border-border p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>Brokerage</span>
                <input className={inputCls} placeholder="Realty Group" value={aBrokerage} onChange={(e) => setABrokerage(e.target.value)} />
              </label>
              <label className="block">
                <span className={label}>License # (DRE)</span>
                <input className={inputCls} placeholder="DRE #00000000" value={aLicense} onChange={(e) => setALicense(e.target.value)} />
              </label>
              <label className="block">
                <span className={label}>Purchase price</span>
                <input name="purchase_price" className={inputCls} placeholder="Auto-filled from MLS" inputMode="numeric" onInput={fmtMoneyInput} defaultValue={listing?.price != null ? listing.price.toLocaleString("en-US") : ""} />
              </label>
              <label className="block">
                <span className={label}>Property type</span>
                <input name="property_type" className={inputCls} placeholder="Single-family" />
              </label>
              <label className="block">
                <span className={label}>Annual property taxes</span>
                <input name="annual_property_taxes" className={inputCls} placeholder="7,200" inputMode="numeric" onInput={fmtMoneyInput} />
              </label>
              <label className="block">
                <span className={label}>Monthly HOA</span>
                <input name="monthly_hoa" className={inputCls} placeholder="0" inputMode="numeric" onInput={fmtMoneyInput} />
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>Listing photo URL</span>
                <input name="photo_url" className={inputCls} placeholder="https://…/listing.jpg" />
              </label>
              <label className="block">
                <span className={label}>Down payment %</span>
                <input name="down_pct" className={inputCls} placeholder="10" inputMode="decimal" />
              </label>
              <label className="block">
                <span className={label}>Occupancy</span>
                <select name="occupancy" className={inputCls} defaultValue="owner_occupied">
                  <option value="owner_occupied">Primary residence</option>
                  <option value="second_home">Second home</option>
                  <option value="investment">Investment</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <input type="checkbox" name="first_time_buyer" className="h-4 w-4 accent-crush-500" />
                First-time buyer
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <input type="checkbox" name="veteran" className="h-4 w-4 accent-crush-500" />
                Veteran / active duty
              </label>
            </div>
          </div>
        </details>
      </form>

      {/* Result */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Your flyer
        </p>
        <div className="rounded-2xl border border-border bg-surface p-6">
          {status === "idle" && (
            <p className="text-sm text-muted">
              Add your info and a listing address, then generate — your
              co-branded flyer and a print-ready PDF (with QR code) appear here.
            </p>
          )}
          {status === "loading" && (
            <div className="flex items-center gap-3 text-sm text-ink-800">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
              Building your co-branded flyer…
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl bg-crush-50 px-4 py-3 text-sm text-crush-700">
              {error}
            </div>
          )}
          {status === "success" && (
            <p className="text-sm font-semibold text-mint-600">✓ Done — scroll down to print your flyer.</p>
          )}
        </div>
      </div>
      </div>

      {/* "Your Flyer Is Ready" — full-width at the BOTTOM so there's no scrolling
          back up after generating. */}
      {status === "success" && result && (
        <div ref={resultRef} className="mt-10 rounded-3xl border-2 border-crush-200 bg-crush-50 p-6 text-center sm:p-8">
          <p className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Your Flyer Is Ready! 🎉</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Co-branded with your logo and {site.company}. The PDF prints only the
            flyer — no website or menus.
          </p>
          <div className="mx-auto mt-5 flex max-w-md flex-col gap-3">
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-crush-500/20 hover:bg-crush-600"
            >
              🖨️ Print Here
            </a>
            <a
              href={result.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2"
            >
              View / share online
            </a>
          </div>
        </div>
      )}
    </>
  );
}
