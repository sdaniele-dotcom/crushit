"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { recordUse } from "@/lib/rewards";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";
import { fullName } from "@/lib/profile";
import { esc } from "@/lib/printBranding";

type TemplateKey = "modern" | "luxury" | "clean";
type SizeKey = "4x6" | "5x7";

const TEMPLATES: { key: TemplateKey; name: string; blurb: string }[] = [
  { key: "modern", name: "Modern", blurb: "Big photo, bold minimal type" },
  { key: "luxury", name: "Luxury", blurb: "Editorial, premium serif" },
  { key: "clean", name: "Clean", blurb: "Bright, simple, airy" },
];
const SIZES: Record<SizeKey, { w: number; h: number }> = { "4x6": { w: 4, h: 6 }, "5x7": { w: 5, h: 7 } };

const money = (n: number | null | undefined) =>
  n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function qr(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(url)}`;
}

const STYLES: Record<TemplateKey, { accent: string; ink: string; head: string; body: string; frontBg: string; kicker: string }> = {
  modern: { accent: "#e62c2c", ink: "#111", head: "'Poppins',Arial,sans-serif", body: "Arial,sans-serif", frontBg: "#111", kicker: "letter-spacing:5px;text-transform:uppercase" },
  luxury: { accent: "#b08d4c", ink: "#1a1a1a", head: "'Playfair Display',Georgia,serif", body: "Georgia,serif", frontBg: "#1a1a1a", kicker: "letter-spacing:8px;text-transform:uppercase" },
  clean: { accent: "#e62c2c", ink: "#1f2937", head: "'Poppins',Arial,sans-serif", body: "Arial,sans-serif", frontBg: "#f3f4f6", kicker: "letter-spacing:3px;text-transform:uppercase" },
};

export function NeighborPostcard() {
  const { profile } = useAuth();
  const { listing } = useActiveListing();
  const [tpl, setTpl] = useState<TemplateKey>("modern");
  const [size, setSize] = useState<SizeKey>("4x6");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Editable copy — auto-filled from the listing/defaults, then the agent can tweak.
  const DEFAULT_HEADLINE = "Come see what's happening in your neighborhood.";
  const DEFAULT_MESSAGE = "Curious what homes in your neighborhood are selling for? Stop by and take a look — and if you know someone who'd love to move in, bring them by!";
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [addressStr, setAddressStr] = useState("");
  const [photoIdx, setPhotoIdx] = useState(0);

  const photos = listing?.photos ?? [];

  useEffect(() => {
    if (listing?.open_house_at) {
      const d = new Date(listing.open_house_at);
      if (!Number.isNaN(d.getTime())) { setDate(d.toISOString().slice(0, 10)); setStart(d.toTimeString().slice(0, 5)); }
    }
    if (listing?.open_house_end) {
      const d = new Date(listing.open_house_end);
      if (!Number.isNaN(d.getTime())) setEnd(d.toTimeString().slice(0, 5));
    }
    // Seed the address field from the listing; the agent can still edit it.
    setAddressStr(listing ? [listing.address, listing.city, listing.state].filter(Boolean).join(", ") : "");
    setPhotoIdx(0);
  }, [listing]);

  function build(): string {
    const s = STYLES[tpl];
    const dim = SIZES[size];
    const photo = photos[photoIdx] ?? photos[0] ?? "";
    const address = addressStr.trim() || "[Property address]";
    const name = fullName(profile) || "Your Name";
    const logo = profile?.brokerage_logo_url || profile?.team_logo_url || "";
    const headshot = profile?.headshot_url || "";
    const dateFmt = date ? new Date(`${date}T00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "[Date]";
    const timeFmt = [start, end].filter(Boolean).map((t) => new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })).join(" – ") || "[Time]";
    const specs = [listing?.beds != null ? `${listing.beds} Bed` : null, listing?.baths != null ? `${listing.baths} Bath` : null, listing?.sqft ? `${listing.sqft.toLocaleString()} Sq Ft` : null].filter(Boolean).join("  •  ");
    const qrUrl = qr(site.siteUrl);
    const photoBlock = photo
      ? `<img src="${esc(photo)}" alt="">`
      : `<div class="noimg"><span>${esc(name)}</span><small>Neighborhood Open House</small></div>`;

    return `<!doctype html><html><head><meta charset="utf-8"><title>Neighbor Postcard</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
      @page{size:${dim.w}in ${dim.h}in;margin:0}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      html,body{margin:0;padding:0}
      .card{width:${dim.w}in;height:${dim.h}in;position:relative;overflow:hidden;page-break-after:always;font-family:${s.body};color:${s.ink};background:#fff}
      .card:last-child{page-break-after:auto}
      /* FRONT */
      .front{background:${s.frontBg}}
      .fphoto{position:absolute;top:0;left:0;right:0;height:64%;overflow:hidden}
      .fphoto img{width:100%;height:100%;object-fit:cover}
      .noimg{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${s.accent};color:#fff;font-family:${s.head}}
      .noimg span{font-weight:800;font-size:20pt}
      .fgrad{position:absolute;top:64%;left:0;right:0;height:36%;background:${tpl === "clean" ? "#fff" : s.frontBg};color:${tpl === "clean" ? s.ink : "#fff"};padding:14pt 18pt;display:flex;flex-direction:column;justify-content:center}
      .kicker{color:${s.accent};font-family:${s.head};font-weight:800;font-size:9pt;margin:0;${s.kicker}}
      .headline{font-family:${s.head};font-weight:800;font-size:20pt;line-height:1.05;margin:4pt 0 2pt}
      .addr{font-size:10pt;margin:2pt 0;opacity:.9}
      .when{font-size:11pt;font-weight:700;margin-top:4pt}
      .flogo{position:absolute;top:10pt;right:12pt;max-height:34pt;max-width:130pt;object-fit:contain;filter:${tpl === "clean" ? "none" : "brightness(0) invert(1)"};background:${tpl === "clean" ? "rgba(255,255,255,.85)" : "transparent"};padding:3pt 5pt;border-radius:4pt}
      /* BACK */
      .back{padding:16pt 18pt 0;display:flex;flex-direction:column;height:100%}
      .btop{display:flex;gap:12pt}
      .bphoto{width:42%;height:1.5in;border-radius:6pt;object-fit:cover}
      .bhead{font-family:${s.head};font-weight:800;font-size:14pt;color:${s.accent};margin:0}
      .bspecs{font-size:9.5pt;margin:4pt 0;font-weight:700}
      .bcopy{font-size:9pt;color:#444;margin:4pt 0}
      .agent{display:flex;gap:10pt;align-items:center;margin-top:12pt;padding-top:10pt;border-top:1px solid #e5e7eb}
      .agent img{width:46pt;height:46pt;border-radius:8pt;object-fit:cover}
      .aname{font-family:${s.head};font-weight:700;font-size:11pt;margin:0}
      .acontact{font-size:8pt;color:#555;margin-top:1pt;line-height:1.4}
      .qr{margin-left:auto;text-align:center}
      .qr img{width:58pt;height:58pt}
      .qr small{display:block;font-size:6pt;color:#888;margin-top:2pt}
      .cfoot{margin-top:auto;padding:8pt 0 10pt;border-top:1px solid #eee;display:flex;align-items:center;justify-content:center;gap:8pt}
      .cfoot small{font-size:6.5pt;color:#999;text-transform:uppercase;letter-spacing:1px}
      .cfoot img{height:20pt}
      .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:8px 14px;display:flex;gap:10px;justify-content:space-between;align-items:center;font-family:Arial;font-size:12px}
      @media print{.__bar{display:none}}
    </style></head><body>
    <div class="__bar"><span>Postcard ready — page 1 is the front, page 2 the back. Print or Save as PDF.</span>
      <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:12px;padding:6px 14px">Print / Save as PDF</button></div>

    <!-- FRONT -->
    <div class="card front">
      <div class="fphoto">${photoBlock}</div>
      ${logo ? `<img class="flogo" src="${esc(logo)}" alt="">` : ""}
      <div class="fgrad">
        <p class="kicker">You're Invited · Neighborhood Open House</p>
        <p class="headline">${esc(headline).replace(/\n/g, "<br>")}</p>
        <p class="addr">${esc(address)}</p>
        <p class="when">${esc(dateFmt)} &nbsp;·&nbsp; ${esc(timeFmt)}</p>
      </div>
    </div>

    <!-- BACK -->
    <div class="card back">
      <div class="btop">
        ${photo ? `<img class="bphoto" src="${esc(photo)}" alt="">` : ""}
        <div style="flex:1">
          <p class="bhead">${listing?.price ? money(listing.price) : "Open House"}</p>
          <p class="addr" style="color:${s.ink}">${esc(address)}</p>
          ${specs ? `<p class="bspecs">${esc(specs)}</p>` : ""}
          <p class="bcopy">${esc(message).replace(/\n/g, "<br>")}</p>
        </div>
      </div>
      <div class="agent">
        ${headshot ? `<img src="${esc(headshot)}" alt="">` : ""}
        <div>
          <p class="aname">${esc(name)}</p>
          <p class="acontact">${[profile?.phone && esc(profile.phone), profile?.email && esc(profile.email), profile?.brokerage && esc(profile.brokerage), profile?.dre_license && `DRE #${esc(profile.dre_license)}`].filter(Boolean).join("<br>")}</p>
        </div>
        <div class="qr"><img src="${esc(qrUrl)}" alt="Scan"><small>Scan for details</small></div>
      </div>
      <div class="cfoot"><small>Financing partner</small><img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"></div>
    </div>
    </body></html>`;
  }

  function generate() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(build());
    w.document.close();
    w.focus();
    void recordUse("open_house_kit", { events: ["marketing_piece_created"], silent: true });
  }

  const cls = "rounded-xl border px-4 py-3 text-left text-sm transition-colors";

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Neighbor postcard</h3>
      <p className="mt-1 text-sm text-muted">A professional invite postcard for the block — front &amp; back, print-ready. Uses your selected listing&apos;s photo &amp; details.</p>
      {!listing && (
        <p className="mt-3 rounded-xl border border-crush-200 bg-crush-50 px-3 py-2 text-xs text-crush-700">
          Pick a saved listing above to pull the property photo &amp; details. <Link href="/listings" className="font-semibold underline">Add a listing</Link> (use &ldquo;Look up from MLS&rdquo; for the photo).
        </p>
      )}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Template</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button key={t.key} type="button" onClick={() => setTpl(t.key)} className={`${cls} ${tpl === t.key ? "border-crush-400 bg-crush-50" : "border-border hover:bg-surface-2"}`}>
            <span className="block font-bold text-ink-900">{t.name}</span>
            <span className="block text-xs text-muted">{t.blurb}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Size</span>
          <select value={size} onChange={(e) => setSize(e.target.value as SizeKey)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400">
            <option value="4x6">4&quot; × 6&quot;</option>
            <option value="5x7">5&quot; × 7&quot;</option>
          </select>
        </label>
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Start</span>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">End</span>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
      </div>

      {/* Editable copy — tweak anything before you print */}
      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-crush-700">Edit the wording</p>
        <div className="mt-3 grid gap-3">
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Front headline</span>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Property address</span>
            <input value={addressStr} onChange={(e) => setAddressStr(e.target.value)} placeholder="123 Main St, City, ST" className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
          <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Back message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 min-h-[70px] w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
        </div>
        {photos.length > 1 && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Choose the photo</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <button key={src} type="button" onClick={() => setPhotoIdx(i)} className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${photoIdx === i ? "border-crush-500" : "border-transparent"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button type="button" onClick={generate} className="mt-4 inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600">
        Create postcard (front &amp; back)
      </button>
    </div>
  );
}
