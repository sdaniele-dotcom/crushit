"use client";

/**
 * SocialInfographics — ready-made, co-branded square (1:1) graphics agents can
 * download and post. Two kinds:
 *   1. Listing graphics — photo-forward (Just Listed / Open House / Just Sold /
 *      New Price / Coming Soon) built from the agent's selected listing photo.
 *   2. Educational graphics — bold, share-worthy tips (no photo needed).
 * Every graphic is stamped with the agent's name + Crush Mortgage as the
 * financing partner. "Download / Print" opens a square window (Save as PDF or
 * screenshot for a 1080×1080 post). Nothing to design, nothing to edit.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { recordUse } from "@/lib/rewards";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";
import { fullName, type Profile } from "@/lib/profile";
import { esc } from "@/lib/printBranding";
import type { Listing } from "@/lib/listings";

/* eslint-disable @next/next/no-img-element */

const money = (n: number | null | undefined) =>
  n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function agentLine(profile: Profile | null | undefined): { name: string; contact: string } {
  const name = fullName(profile) || "Your Name";
  const contact = [profile?.phone, profile?.brokerage]
    .map((s) => (s ? String(s) : ""))
    .filter(Boolean)
    .join("  ·  ");
  return { name, contact };
}

/** Shared bottom co-branding strip (print HTML). */
function brandStripHtml(profile: Profile | null | undefined, onDark = false): string {
  const { name, contact } = agentLine(profile);
  const headshot = profile?.headshot_url || "";
  const txt = onDark ? "#fff" : "#111";
  const sub = onDark ? "rgba(255,255,255,.75)" : "#555";
  const line = onDark ? "rgba(255,255,255,.25)" : "#f1f2f4";
  return `<div class="brand" style="border-top:2px solid ${line}">
    ${headshot ? `<img class="head-img" src="${esc(headshot)}" alt="">` : ""}
    <div class="who">
      <div class="a-name" style="color:${txt}">${esc(name)}</div>
      <div class="a-contact" style="color:${sub}">${esc(contact)}</div>
    </div>
    <div class="partner">
      <small style="color:${sub}">Financing partner</small>
      <img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"${onDark ? ' style="filter:brightness(0) invert(1)"' : ""}>
    </div>
  </div>`;
}

const BRAND_CSS = `
  .brand{display:flex;align-items:center;gap:14pt;padding:0.26in 0.5in}
  .brand img.head-img{width:52pt;height:52pt;border-radius:10pt;object-fit:cover}
  .brand .who{flex:1;min-width:0}
  .brand .a-name{font-family:'Poppins',sans-serif;font-weight:800;font-size:14pt}
  .brand .a-contact{font-size:9.5pt;margin-top:2pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .brand .partner{text-align:right}
  .brand .partner small{display:block;font-size:7.5pt;letter-spacing:1px;text-transform:uppercase;margin-bottom:3pt}
  .brand .partner img{height:22pt;object-fit:contain}
  .disc{padding:0 0.5in 0.26in;font-size:7pt;color:#9aa0a6;line-height:1.35;text-align:center}
`;

const DISC_HTML = `<div class="disc">Company NMLS #${site.companyNmls} · Equal Housing Opportunity · Not a commitment to lend. Information deemed reliable but not guaranteed.</div>`;

function docShell(title: string, inner: string, css: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page{size:8in 8in;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;font-family:'Inter',Arial,sans-serif}
    .ig{width:8in;height:8in;position:relative;overflow:hidden;background:#fff;display:flex;flex-direction:column}
    ${BRAND_CSS}
    ${css}
    .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:8px 14px;display:flex;gap:10px;justify-content:space-between;align-items:center;font-family:Arial;font-size:12px}
    @media print{.__bar{display:none}}
  </style></head><body>
  <div class="__bar"><span>Square social graphic — print or Save as PDF, or screenshot for a 1:1 post.</span>
    <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:12px;padding:6px 14px">Download / Print</button></div>
  ${inner}
  </body></html>`;
}

/* ───────────────────────── Listing (photo) graphics ───────────────────────── */

type ListingTpl = {
  key: string;
  name: string;
  badge: string;
  accent: string;
  needsOpenHouse?: boolean;
};

const LISTING_TPLS: ListingTpl[] = [
  { key: "just-listed", name: "Just Listed", badge: "JUST LISTED", accent: "#e62c2c" },
  { key: "open-house", name: "Open House", badge: "OPEN HOUSE", accent: "#0ea5e9", needsOpenHouse: true },
  { key: "just-sold", name: "Just Sold", badge: "JUST SOLD", accent: "#10b981" },
  { key: "new-price", name: "New Price", badge: "NEW PRICE", accent: "#f59e0b" },
  { key: "coming-soon", name: "Coming Soon", badge: "COMING SOON", accent: "#7c3aed" },
];

function specsOf(l: Listing): string {
  return [
    l.beds != null ? `${l.beds} Bed` : null,
    l.baths != null ? `${l.baths} Bath` : null,
    l.sqft ? `${l.sqft.toLocaleString()} Sq Ft` : null,
  ]
    .filter(Boolean)
    .join("  •  ");
}

function openHouseLine(l: Listing): string {
  if (!l.open_house_at) return "";
  const d = new Date(l.open_house_at);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const start = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  let end = "";
  if (l.open_house_end) {
    const e = new Date(l.open_house_end);
    if (!Number.isNaN(e.getTime())) end = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return `${day} · ${start}${end ? ` – ${end}` : ""}`;
}

function buildListingDoc(tpl: ListingTpl, l: Listing, photo: string, profile: Profile | null | undefined): string {
  const addr = esc(l.address || "Your listing");
  const cityLine = esc([l.city, l.state].filter(Boolean).join(", "));
  const specs = specsOf(l);
  const price = money(l.price);
  const oh = tpl.needsOpenHouse ? openHouseLine(l) : "";
  const photoBlock = photo
    ? `<img class="hero" src="${esc(photo)}" alt="">`
    : `<div class="hero noimg"><span>${esc(tpl.badge)}</span></div>`;

  const css = `
    .ig{background:#0b0b0c}
    .stage{position:relative;flex:1;overflow:hidden}
    .hero{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .noimg{display:flex;align-items:center;justify-content:center;background:${tpl.accent};color:#fff;font-family:'Poppins';font-weight:900;font-size:34pt;letter-spacing:2px}
    .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 32%,rgba(0,0,0,.35) 62%,rgba(0,0,0,.86) 100%)}
    .badge{position:absolute;top:0.5in;left:0.5in;background:${tpl.accent};color:#fff;font-family:'Poppins';font-weight:800;font-size:15pt;letter-spacing:3px;padding:8pt 16pt;border-radius:6pt;box-shadow:0 6pt 20pt rgba(0,0,0,.35)}
    ${price ? `.pricetag{position:absolute;top:0.5in;right:0.5in;background:rgba(255,255,255,.95);color:#111;font-family:'Poppins';font-weight:900;font-size:20pt;padding:8pt 16pt;border-radius:6pt}` : ""}
    .cap{position:absolute;left:0.5in;right:0.5in;bottom:0.42in;color:#fff}
    .addr{font-family:'Poppins';font-weight:900;font-size:27pt;line-height:1.05;margin:0;text-shadow:0 2pt 12pt rgba(0,0,0,.5)}
    .city{font-size:13pt;font-weight:600;opacity:.92;margin:4pt 0 0}
    .specs{display:inline-block;margin-top:10pt;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);padding:6pt 14pt;border-radius:999px;font-size:12pt;font-weight:700}
    ${oh ? `.oh{margin-top:10pt;font-family:'Poppins';font-weight:800;font-size:14pt;color:#fff}` : ""}
    .igfoot{background:#0b0b0c}
  `;

  const inner = `<div class="ig">
    <div class="stage">
      ${photoBlock}
      <div class="scrim"></div>
      <div class="badge">${esc(tpl.badge)}</div>
      ${price ? `<div class="pricetag">${esc(price)}</div>` : ""}
      <div class="cap">
        <p class="addr">${addr}</p>
        ${cityLine ? `<p class="city">${cityLine}</p>` : ""}
        ${oh ? `<div class="oh">📅 ${esc(oh)}</div>` : ""}
        ${specs ? `<span class="specs">${esc(specs)}</span>` : ""}
      </div>
    </div>
    <div class="igfoot">
      ${brandStripHtml(profile, true)}
    </div>
  </div>`;

  return docShell(`${tpl.name} — ${l.address}`, inner, css);
}

/* ───────────────────────── Educational graphics ───────────────────────── */

type Point = { big: string; small: string };
type Info = {
  key: string;
  kicker: string;
  title: string;
  accent: string;
  accent2: string;
  motif: string; // big watermark emoji
  intro?: string;
  points: Point[];
  footnote: string;
};

const INFOGRAPHICS: Info[] = [
  {
    key: "down-payment-myth", kicker: "Homebuyer myth", title: "You don't need 20% down",
    accent: "#e62c2c", accent2: "#ff7a59", motif: "🔑",
    intro: "The #1 myth that keeps renters renting:",
    points: [
      { big: "3%", small: "down on many conventional loans" },
      { big: "3.5%", small: "down with an FHA loan" },
      { big: "$0", small: "down for VA & USDA buyers who qualify" },
    ],
    footnote: "Ask me what you'd actually need to buy this year.",
  },
  {
    key: "steps-to-buy", kicker: "First-time buyer", title: "5 steps to buy your first home",
    accent: "#0284c7", accent2: "#38bdf8", motif: "🏡",
    points: [
      { big: "1", small: "Get pre-approved — know your real budget" },
      { big: "2", small: "Tour homes in your price range" },
      { big: "3", small: "Make an offer with your agent" },
      { big: "4", small: "Inspection, appraisal & final approval" },
      { big: "5", small: "Sign, fund & get your keys 🔑" },
    ],
    footnote: "Thinking about step 1? Pre-approval is free — let's talk.",
  },
  {
    key: "get-preapproved", kicker: "Before you shop", title: "Why get pre-approved first",
    accent: "#6d28d9", accent2: "#a78bfa", motif: "✅",
    intro: "A pre-approval isn't paperwork — it's your edge.",
    points: [
      { big: "✓", small: "Know exactly what you can afford" },
      { big: "✓", small: "Sellers take your offer seriously" },
      { big: "✓", small: "Close faster with fewer surprises" },
    ],
    footnote: "Same-day pre-approvals available. DM me to start.",
  },
  {
    key: "cost-of-waiting", kicker: "Market truth", title: "The cost of waiting to buy",
    accent: "#d97706", accent2: "#fbbf24", motif: "📈",
    intro: "Waiting for the \"perfect time\" has a price tag:",
    points: [
      { big: "📈", small: "Home prices historically rise over time" },
      { big: "🏠", small: "Every month renting builds zero equity" },
      { big: "💵", small: "You can refinance a rate — not rebuy a price" },
    ],
    footnote: "Let's run your numbers — decide with facts, not fear.",
  },
  {
    key: "rent-vs-own", kicker: "Rent vs. own", title: "Where does your rent go?",
    accent: "#059669", accent2: "#34d399", motif: "💰",
    intro: "Same monthly check — very different outcome.",
    points: [
      { big: "Rent", small: "100% goes to your landlord's equity" },
      { big: "Own", small: "Part of every payment becomes YOUR equity" },
      { big: "Plus", small: "Potential tax benefits & a fixed payment" },
    ],
    footnote: "Curious what owning would cost vs. your rent? Ask me.",
  },
  {
    key: "self-employed", kicker: "Business owners", title: "Self-employed? You can still qualify",
    accent: "#111827", accent2: "#4b5563", motif: "💼",
    intro: "Told you \"don't qualify\"? Not so fast.",
    points: [
      { big: "🏦", small: "Bank-statement loans — no tax returns" },
      { big: "📊", small: "P&L programs built for business owners" },
      { big: "💳", small: "1099 & asset-based options too" },
    ],
    footnote: "Let's find the program built for how you earn.",
  },
  {
    key: "credit-tips", kicker: "Get ready", title: "Boost your score before you buy",
    accent: "#be123c", accent2: "#fb7185", motif: "📊",
    intro: "Small moves that can lift your score fast:",
    points: [
      { big: "1", small: "Pay every bill on time — set autopay" },
      { big: "2", small: "Keep card balances under 30% of the limit" },
      { big: "3", small: "Don't open new credit right before buying" },
    ],
    footnote: "Not sure where you stand? I'll help you make a plan.",
  },
  {
    key: "closing-costs", kicker: "Know the numbers", title: "What are closing costs?",
    accent: "#0f766e", accent2: "#2dd4b8", motif: "🧾",
    intro: "Budget for these on top of your down payment:",
    points: [
      { big: "~2–5%", small: "of the purchase price, on average" },
      { big: "Lender", small: "appraisal, origination & title fees" },
      { big: "Prepaids", small: "taxes & insurance set aside up front" },
    ],
    footnote: "Ask about seller credits & programs that lower these.",
  },
];

function eduCss(info: Info): string {
  return `
    .ig{background:#fff}
    .head{position:relative;overflow:hidden;background:linear-gradient(135deg,${info.accent} 0%,${info.accent2} 100%);color:#fff;padding:0.52in 0.5in 0.44in}
    .head .motif{position:absolute;right:-0.15in;top:-0.25in;font-size:150pt;opacity:.16;line-height:1;transform:rotate(-8deg)}
    .kick{position:relative;font-family:'Poppins';font-weight:700;font-size:12pt;letter-spacing:3px;text-transform:uppercase;opacity:.95;margin:0}
    .title{position:relative;font-family:'Poppins';font-weight:900;font-size:31pt;line-height:1.06;margin:9pt 0 0;text-shadow:0 2pt 10pt rgba(0,0,0,.18)}
    .body{flex:1;padding:0.34in 0.5in 0.12in;display:flex;flex-direction:column;justify-content:center}
    .intro{font-size:14pt;font-weight:700;color:#374151;margin:0 0 12pt}
    .pt{display:flex;align-items:center;gap:16pt;padding:9pt 0}
    .pt+.pt{border-top:1px solid #eef0f2}
    .pt-big{flex:0 0 66pt;height:66pt;border-radius:16pt;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${info.accent} 0%,${info.accent2} 100%);color:#fff;font-family:'Poppins';font-weight:900;font-size:22pt;line-height:1;box-shadow:0 4pt 12pt ${info.accent}44}
    .pt-small{font-size:14.5pt;font-weight:700;color:#1f2937}
    .foot-note{margin:0 0.5in 0.1in;padding:12pt 16pt;background:${info.accent}10;border-left:5px solid ${info.accent};border-radius:8pt;font-size:13pt;font-weight:800;color:${info.accent}}
  `;
}

function buildEduDoc(info: Info, profile: Profile | null | undefined): string {
  const pointsHtml = info.points
    .map((p) => `<div class="pt"><div class="pt-big">${esc(p.big)}</div><div class="pt-small">${esc(p.small)}</div></div>`)
    .join("");
  const inner = `<div class="ig">
    <div class="head">
      <div class="motif">${info.motif}</div>
      <p class="kick">${esc(info.kicker)}</p>
      <h1 class="title">${esc(info.title)}</h1>
    </div>
    <div class="body">
      ${info.intro ? `<p class="intro">${esc(info.intro)}</p>` : ""}
      ${pointsHtml}
    </div>
    <p class="foot-note">${esc(info.footnote)}</p>
    ${brandStripHtml(profile, false)}
    ${DISC_HTML}
  </div>`;
  return docShell(`${info.title} — Social graphic`, inner, eduCss(info));
}

/* ───────────────────────── Previews ───────────────────────── */

function BrandFooterPreview({ profile }: { profile: Profile | null | undefined }) {
  const { name, contact } = agentLine(profile);
  return (
    <div className="mt-2 flex items-center gap-2 border-t border-surface-2 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-xs font-extrabold text-ink-900">{name}</div>
        {contact && <div className="truncate text-[10px] text-muted">{contact}</div>}
      </div>
      <div className="text-right">
        <div className="text-[7px] uppercase tracking-wider text-muted">Financing partner</div>
        <img src={crushLogoPrimaryDataUri} alt="Crush Mortgage" className="ml-auto mt-0.5 h-4 object-contain" />
      </div>
    </div>
  );
}

function ListingPreview({ tpl, listing, photo }: { tpl: ListingTpl; listing: Listing | null; photo: string }) {
  const specs = listing ? specsOf(listing) : "";
  const price = money(listing?.price);
  return (
    <div className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-ink-900 shadow-sm">
      {photo ? (
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-2xl font-extrabold tracking-widest text-white" style={{ background: tpl.accent }}>
          {tpl.badge}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
      <span className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-white shadow" style={{ background: tpl.accent }}>
        {tpl.badge}
      </span>
      {price && (
        <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 font-display text-sm font-black text-ink-900">
          {price}
        </span>
      )}
      <div className="relative p-4 text-white">
        <div className="font-display text-lg font-black leading-tight drop-shadow">{listing?.address || "Pick a listing"}</div>
        {listing && (listing.city || listing.state) && (
          <div className="text-xs font-semibold opacity-90">{[listing.city, listing.state].filter(Boolean).join(", ")}</div>
        )}
        {specs && (
          <span className="mt-2 inline-block rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 text-[10px] font-bold">{specs}</span>
        )}
      </div>
    </div>
  );
}

function EduPreview({ info, profile }: { info: Info; profile: Profile | null | undefined }) {
  return (
    <div className="flex aspect-square flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative overflow-hidden px-4 pb-4 pt-5 text-white" style={{ background: `linear-gradient(135deg, ${info.accent} 0%, ${info.accent2} 100%)` }}>
        <div className="pointer-events-none absolute -right-2 -top-3 select-none text-7xl opacity-20" style={{ transform: "rotate(-8deg)" }}>{info.motif}</div>
        <p className="relative text-[10px] font-bold uppercase tracking-widest opacity-95">{info.kicker}</p>
        <h3 className="relative mt-1.5 font-display text-lg font-black leading-tight">{info.title}</h3>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-3">
        {info.intro && <p className="mb-1 text-xs font-bold text-ink-700">{info.intro}</p>}
        {info.points.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 py-0.5">
            <span className="grid h-8 min-w-8 place-items-center rounded-lg text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${info.accent} 0%, ${info.accent2} 100%)` }}>
              {p.big}
            </span>
            <span className="text-[11px] font-bold text-ink-800">{p.small}</span>
          </div>
        ))}
      </div>
      <p className="mx-4 mb-1 rounded-md px-3 py-2 text-[11px] font-extrabold" style={{ background: `${info.accent}14`, color: info.accent, borderLeft: `4px solid ${info.accent}` }}>
        {info.footnote}
      </p>
      <BrandFooterPreview profile={profile} />
    </div>
  );
}

/* ───────────────────────── Main ───────────────────────── */

export function SocialInfographics() {
  const { profile } = useAuth();
  const { listing } = useActiveListing();
  const [tab, setTab] = useState<"listing" | "educational">("listing");
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => setPhotoIdx(0), [listing]);

  const photos = listing?.photos ?? [];
  const photo = photos[photoIdx] ?? photos[0] ?? "";

  function downloadListing(tpl: ListingTpl) {
    if (!listing) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildListingDoc(tpl, listing, photo, profile));
    w.document.close();
    w.focus();
    void recordUse("social_content", { events: ["content_piece_created"], silent: true });
  }

  function downloadEdu(info: Info) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildEduDoc(info, profile));
    w.document.close();
    w.focus();
    void recordUse("social_content", { events: ["content_piece_created"], silent: true });
  }

  const tabCls = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-colors ${active ? "bg-crush-500 text-white" : "bg-surface-2 text-ink-700 hover:bg-border"}`;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("listing")} className={tabCls(tab === "listing")}>
          Listing graphics
        </button>
        <button type="button" onClick={() => setTab("educational")} className={tabCls(tab === "educational")}>
          Educational graphics
        </button>
      </div>

      {tab === "listing" ? (
        <div className="mt-5">
          {!listing && (
            <p className="mb-4 rounded-xl border border-crush-200 bg-crush-50 px-4 py-3 text-sm text-crush-700">
              Pick a saved listing at the top of this page to pull the property photo &amp; details.{" "}
              <Link href="/listings" className="font-semibold underline">Add a listing</Link> (use &ldquo;Look up from MLS&rdquo; for the photo).
            </p>
          )}

          {listing && photos.length > 1 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Choose the photo</p>
              <div className="flex flex-wrap gap-2">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${photoIdx === i ? "border-crush-500" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LISTING_TPLS.map((tpl) => {
              const disabled = !listing || (tpl.needsOpenHouse && !listing.open_house_at);
              return (
                <div key={tpl.key} className="flex flex-col">
                  <ListingPreview tpl={tpl} listing={listing} photo={photo} />
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => downloadListing(tpl)}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {tpl.name}
                  </button>
                  {tpl.needsOpenHouse && listing && !listing.open_house_at && (
                    <p className="mt-1 text-center text-[11px] text-muted">Add an open-house date to the listing to use this.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INFOGRAPHICS.map((info) => (
            <div key={info.key} className="flex flex-col">
              <EduPreview info={info} profile={profile} />
              <button
                type="button"
                onClick={() => downloadEdu(info)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crush-600"
              >
                Download / Print
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
