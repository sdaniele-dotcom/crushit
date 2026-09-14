/**
 * Editable flyer templates — a small in-app "design studio" for property
 * flyers. Each template is a single Letter page rendered from the agent's
 * fields + uploaded photos + saved branding, so the SAME html drives both the
 * live preview (in an iframe) and the print/PDF window.
 *
 * These are self-contained (no external design service): the agent picks a
 * template, edits the text, uploads their own photos, and prints.
 */
import { esc } from "@/lib/printBranding";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";

export type FlyerCategory = "listing" | "open-house" | "luxury" | "sold" | "rental" | "price-drop";

export type FlyerTemplate = {
  id: string;
  name: string;
  category: FlyerCategory;
  badge: string;
  kicker: string;
  accent: string;
  font: "sans" | "serif";
  layout:
    | "hero" | "grid" | "split" | "minimal" | "banner" | "framed"
    // Open-house layouts: these lead with the date/time instead of burying
    // it in a pill under the specs.
    | "marquee" | "datestack" | "editorial";
  /** How many photos this layout shows off best. */
  photoSlots: number;
};

export const FLYER_TEMPLATES: FlyerTemplate[] = [
  // Listing
  { id: "just-listed", name: "Just Listed", category: "listing", badge: "🏡", kicker: "JUST LISTED", accent: "#e62c2c", font: "sans", layout: "hero", photoSlots: 4 },
  { id: "just-listed-grid", name: "Just Listed · Grid", category: "listing", badge: "🖼️", kicker: "JUST LISTED", accent: "#e62c2c", font: "sans", layout: "grid", photoSlots: 4 },
  { id: "modern-split", name: "Modern Split", category: "listing", badge: "🧭", kicker: "NEW LISTING", accent: "#0f766e", font: "sans", layout: "split", photoSlots: 2 },
  { id: "coming-soon", name: "Coming Soon", category: "listing", badge: "⏳", kicker: "COMING SOON", accent: "#1f2937", font: "serif", layout: "minimal", photoSlots: 1 },
  { id: "bold-banner", name: "Bold Banner", category: "listing", badge: "📣", kicker: "NEW LISTING", accent: "#7c3aed", font: "sans", layout: "banner", photoSlots: 4 },
  // Open house
  { id: "open-house-marquee", name: "Open House · Marquee", category: "open-house", badge: "📣", kicker: "OPEN HOUSE", accent: "#e11b22", font: "sans", layout: "marquee", photoSlots: 4 },
  { id: "open-house-datestack", name: "Open House · Datestack", category: "open-house", badge: "📅", kicker: "OPEN HOUSE", accent: "#e11b22", font: "sans", layout: "datestack", photoSlots: 3 },
  { id: "open-house-editorial", name: "Open House · Editorial", category: "open-house", badge: "🕯️", kicker: "OPEN HOUSE", accent: "#b08d4c", font: "serif", layout: "editorial", photoSlots: 1 },
  // Luxury
  { id: "luxury", name: "Luxury", category: "luxury", badge: "✨", kicker: "FOR SALE", accent: "#b08d4c", font: "serif", layout: "minimal", photoSlots: 1 },
  { id: "luxury-framed", name: "Luxury · Framed", category: "luxury", badge: "🖤", kicker: "PRESENTED BY", accent: "#1a1a1a", font: "serif", layout: "framed", photoSlots: 1 },
  { id: "luxury-split", name: "Luxury · Split", category: "luxury", badge: "🥂", kicker: "EXCLUSIVE", accent: "#8a6d3b", font: "serif", layout: "split", photoSlots: 2 },
  // Rental
  { id: "for-rent", name: "For Rent", category: "rental", badge: "🔑", kicker: "FOR RENT", accent: "#2563eb", font: "sans", layout: "hero", photoSlots: 4 },
  { id: "now-leasing-grid", name: "Now Leasing · Grid", category: "rental", badge: "🏢", kicker: "NOW LEASING", accent: "#2563eb", font: "sans", layout: "grid", photoSlots: 4 },
  // Price drop
  { id: "price-improved", name: "Price Improved", category: "price-drop", badge: "📉", kicker: "PRICE IMPROVED", accent: "#e62c2c", font: "sans", layout: "banner", photoSlots: 4 },
  { id: "new-price", name: "New Price", category: "price-drop", badge: "🏷️", kicker: "NEW PRICE", accent: "#059669", font: "sans", layout: "hero", photoSlots: 3 },
  { id: "new-construction", name: "New Construction", category: "listing", badge: "🏗️", kicker: "NEW CONSTRUCTION", accent: "#334155", font: "sans", layout: "hero", photoSlots: 4 },
  { id: "featured-listing", name: "Featured Listing", category: "luxury", badge: "🌆", kicker: "FEATURED LISTING", accent: "#b08d4c", font: "serif", layout: "hero", photoSlots: 3 },
  // Open house
  // Rental / investment
  { id: "investment", name: "Investment Opportunity", category: "rental", badge: "📈", kicker: "INVESTMENT OPPORTUNITY", accent: "#059669", font: "sans", layout: "split", photoSlots: 2 },
  // Price drop
  { id: "price-reduced-framed", name: "Price Reduced · Framed", category: "price-drop", badge: "🔻", kicker: "PRICE REDUCED", accent: "#e62c2c", font: "sans", layout: "framed", photoSlots: 1 },
  // Sold
  { id: "just-sold", name: "Just Sold", category: "sold", badge: "🎉", kicker: "JUST SOLD", accent: "#0f766e", font: "sans", layout: "hero", photoSlots: 3 },
  { id: "sold-spotlight", name: "Sold · Spotlight", category: "sold", badge: "🌟", kicker: "SOLD", accent: "#0f766e", font: "sans", layout: "minimal", photoSlots: 1 },
  { id: "thinking-of-selling", name: "Thinking of Selling?", category: "sold", badge: "💬", kicker: "THINKING OF SELLING?", accent: "#7c3aed", font: "sans", layout: "banner", photoSlots: 3 },
];

/** Display label for each category (for the template dropdown groups). */
export const CATEGORY_LABELS: Record<FlyerCategory, string> = {
  listing: "Listing",
  "open-house": "Open house",
  luxury: "Luxury",
  rental: "Rental & investment",
  "price-drop": "Price drop",
  sold: "Just sold",
};

export type FlyerData = {
  kicker: string;
  price: string;
  address: string;
  cityLine: string;
  beds: string;
  baths: string;
  sqft: string;
  description: string;
  openDate: string; // for open-house templates
  openTime: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentBrokerage: string;
  headshotUrl: string;
  logoUrl: string;
  dreLicense: string;
};

const FONTS = {
  sans: { head: "'Poppins',Arial,sans-serif", body: "Arial,Helvetica,sans-serif" },
  serif: { head: "'Playfair Display',Georgia,serif", body: "Georgia,'Times New Roman',serif" },
};

function specsHtml(d: FlyerData, accent: string, headFont: string): string {
  const items = [
    d.beds && { v: d.beds, l: "Beds" },
    d.baths && { v: d.baths, l: "Baths" },
    d.sqft && { v: Number(d.sqft).toLocaleString?.() || d.sqft, l: "Sq Ft" },
  ].filter(Boolean) as { v: string; l: string }[];
  if (!items.length) return "";
  return `<div style="display:flex;gap:26px;margin:14px 0 2px">${items
    .map(
      (s) =>
        `<div><div style="font-family:${headFont};font-weight:800;font-size:19pt;line-height:1;color:#111">${esc(s.v)}</div><div style="font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#8a8a8a;margin-top:2px">${s.l}</div></div>`,
    )
    .join("")}</div>`;
}

function whenHtml(d: FlyerData, accent: string, headFont: string): string {
  if (!d.openDate && !d.openTime) return "";
  const parts = [d.openDate, d.openTime].filter(Boolean).map(esc).join("  ·  ");
  return `<div style="display:inline-block;margin-top:14px;padding:10px 18px;border-radius:999px;background:${accent};color:#fff;font-family:${headFont};font-weight:700;font-size:12pt"><span style="text-transform:uppercase;letter-spacing:2px;font-size:8.5pt;opacity:.85;display:block">Open house</span>${parts}</div>`;
}

/** Top-of-flyer agent/company brand bar. The agent's uploaded logo sits at the
 *  top of EVERY template (object-fit:contain so it's never stretched); if no
 *  logo is saved, their name + brokerage stand in. */
function topBrand(d: FlyerData, headFont: string): string {
  const inner = d.logoUrl
    ? `<img src="${esc(d.logoUrl)}" style="max-height:52px;max-width:270px;width:auto;height:auto;object-fit:contain" alt="">`
    : `<div><span style="font-family:${headFont};font-weight:800;font-size:15pt;color:#111">${esc(d.agentName || "Your Name")}</span>${d.agentBrokerage ? `<span style="color:#666;font-size:10.5pt">&nbsp;&nbsp;·&nbsp;&nbsp;${esc(d.agentBrokerage)}</span>` : ""}</div>`;
  return `<div style="display:flex;align-items:center;min-height:48px;padding:14px 0.6in 10px">${inner}</div>`;
}

function agentBlock(d: FlyerData, accent: string, headFont: string): string {
  const contact = [d.agentPhone, d.agentEmail, d.agentBrokerage, d.dreLicense && `DRE #${d.dreLicense}`]
    .filter(Boolean)
    .map(esc)
    .join("&nbsp;&nbsp;·&nbsp;&nbsp;");
  return `<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-top:2px solid ${accent}">
    ${d.headshotUrl ? `<img src="${esc(d.headshotUrl)}" style="width:56px;height:56px;border-radius:10px;object-fit:cover" alt="">` : ""}
    <div style="flex:1;min-width:0">
      <div style="font-family:${headFont};font-weight:800;font-size:13pt;color:#111">${esc(d.agentName || "Your Name")}</div>
      <div style="font-size:9pt;color:#555;margin-top:2px">${contact}</div>
    </div>
    ${d.logoUrl ? `<img src="${esc(d.logoUrl)}" style="max-height:38px;max-width:140px;width:auto;object-fit:contain" alt="">` : ""}
  </div>`;
}

function crushFoot(): string {
  return `<div style="display:flex;align-items:center;justify-content:center;gap:9px;padding:7px 0;border-top:1px solid #eee">
      <span style="font-size:7pt;letter-spacing:1px;text-transform:uppercase;color:#9a9a9a">Financing partner</span>
      <img src="${crushLogoPrimaryDataUri}" style="height:20px;object-fit:contain" alt="Crush Mortgage">
    </div>
    <div style="text-align:center;font-size:6.5pt;color:#aaa;padding:0 0 8px">Ask about a fast, no-obligation pre-approval · ${esc(site.phone)} · NMLS #${site.companyNmls} · Equal Housing Opportunity</div>`;
}

function photoOrPlaceholder(url: string | undefined, style: string, label = "Add a photo"): string {
  if (url) return `<img src="${esc(url)}" style="${style};object-fit:cover" alt="">`;
  return `<div style="${style};background:#f1f2f4;display:flex;align-items:center;justify-content:center;color:#b3b6bc;font-family:Arial;font-size:11pt">${label}</div>`;
}

/**
 * `openDate` is free text ("Saturday, October 3" when auto-filled from the
 * listing, but the agent can type anything). The datestack rail needs it split
 * into weekday / day / month; when it can't be parsed the caller falls back to
 * printing the string whole.
 */
function splitOpenDate(v: string): { weekday: string; day: string; month: string } | null {
  const t = v.trim();
  if (!t) return null;
  const weekday = /^([A-Za-z]{3,9})\s*,/.exec(t)?.[1] ?? "";
  const md = /([A-Za-z]{3,9})\s+(\d{1,2})|(\d{1,2})\s+([A-Za-z]{3,9})/.exec(t);
  if (!md) return null;
  const month = md[1] ?? md[4] ?? "";
  const day = md[2] ?? md[3] ?? "";
  if (!month || !day) return null;
  return { weekday, day, month };
}

/** Big stat trio (beds / baths / sq ft) used by the open-house layouts. */
function statsHtml(d: FlyerData, headFont: string, size = 19): string {
  const items = [
    d.beds && { v: d.beds, l: "Beds" },
    d.baths && { v: d.baths, l: "Baths" },
    d.sqft && { v: Number(d.sqft).toLocaleString?.() || d.sqft, l: "Sq Ft" },
  ].filter(Boolean) as { v: string; l: string }[];
  if (!items.length) return "";
  return `<div style="display:flex;gap:30px;margin-top:14px">${items
    .map(
      (x) =>
        `<div><div style="font-family:${headFont};font-weight:800;font-size:${size}pt;line-height:1;color:#111">${esc(x.v)}</div><div style="font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#8a8a8a;margin-top:3px">${x.l}</div></div>`,
    )
    .join("")}</div>`;
}

/** Build the full print-ready HTML for one template. `photos` are data URLs or URLs. */
export function renderFlyer(tpl: FlyerTemplate, d: FlyerData, photos: string[]): string {
  const f = FONTS[tpl.font];
  const a = tpl.accent;
  const hero = photos[0];
  const priceHtml = d.price
    ? `<div style="font-family:${f.head};font-weight:800;font-size:30pt;color:${a};line-height:1;margin:0">${esc(d.price)}</div>`
    : "";
  const kicker = `<div style="display:inline-block;background:${a};color:#fff;font-family:${f.head};font-weight:800;font-size:11pt;letter-spacing:4px;text-transform:uppercase;padding:6px 16px;border-radius:4px">${esc(d.kicker || tpl.kicker)}</div>`;
  const addr = `<div style="font-family:${f.head};font-weight:700;font-size:16pt;color:#111;margin:8px 0 1px">${esc(d.address || "[Property address]")}</div>${d.cityLine ? `<div style="font-size:11pt;color:#555">${esc(d.cityLine)}</div>` : ""}`;
  const desc = d.description ? `<p style="margin:14px 0 0;font-size:10pt;line-height:1.6;color:#444;max-width:6.4in">${esc(d.description)}</p>` : "";

  let inner = "";
  if (tpl.layout === "hero") {
    const strip = photos.slice(1, 4);
    inner = `
      ${photoOrPlaceholder(hero, "width:100%;height:4.05in;display:block", "Upload the hero photo")}
      <div style="padding:0.3in 0.6in 0">
        <div style="margin:-0.55in 0 0"><span style="position:relative;top:0">${kicker}</span></div>
        <div style="margin-top:0.4in">${priceHtml}${addr}${specsHtml(d, a, f.head)}${whenHtml(d, a, f.head)}${desc}</div>
        ${strip.length ? `<div style="display:flex;gap:10px;margin-top:16px">${strip.map((p) => photoOrPlaceholder(p, "flex:1;height:1.25in;border-radius:6px")).join("")}</div>` : ""}
      </div>`;
  } else if (tpl.layout === "grid") {
    const grid = [0, 1, 2, 3].map((i) => photos[i]);
    inner = `
      <div style="padding:0.5in 0.6in 0">${kicker}<div style="margin-top:10px">${priceHtml}${addr}</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 0.6in 0">
        ${grid.map((p, i) => photoOrPlaceholder(p, `width:100%;height:2in;border-radius:8px`, i === 0 ? "Upload photos" : "")).join("")}
      </div>
      <div style="padding:14px 0.6in 0">${specsHtml(d, a, f.head)}${whenHtml(d, a, f.head)}${desc}</div>`;
  } else if (tpl.layout === "split") {
    inner = `
      <div style="display:flex;height:7.4in">
        <div style="width:3.6in;flex-shrink:0">${photoOrPlaceholder(hero, "width:100%;height:100%;display:block", "Upload the hero photo")}</div>
        <div style="flex:1;padding:0.5in 0.5in 0">
          ${kicker}
          <div style="margin-top:14px">${priceHtml}${addr}${specsHtml(d, a, f.head)}${whenHtml(d, a, f.head)}${desc}</div>
          ${photos[1] ? `<img src="${esc(photos[1])}" style="width:100%;height:1.6in;object-fit:cover;border-radius:8px;margin-top:16px" alt="">` : ""}
        </div>
      </div>`;
  } else if (tpl.layout === "banner") {
    const strip = photos.slice(1, 4);
    inner = `
      <div style="background:${a};padding:0.42in 0.6in;color:#fff">
        <div style="display:inline-block;border:1.5px solid rgba(255,255,255,.7);font-family:${f.head};font-weight:800;font-size:10pt;letter-spacing:4px;text-transform:uppercase;padding:5px 14px">${esc(d.kicker || tpl.kicker)}</div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-top:12px">
          <div>
            <div style="font-family:${f.head};font-weight:700;font-size:17pt">${esc(d.address || "[Property address]")}</div>
            ${d.cityLine ? `<div style="font-size:11pt;opacity:.9">${esc(d.cityLine)}</div>` : ""}
          </div>
          ${d.price ? `<div style="font-family:${f.head};font-weight:800;font-size:28pt;line-height:1;white-space:nowrap">${esc(d.price)}</div>` : ""}
        </div>
      </div>
      ${photoOrPlaceholder(hero, "width:100%;height:3.9in;display:block", "Upload the hero photo")}
      <div style="padding:0.3in 0.6in 0">${specsHtml(d, a, f.head)}${whenHtml(d, a, f.head)}${desc}
        ${strip.length ? `<div style="display:flex;gap:10px;margin-top:16px">${strip.map((p) => photoOrPlaceholder(p, "flex:1;height:1.2in;border-radius:6px")).join("")}</div>` : ""}
      </div>`;
  } else if (tpl.layout === "framed") {
    inner = `
      <div style="background:${a};padding:0.32in">
        <div style="background:#fff;padding:0.4in 0.5in;text-align:center">
          <div style="display:inline-block;font-family:${f.head};font-weight:700;font-size:10pt;letter-spacing:5px;text-transform:uppercase;color:${a}">${esc(d.kicker || tpl.kicker)}</div>
          <div style="margin:14px 0 0">${photoOrPlaceholder(hero, "width:100%;height:3.9in", "Upload the hero photo")}</div>
          ${d.price ? `<div style="font-family:${f.head};font-weight:800;font-size:27pt;color:${a};margin-top:14px">${esc(d.price)}</div>` : ""}
          <div style="font-family:${f.head};font-weight:700;font-size:15pt;color:#111;margin-top:4px">${esc(d.address || "[Property address]")}</div>
          ${d.cityLine ? `<div style="font-size:11pt;color:#555">${esc(d.cityLine)}</div>` : ""}
          <div style="display:flex;justify-content:center;margin-top:6px">${specsHtml(d, a, f.head)}</div>
          <div style="display:flex;justify-content:center">${whenHtml(d, a, f.head)}</div>
          ${d.description ? `<p style="margin:12px auto 0;font-size:10pt;line-height:1.6;color:#444;max-width:5.6in">${esc(d.description)}</p>` : ""}
        </div>
      </div>`;
  } else if (tpl.layout === "marquee") {
    // The date runs full width in an accent band directly under the photo.
    const strip = [1, 2, 3].map((i) => photos[i]);
    inner = `
      <div style="display:flex;flex-direction:column">
      ${photoOrPlaceholder(hero, "width:100%;height:3.55in;display:block;flex-shrink:0", "Upload the hero photo")}
      <div style="background:${a};color:#fff;padding:0.2in 0.6in 0.22in">
        <div style="font-family:${f.head};font-weight:700;font-size:9.5pt;letter-spacing:4.5px;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(d.kicker || tpl.kicker)}</div>
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin-top:5px">
          <div style="font-family:${f.head};font-weight:800;font-size:32pt;line-height:1;letter-spacing:-1.4px">${esc(d.openDate || "[Add the date]")}</div>
          ${d.openTime ? `<div style="font-family:${f.head};font-weight:700;font-size:18pt;line-height:1;white-space:nowrap">${esc(d.openTime)}</div>` : ""}
        </div>
      </div>
      <div style="flex:1;padding:0.26in 0.6in 0.2in;display:flex;flex-direction:column">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px">
          <div>
            <div style="font-family:${f.head};font-weight:700;font-size:17pt;color:#111">${esc(d.address || "[Property address]")}</div>
            ${d.cityLine ? `<div style="font-size:11pt;color:#555;margin-top:2px">${esc(d.cityLine)}</div>` : ""}
          </div>
          ${d.price ? `<div style="font-family:${f.head};font-weight:800;font-size:26pt;line-height:1;letter-spacing:-.8px;color:${a};white-space:nowrap">${esc(d.price)}</div>` : ""}
        </div>
        ${statsHtml(d, f.head)}${desc}
        <div style="flex:1;min-height:0.16in"></div>
        <div style="display:flex;gap:11px">${strip.map((x) => photoOrPlaceholder(x, "flex:1;height:1.25in;border-radius:6px", "")).join("")}</div>
      </div>
      </div>`;
  } else if (tpl.layout === "datestack") {
    // Calendar rail down the left — the strongest read at a distance, and the
    // cheapest to print (one ink block, no photo bleed).
    const parts = splitOpenDate(d.openDate);
    const railDate = parts
      ? `${parts.weekday ? `<div style="font-family:${f.head};font-weight:600;font-size:17pt;line-height:1;color:rgba(255,255,255,.72)">${esc(parts.weekday)}</div>` : ""}
         <div style="font-family:${f.head};font-weight:800;font-size:72pt;line-height:.88;letter-spacing:-3px;margin-top:5px">${esc(parts.day)}</div>
         <div style="font-family:${f.head};font-weight:700;font-size:20pt;line-height:1;letter-spacing:2px;text-transform:uppercase;margin-top:3px">${esc(parts.month)}</div>`
      : `<div style="font-family:${f.head};font-weight:800;font-size:24pt;line-height:1.15">${esc(d.openDate || "[Add the date]")}</div>`;
    inner = `
      <div style="display:flex">
        <div style="width:2.7in;flex-shrink:0;background:#16181d;color:#fff;padding:0.36in 0.3in;display:flex;flex-direction:column">
          <div style="font-family:${f.head};font-weight:700;font-size:9.5pt;letter-spacing:4px;text-transform:uppercase;color:${a}">${esc(d.kicker || tpl.kicker)}</div>
          <div style="margin-top:0.24in">${railDate}</div>
          <div style="height:3px;width:46px;background:${a};margin:0.26in 0"></div>
          ${d.openTime ? `<div style="font-family:${f.head};font-weight:700;font-size:17pt;line-height:1.15">${esc(d.openTime)}</div>` : ""}
          <div style="flex:1"></div>
          <div style="padding-top:0.2in;border-top:1px solid rgba(255,255,255,.18)">
            <div style="font-family:${f.head};font-weight:700;font-size:12.5pt;line-height:1.25">${esc(d.address || "[Property address]")}</div>
            ${d.cityLine ? `<div style="font-size:10pt;color:rgba(255,255,255,.68);margin-top:3px">${esc(d.cityLine)}</div>` : ""}
          </div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;min-width:0">
          ${photoOrPlaceholder(hero, "width:100%;height:3.4in;display:block", "Upload the hero photo")}
          <div style="flex:1;padding:0.24in 0.42in 0;display:flex;flex-direction:column">
            ${d.price ? `<div style="font-family:${f.head};font-weight:800;font-size:27pt;line-height:1;letter-spacing:-1px;color:${a}">${esc(d.price)}</div>` : ""}
            ${statsHtml(d, f.head, 17)}${desc}
            <div style="flex:1;min-height:0.18in"></div>
            <div style="display:flex;gap:10px;padding-bottom:0.18in">${[1, 2].map((i) => photoOrPlaceholder(photos[i], "flex:1;height:1.3in;border-radius:6px", "")).join("")}</div>
          </div>
        </div>
      </div>`;
  } else if (tpl.layout === "editorial") {
    // Full-bleed photo with the details on a card that overlaps it.
    inner = `
      <div style="background:#f7f5f1;display:flex;flex-direction:column">
        ${photoOrPlaceholder(hero, "width:100%;height:4.9in;display:block;flex-shrink:0", "Upload the hero photo")}
        <div style="padding:0 0.5in">
          <div style="margin-top:-0.7in;background:#fff;padding:0.3in 0.42in 0.28in;text-align:center;box-shadow:0 14px 34px rgba(26,26,26,.16)">
            <div style="display:flex;align-items:center;justify-content:center;gap:12px">
              <div style="width:30px;height:1px;background:${a}"></div>
              <div style="font-family:${f.head};font-weight:600;font-size:9.5pt;letter-spacing:4.5px;text-transform:uppercase;color:${a}">${esc(d.kicker || tpl.kicker)}</div>
              <div style="width:30px;height:1px;background:${a}"></div>
            </div>
            <div style="font-family:${f.head};font-weight:600;font-size:28pt;line-height:1.08;letter-spacing:-.5px;margin-top:11px">${esc(d.openDate || "[Add the date]")}</div>
            ${d.openTime ? `<div style="font-size:14pt;font-weight:600;letter-spacing:2.6px;text-transform:uppercase;color:#6e675a;margin-top:7px">${esc(d.openTime)}</div>` : ""}
            <div style="height:1px;background:#e3ddd1;margin:0.22in 0"></div>
            <div style="font-family:${f.head};font-weight:600;font-size:19pt;letter-spacing:-.3px">${esc(d.address || "[Property address]")}</div>
            ${d.cityLine ? `<div style="font-size:11pt;color:#6e675a;margin-top:3px">${esc(d.cityLine)}</div>` : ""}
            <div style="display:flex;align-items:baseline;justify-content:center;gap:22px;margin-top:12px">
              ${d.price ? `<div style="font-family:${f.head};font-weight:700;font-size:22pt;letter-spacing:-.6px;color:${a}">${esc(d.price)}</div>` : ""}
              ${[d.beds && `${d.beds} Bed`, d.baths && `${d.baths} Bath`, d.sqft && `${Number(d.sqft).toLocaleString?.() || d.sqft} Sq Ft`].filter(Boolean).length ? `<div style="font-size:10.5pt;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:#6e675a">${[d.beds && `${d.beds} Bed`, d.baths && `${d.baths} Bath`, d.sqft && `${Number(d.sqft).toLocaleString?.() || d.sqft} Sq Ft`].filter(Boolean).map(esc).join("&nbsp;&nbsp;·&nbsp;&nbsp;")}</div>` : ""}
            </div>
          </div>
          ${d.description ? `<p style="margin:0.22in auto 0;font-size:10.5pt;line-height:1.6;color:#3c3a33;text-align:center;max-width:6in">${esc(d.description)}</p>` : ""}
          <div style="height:0.28in"></div>
        </div>
      </div>`;
  } else {
    // minimal — full-bleed photo with an overlay panel
    inner = `
      <div style="position:relative;height:6.7in">
        ${photoOrPlaceholder(hero, "position:absolute;inset:0;width:100%;height:100%", "Upload the hero photo")}
        <div style="position:absolute;left:0;right:0;bottom:0;padding:0.5in 0.6in;background:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,0))">
          <div style="display:inline-block;border:1.5px solid #fff;color:#fff;font-family:${f.head};font-weight:700;font-size:10pt;letter-spacing:5px;text-transform:uppercase;padding:5px 14px">${esc(d.kicker || tpl.kicker)}</div>
          <div style="font-family:${f.head};font-weight:800;font-size:26pt;color:#fff;margin-top:12px">${esc(d.price || "")}</div>
          <div style="font-family:${f.head};font-weight:600;font-size:15pt;color:#fff">${esc(d.address || "[Property address]")}</div>
          <div style="color:#eee;font-size:11pt;margin-top:2px">${esc(d.cityLine)}${d.beds || d.baths || d.sqft ? ` · ${[d.beds && `${d.beds} bd`, d.baths && `${d.baths} ba`, d.sqft && `${Number(d.sqft).toLocaleString?.() || d.sqft} sqft`].filter(Boolean).join(" · ")}` : ""}</div>
          ${d.openDate || d.openTime ? `<div style="color:#fff;font-family:${f.head};font-weight:700;margin-top:10px">Open House · ${[d.openDate, d.openTime].filter(Boolean).map(esc).join(" · ")}</div>` : ""}
        </div>
      </div>
      <div style="padding:0.28in 0.6in 0">${desc}</div>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(tpl.name)} flyer</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page{size:letter;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;background:#fff}
    .page{width:8.5in;min-height:11in;position:relative;overflow:hidden;background:#fff;color:#111;font-family:${f.body};display:flex;flex-direction:column}
    .page-body{flex:1}
    /* The open-house layouts run a full-height rail or tint down to the
       agent block, so their single root child has to fill the body. */
    .page-body-fill{display:flex;flex-direction:column}
    .page-body-fill>*{flex:1;min-height:0}
    .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:8px 14px;display:flex;gap:10px;justify-content:space-between;align-items:center;font-family:Arial;font-size:12px}
    @media print{.__bar{display:none}}
  </style></head><body>
  <div class="__bar"><span>Flyer ready — print or Save as PDF (Letter, no margins).</span>
    <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:12px;padding:6px 14px">Print / Save as PDF</button></div>
  <div class="page">
    ${topBrand(d, f.head)}
    <div class="page-body${["marquee", "datestack", "editorial"].includes(tpl.layout) ? " page-body-fill" : ""}">${inner}</div>
    <div style="padding:0 0.6in">${agentBlock(d, a, f.head)}</div>
    ${crushFoot()}
  </div>
  </body></html>`;
}
