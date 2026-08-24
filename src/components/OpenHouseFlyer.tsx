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

type TemplateKey = "bold" | "elegant" | "minimal";

const TEMPLATES: { key: TemplateKey; name: string; blurb: string }[] = [
  { key: "bold", name: "Bold", blurb: "Big hero photo, red open-house banner" },
  { key: "elegant", name: "Elegant", blurb: "Framed photo, premium serif type" },
  { key: "minimal", name: "Minimal", blurb: "Bright, airy, lots of white space" },
];

const money = (n: number | null | undefined) =>
  n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function qr(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(url)}`;
}

type Style = { accent: string; ink: string; head: string; body: string; band: string; bandInk: string; kicker: string };
const STYLES: Record<TemplateKey, Style> = {
  bold: { accent: "#e62c2c", ink: "#111", head: "'Poppins',Arial,sans-serif", body: "Arial,Helvetica,sans-serif", band: "#e62c2c", bandInk: "#fff", kicker: "letter-spacing:6px;text-transform:uppercase" },
  elegant: { accent: "#b08d4c", ink: "#1a1a1a", head: "'Playfair Display',Georgia,serif", body: "Georgia,'Times New Roman',serif", band: "#1a1a1a", bandInk: "#fff", kicker: "letter-spacing:9px;text-transform:uppercase" },
  minimal: { accent: "#111", ink: "#1f2937", head: "'Poppins',Arial,sans-serif", body: "Arial,Helvetica,sans-serif", band: "#f3f4f6", bandInk: "#111", kicker: "letter-spacing:4px;text-transform:uppercase" },
};

export function OpenHouseFlyer() {
  const { profile } = useAuth();
  const { listing } = useActiveListing();
  const [tpl, setTpl] = useState<TemplateKey>("bold");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (listing?.open_house_at) {
      const d = new Date(listing.open_house_at);
      if (!Number.isNaN(d.getTime())) { setDate(d.toISOString().slice(0, 10)); setStart(d.toTimeString().slice(0, 5)); }
    }
    if (listing?.open_house_end) {
      const d = new Date(listing.open_house_end);
      if (!Number.isNaN(d.getTime())) setEnd(d.toTimeString().slice(0, 5));
    }
  }, [listing]);

  function build(): string {
    const s = STYLES[tpl];
    const photos = (listing?.photos ?? []).filter(Boolean);
    const hero = photos[0] ?? "";
    const gallery = photos.slice(1, 4);
    const address = listing?.address || "[Property address]";
    const cityLine = listing ? [listing.city, listing.state, listing.zip].filter(Boolean).join(", ") : "";
    const name = fullName(profile) || "Your Name";
    const logo = profile?.brokerage_logo_url || profile?.team_logo_url || "";
    const headshot = profile?.headshot_url || "";
    const dateFmt = date ? new Date(`${date}T00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "";
    const timeFmt = [start, end].filter(Boolean).map((t) => new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })).join(" – ");
    const when = [dateFmt, timeFmt].filter(Boolean).join("  ·  ");
    const specs = [
      listing?.beds != null ? `${listing.beds}` : null,
      listing?.baths != null ? `${listing.baths}` : null,
      listing?.sqft ? `${listing.sqft.toLocaleString()}` : null,
    ];
    const specLabels = ["Beds", "Baths", "Sq Ft"];
    const specsHtml = specs
      .map((v, i) => (v == null ? "" : `<div class="spec"><span class="sv">${esc(v)}</span><span class="sl">${specLabels[i]}</span></div>`))
      .join("");
    const desc = listing?.description || "";
    const qrUrl = qr(site.siteUrl);
    const heroBlock = hero
      ? `<img class="hero-img" src="${esc(hero)}" alt="">`
      : `<div class="hero-none"><span>${esc(name)}</span><small>Add a listing photo (upload one on My Listings)</small></div>`;

    return `<!doctype html><html><head><meta charset="utf-8"><title>Open House Flyer</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
      @page{size:letter;margin:0}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      html,body{margin:0;padding:0}
      .page{width:8.5in;height:11in;position:relative;overflow:hidden;background:#fff;color:${s.ink};font-family:${s.body};display:flex;flex-direction:column}
      .band{background:${s.band};color:${s.bandInk};padding:${tpl === "elegant" ? "26px" : "22px"} 0.6in;display:flex;align-items:center;justify-content:space-between;gap:16px}
      .band .k{margin:0;font-family:${s.head};font-weight:800;font-size:${tpl === "elegant" ? "22pt" : "24pt"};${s.kicker}}
      .band .blogo{max-height:40px;max-width:170px;object-fit:contain;filter:${tpl === "minimal" ? "none" : "brightness(0) invert(1)"}}
      .hero{position:relative;height:${tpl === "elegant" ? "4.3in" : "4.7in"};margin:${tpl === "elegant" ? "0.35in 0.6in 0" : "0"};overflow:hidden;${tpl === "elegant" ? `border:6px solid ${s.accent};border-radius:4px` : ""}}
      .hero-img{width:100%;height:100%;object-fit:cover;display:block}
      .hero-none{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;text-align:center;gap:6px}
      .hero-none span{font-family:${s.head};font-weight:800;font-size:20pt;color:${s.accent}}
      .body{flex:1;padding:${tpl === "elegant" ? "0.3in 0.6in 0" : "0.34in 0.6in 0"}}
      .price{font-family:${s.head};font-weight:800;font-size:30pt;color:${s.accent};margin:0;line-height:1}
      .addr{font-family:${s.head};font-weight:700;font-size:16pt;margin:8px 0 1px;color:${s.ink}}
      .city{font-size:11pt;color:#555;margin:0}
      .specs{display:flex;gap:${tpl === "minimal" ? "34px" : "28px"};margin:16px 0 4px}
      .spec{display:flex;flex-direction:column;align-items:flex-start}
      .spec .sv{font-family:${s.head};font-weight:800;font-size:20pt;line-height:1;color:${s.ink}}
      .spec .sl{font-size:8.5pt;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-top:3px}
      .when{display:inline-block;margin-top:14px;padding:9px 16px;border-radius:${tpl === "minimal" ? "6px" : "999px"};background:${tpl === "minimal" ? "#f3f4f6" : s.accent};color:${tpl === "minimal" ? s.ink : "#fff"};font-family:${s.head};font-weight:700;font-size:11.5pt}
      .when b{text-transform:uppercase;letter-spacing:2px;font-size:8.5pt;display:block;opacity:.85}
      .desc{margin:16px 0 0;font-size:10pt;line-height:1.6;color:#444;max-width:6.4in}
      .gallery{display:flex;gap:10px;margin-top:16px}
      .gallery img{flex:1;height:1.35in;object-fit:cover;border-radius:6px}
      .agent{display:flex;align-items:center;gap:14px;margin:0 0.6in;padding:14px 0;border-top:2px solid ${tpl === "minimal" ? "#e5e7eb" : s.accent}}
      .agent img.head{width:58px;height:58px;border-radius:10px;object-fit:cover}
      .aname{font-family:${s.head};font-weight:800;font-size:13pt;margin:0;color:${s.ink}}
      .acontact{font-size:9pt;color:#555;margin-top:2px;line-height:1.5}
      .qr{margin-left:auto;text-align:center}
      .qr img{width:64px;height:64px}
      .qr small{display:block;font-size:6.5pt;color:#999;margin-top:2px}
      .cfoot{display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 0.6in;border-top:1px solid #eee}
      .cfoot small{font-size:7pt;letter-spacing:1px;text-transform:uppercase;color:#999}
      .cfoot img{height:22px;object-fit:contain}
      .cdisc{text-align:center;font-size:6.5pt;color:#aaa;padding:0 0.6in 12px}
      .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:8px 14px;display:flex;gap:10px;justify-content:space-between;align-items:center;font-family:Arial;font-size:12px}
      @media print{.__bar{display:none}}
    </style></head><body>
    <div class="__bar"><span>Open house flyer ready — one full page. Print or Save as PDF (Letter, no margins).</span>
      <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:12px;padding:6px 14px">Print / Save as PDF</button></div>

    <div class="page">
      <div class="band">
        <p class="k">Open House</p>
        ${logo ? `<img class="blogo" src="${esc(logo)}" alt="">` : `<span style="font-family:${s.head};font-weight:700;font-size:12pt">${esc(profile?.brokerage || "")}</span>`}
      </div>
      <div class="hero">${heroBlock}</div>
      <div class="body">
        ${listing?.price ? `<p class="price">${money(listing.price)}</p>` : ""}
        <p class="addr">${esc(address)}</p>
        ${cityLine ? `<p class="city">${esc(cityLine)}</p>` : ""}
        ${specsHtml ? `<div class="specs">${specsHtml}</div>` : ""}
        ${when ? `<div class="when"><b>Join us</b>${esc(when)}</div>` : ""}
        ${desc ? `<p class="desc">${esc(desc)}</p>` : ""}
        ${gallery.length ? `<div class="gallery">${gallery.map((g) => `<img src="${esc(g)}" alt="">`).join("")}</div>` : ""}
      </div>
      <div class="agent">
        ${headshot ? `<img class="head" src="${esc(headshot)}" alt="">` : ""}
        <div>
          <p class="aname">${esc(name)}</p>
          <p class="acontact">${[profile?.phone && esc(profile.phone), profile?.email && esc(profile.email), profile?.brokerage && esc(profile.brokerage), profile?.dre_license && `DRE #${esc(profile.dre_license)}`].filter(Boolean).join("&nbsp;&nbsp;·&nbsp;&nbsp;")}</p>
        </div>
        <div class="qr"><img src="${esc(qrUrl)}" alt="Scan"><small>Scan for details</small></div>
      </div>
      <div class="cfoot"><small>Financing partner</small><img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"></div>
      <div class="cdisc">Ask about a fast, no-obligation pre-approval · ${esc(site.phone)} · NMLS #${site.companyNmls} · Equal Housing Opportunity</div>
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
  const photoCount = (listing?.photos ?? []).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Open house flyer</h3>
      <p className="mt-1 text-sm text-muted">A full-page property flyer — just the photos and the home&apos;s details, branded to you. Pick a template and print.</p>
      {!listing ? (
        <p className="mt-3 rounded-xl border border-crush-200 bg-crush-50 px-3 py-2 text-xs text-crush-700">
          Pick a saved listing above to pull the photos &amp; details. <Link href="/listings" className="font-semibold underline">Add a listing</Link> and upload a photo.
        </p>
      ) : photoCount === 0 ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This listing has no photo yet. <Link href="/listings" className="font-semibold underline">Upload one on My Listings</Link> so the flyer looks its best.
        </p>
      ) : null}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Template</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button key={t.key} type="button" onClick={() => setTpl(t.key)} className={`${cls} ${tpl === t.key ? "border-crush-400 bg-crush-50" : "border-border hover:bg-surface-2"}`}>
            <span className="block font-bold text-ink-900">{t.name}</span>
            <span className="block text-xs text-muted">{t.blurb}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Start</span>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
        <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-muted">End</span>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400" /></label>
      </div>

      <button type="button" onClick={generate} className="mt-4 inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600">
        Create open house flyer
      </button>
    </div>
  );
}
