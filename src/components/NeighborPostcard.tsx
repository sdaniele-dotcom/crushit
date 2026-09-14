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
type SizeKey = "6x4" | "7x5";
type PostageKey = "permit" | "stamp" | "none";

const TEMPLATES: { key: TemplateKey; name: string; blurb: string }[] = [
  { key: "modern", name: "Modern", blurb: "Photo-dominant, bold band" },
  { key: "luxury", name: "Luxury", blurb: "Serif card on a full-bleed photo" },
  { key: "clean", name: "Clean", blurb: "Split layout, the date leads" },
];

// Landscape. USPS wants the address parallel to the longest edge — a portrait
// card gets a nonmachinable surcharge.
const SIZES: Record<SizeKey, { w: number; h: number; label: string }> = {
  "6x4": { w: 6, h: 4, label: '6" × 4"' },
  "7x5": { w: 7, h: 5, label: '7" × 5"' },
};

const POSTAGE: { key: PostageKey; name: string; blurb: string }[] = [
  { key: "stamp", name: "Stamp", blurb: "Leaves a stamp box" },
  { key: "permit", name: "Permit imprint", blurb: "Bulk mail permit" },
  { key: "none", name: "Neither", blurb: "Hand delivered" },
];

const money = (n: number | null | undefined) =>
  n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function qr(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(url)}`;
}

type Style = {
  accent: string;
  ink: string;
  head: string;
  body: string;
  fonts: string;
};

const STYLES: Record<TemplateKey, Style> = {
  modern: {
    accent: "#e11b22",
    ink: "#16181d",
    head: "Archivo,'Helvetica Neue',Helvetica,sans-serif",
    body: "Archivo,'Helvetica Neue',Helvetica,sans-serif",
    fonts: "family=Archivo:wght@400;500;600;700;800",
  },
  luxury: {
    accent: "#b08d4c",
    ink: "#1a1a1a",
    head: "'Playfair Display',Georgia,serif",
    body: "Archivo,'Helvetica Neue',Helvetica,sans-serif",
    fonts: "family=Archivo:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700",
  },
  clean: {
    accent: "#e11b22",
    ink: "#16181d",
    head: "Archivo,'Helvetica Neue',Helvetica,sans-serif",
    body: "Archivo,'Helvetica Neue',Helvetica,sans-serif",
    fonts: "family=Archivo:wght@400;500;600;700;800",
  },
};

export function NeighborPostcard() {
  const { profile } = useAuth();
  const { listing } = useActiveListing();
  const [tpl, setTpl] = useState<TemplateKey>("modern");
  const [size, setSize] = useState<SizeKey>("6x4");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Editable copy — auto-filled from the listing/defaults, then the agent can tweak.
  const DEFAULT_HEADLINE = "Open house on your block";
  const DEFAULT_MESSAGE =
    "Curious what your home is worth? Come take a look — or send a neighbor over.";
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [addressStr, setAddressStr] = useState("");
  const [photoIdx, setPhotoIdx] = useState(0);
  // Mail panel — nothing on the profile carries a mailing address.
  const [returnAddr, setReturnAddr] = useState("");
  const [postage, setPostage] = useState<PostageKey>("stamp");
  const [permitCity, setPermitCity] = useState("");
  const [permitNo, setPermitNo] = useState("");

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

  // Seed the return address from whatever the profile does carry.
  useEffect(() => {
    if (!profile) return;
    setReturnAddr((prev) =>
      prev.trim()
        ? prev
        : [fullName(profile), profile.brokerage].filter(Boolean).join("\n"),
    );
  }, [profile]);

  function build(): string {
    const s = STYLES[tpl];
    const dim = SIZES[size];
    const photo = photos[photoIdx] ?? photos[0] ?? "";
    const address = addressStr.trim();
    const name = fullName(profile) || "Your Name";
    const logo = profile?.brokerage_logo_url || profile?.team_logo_url || "";
    const headshot = profile?.headshot_url || "";
    const dateFmt = date
      ? new Date(`${date}T00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : "";
    const timeFmt = [start, end]
      .filter(Boolean)
      .map((t) => new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))
      .join(" – ");
    const when = [dateFmt, timeFmt].filter(Boolean).join("  ·  ");
    const specs = [
      listing?.beds != null ? `${listing.beds} Bed` : null,
      listing?.baths != null ? `${listing.baths} Bath` : null,
      listing?.sqft ? `${listing.sqft.toLocaleString()} Sq Ft` : null,
    ].filter(Boolean).join("  ·  ");
    const initial = name.trim().slice(0, 1).toUpperCase() || "A";

    // The photo carries the front. Without one, a flat accent panel beats a
    // stretched thumbnail.
    const photoFill = photo
      ? `<div class="ph" style="background-image:url('${esc(photo)}')"></div>`
      : `<div class="ph noimg"></div>`;

    const agentChip = (dark: boolean) => `
      <div class="chip${dark ? " chip-d" : ""}">
        ${headshot ? `<img class="chip-img" src="${esc(headshot)}" alt="">` : `<span class="chip-in">${esc(initial)}</span>`}
        <span class="chip-txt"><b>${esc(name)}</b>${profile?.brokerage ? `<i>${esc(profile.brokerage)}</i>` : ""}</span>
      </div>`;

    const FRONTS: Record<TemplateKey, string> = {
      modern: `
      <div class="card front-modern">
        <div class="fm-photo">
          ${photoFill}
          <div class="fm-over">${agentChip(true)}${logo ? `<img class="fm-logo" src="${esc(logo)}" alt="">` : ""}</div>
        </div>
        <div class="fm-rule"></div>
        <div class="fm-band">
          <p class="kick">You're invited</p>
          <h1 class="fm-head">${esc(headline)}</h1>
          ${address ? `<p class="fm-addr">${esc(address)}</p>` : ""}
          ${when ? `<p class="fm-when">${esc(when)}</p>` : ""}
        </div>
      </div>`,

      luxury: `
      <div class="card front-luxury">
        ${photoFill}
        <div class="fl-inner">
          <div class="fl-card">
            <p class="fl-kick"><span class="fl-dash"></span>You're invited</p>
            <h1 class="fl-head">${esc(headline)}</h1>
            <div class="fl-rule"></div>
            ${address ? `<p class="fl-addr">${esc(address)}</p>` : ""}
            ${dateFmt ? `<p class="fl-when">${esc(dateFmt)}</p>` : ""}
            ${timeFmt ? `<p class="fl-time">${esc(timeFmt)}</p>` : ""}
            <div class="fl-foot">${agentChip(false)}</div>
          </div>
          ${logo ? `<img class="fl-logo" src="${esc(logo)}" alt="">` : ""}
        </div>
      </div>`,

      clean: `
      <div class="card front-clean">
        <div class="fc-photo">${photoFill}</div>
        <div class="fc-body">
          <p class="kick">You're invited</p>
          <h1 class="fc-head">${esc(headline)}</h1>
          <div class="fc-rule"></div>
          ${dateFmt ? `<p class="fc-date">${esc(dateFmt)}</p>` : ""}
          ${timeFmt ? `<p class="fc-time">${esc(timeFmt)}</p>` : ""}
          ${address ? `<p class="fc-addr">${esc(address)}</p>` : ""}
          <div class="fc-foot">${agentChip(false)}${logo ? `<img class="fc-logo" src="${esc(logo)}" alt="">` : ""}</div>
        </div>
      </div>`,
    };

    const indicia =
      postage === "permit"
        ? `<div class="indicia">FIRST-CLASS MAIL<br>U.S. POSTAGE<br>PAID<br>${esc(permitCity.trim() || "—")}<br>PERMIT NO. ${esc(permitNo.trim() || "—")}</div>`
        : postage === "stamp"
          ? `<div class="stampbox">PLACE<br>STAMP<br>HERE</div>`
          : "";

    const back = `
      <div class="card back">
        <div class="b-msg">
          <div class="b-facts">
            ${listing?.price ? `<p class="b-price">${esc(money(listing.price))}</p>` : ""}
            ${address ? `<p class="b-addr">${esc(address)}</p>` : ""}
            ${specs ? `<p class="b-specs">${esc(specs)}</p>` : ""}
          </div>
          <p class="b-copy">${esc(message)}</p>
          <div class="b-spacer"></div>
          <div class="b-agent">
            ${headshot ? `<img class="b-face" src="${esc(headshot)}" alt="">` : `<span class="b-face b-face-in">${esc(initial)}</span>`}
            <div class="b-lines">
              <b>${esc(name)}</b>
              ${profile?.phone ? `<span class="b-phone">${esc(profile.phone)}</span>` : ""}
              ${profile?.email ? `<span class="b-email">${esc(profile.email)}</span>` : ""}
              ${[profile?.brokerage, profile?.dre_license ? `DRE #${profile.dre_license}` : null].filter(Boolean).length
                ? `<span class="b-lic">${esc([profile?.brokerage, profile?.dre_license ? `DRE #${profile.dre_license}` : null].filter(Boolean).join("  ·  "))}</span>`
                : ""}
            </div>
            <div class="b-qr"><img src="${esc(qr(site.siteUrl))}" alt="Scan"><span>Scan</span></div>
          </div>
          <div class="b-cobrand">
            <span class="b-partner">Financing partner</span>
            <img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage">
            <span class="b-nmls">NMLS #${esc(site.companyNmls)}<br>Equal Housing Lender</span>
          </div>
        </div>
        <div class="b-mail">
          <div class="b-mailtop">
            <div class="b-return">${esc(returnAddr).replace(/\n/g, "<br>")}</div>
            ${indicia}
          </div>
          <div class="b-spacer"></div>
          <!-- Recipient area, left blank for the label printer or mail house.
               The 5/8in strip below it is the barcode clear zone. -->
          <div class="b-to"></div>
        </div>
      </div>`;

    return `<!doctype html><html><head><meta charset="utf-8"><title>Neighbor Postcard</title>
    <link href="https://fonts.googleapis.com/css2?${s.fonts}&display=swap" rel="stylesheet">
    <style>
      @page{size:${dim.w}in ${dim.h}in;margin:0}
      *,*::before,*::after{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      html,body{margin:0;padding:0;background:#f4f4f5}
      .card{width:${dim.w}in;height:${dim.h}in;position:relative;overflow:hidden;background:#fff;color:${s.ink};
        font-family:${s.body};page-break-after:always;display:flex}
      .card:last-child{page-break-after:auto}

      /* Shared photo fill */
      .ph{flex:1 1 auto;background-size:cover;background-position:center;background-color:#d6dade}
      .noimg{background:${s.accent}}
      .kick{margin:0;font-family:${s.head};font-weight:700;font-size:7.5pt;letter-spacing:2pt;
        text-transform:uppercase;color:${s.accent}}

      /* Agent chip */
      .chip{display:flex;align-items:center;gap:6pt}
      .chip-d{background:rgba(10,11,13,.62);border-radius:3pt;padding:5pt 8pt;color:#fff}
      .chip-img{width:17pt;height:17pt;border-radius:2.5pt;object-fit:cover;display:block}
      .chip-in{width:17pt;height:17pt;border-radius:2.5pt;background:${s.accent};color:#fff;display:flex;
        align-items:center;justify-content:center;font-family:${s.head};font-weight:800;font-size:9pt}
      .chip-txt{display:flex;flex-direction:column;gap:.5pt;line-height:1.2}
      .chip-txt b{font-size:9pt;font-weight:700}
      .chip-txt i{font-style:normal;font-size:6.5pt;font-weight:600;letter-spacing:.5pt;text-transform:uppercase;opacity:.75}

      /* ── Front: Modern ── */
      .front-modern{flex-direction:column;background:#16181d;color:#fff}
      .fm-photo{flex:1 1 auto;position:relative;display:flex}
      .fm-over{position:absolute;inset:0;padding:11pt;display:flex;align-items:flex-start;justify-content:space-between;gap:10pt}
      .fm-logo{max-height:26pt;max-width:96pt;object-fit:contain;background:rgba(255,255,255,.88);padding:3pt 5pt;border-radius:3pt}
      .fm-rule{height:3pt;background:${s.accent};flex:0 0 auto}
      .fm-band{flex:0 0 auto;padding:11pt 21pt 13pt}
      .fm-head{margin:4pt 0 0;font-family:${s.head};font-weight:800;font-size:23pt;line-height:1.02;letter-spacing:-.7pt}
      .fm-addr{margin:5pt 0 0;font-size:11pt;font-weight:700}
      .fm-when{margin:3pt 0 0;font-size:12pt;font-weight:600}

      /* ── Front: Luxury ── */
      .front-luxury{position:relative}
      .front-luxury .ph{position:absolute;inset:0}
      .fl-inner{position:relative;flex:1 1 auto;display:flex;align-items:flex-end;padding:19pt;gap:12pt}
      .fl-card{width:236pt;background:#fbfaf8;padding:15pt 17pt 14pt;box-shadow:0 9pt 20pt rgba(26,26,26,.24)}
      .fl-kick{margin:0;display:flex;align-items:center;gap:6pt;font-size:7pt;font-weight:600;letter-spacing:2.4pt;
        text-transform:uppercase;color:${s.accent}}
      .fl-dash{width:15pt;height:.75pt;background:${s.accent};display:block}
      .fl-head{margin:7pt 0 0;font-family:${s.head};font-weight:600;font-size:22pt;line-height:1.08;letter-spacing:-.3pt}
      .fl-rule{height:.75pt;background:#e3ddd1;margin:8pt 0}
      .fl-addr{margin:0;font-size:11pt;font-weight:700}
      .fl-when{margin:3pt 0 0;font-size:9.5pt;font-weight:600;letter-spacing:.7pt;text-transform:uppercase;color:#6e675a}
      .fl-time{margin:1pt 0 0;font-size:9.5pt;font-weight:600;letter-spacing:.7pt;text-transform:uppercase;color:#6e675a}
      .fl-foot{margin-top:9pt;padding-top:8pt;border-top:.75pt solid #e3ddd1}
      .fl-logo{align-self:flex-start;margin-left:auto;max-height:26pt;max-width:90pt;object-fit:contain;
        background:rgba(255,255,255,.88);padding:3pt 5pt;border-radius:3pt}

      /* ── Front: Clean ── */
      .fc-photo{flex:0 0 40%;display:flex}
      .fc-body{flex:1 1 auto;padding:20pt 19pt 16pt;display:flex;flex-direction:column}
      .fc-head{margin:7pt 0 0;font-family:${s.head};font-weight:800;font-size:20pt;line-height:1.05;letter-spacing:-.6pt}
      .fc-rule{width:26pt;height:2.5pt;background:${s.accent};margin:8pt 0}
      .fc-date{margin:0;font-size:15pt;font-weight:700;letter-spacing:-.3pt}
      .fc-time{margin:1pt 0 0;font-size:12pt;font-weight:600;color:#62666e}
      .fc-addr{margin:6pt 0 0;font-size:12pt;font-weight:600;color:#2b2f37}
      .fc-foot{margin-top:auto;padding-top:9pt;border-top:.75pt solid #e4e5e8;display:flex;align-items:center;gap:8pt}
      .fc-logo{margin-left:auto;max-height:22pt;max-width:78pt;object-fit:contain}

      /* ── Back ── */
      /* Both columns stop 45pt (5/8in) above the bottom edge: that strip runs
         the full width of the address side and must stay clear. */
      .back{background:#fff}
      .b-msg{width:210pt;flex:0 0 auto;padding:15pt 15pt 45pt;border-right:.75pt solid #e4e5e8;display:flex;flex-direction:column}
      .b-price{margin:0;font-family:${s.head};font-weight:800;font-size:17pt;letter-spacing:-.5pt;color:${s.accent}}
      .b-addr{margin:2pt 0 0;font-size:10pt;font-weight:700}
      .b-specs{margin:2pt 0 0;font-size:9pt;font-weight:600;letter-spacing:.4pt;text-transform:uppercase;color:#62666e}
      .b-qr{flex:0 0 auto;margin-left:auto;display:flex;flex-direction:column;align-items:center;gap:2pt}
      .b-qr img{width:30pt;height:30pt;display:block}
      .b-qr span{font-size:6pt;font-weight:700;letter-spacing:.5pt;text-transform:uppercase;color:#62666e}
      .b-copy{margin:9pt 0 0;font-size:12pt;line-height:1.38;color:#2b2f37}
      .b-spacer{flex:1 1 auto;min-height:6pt}
      .b-agent{display:flex;align-items:center;gap:8pt;padding-top:8pt;border-top:.75pt solid #e4e5e8}
      .b-face{width:33pt;height:33pt;border-radius:4pt;object-fit:cover;flex:0 0 auto;display:block}
      .b-face-in{background:#eeeff1;border:.75pt solid #e4e5e8;color:#62666e;display:flex;align-items:center;
        justify-content:center;font-family:${s.head};font-weight:800;font-size:13pt}
      .b-lines{display:flex;flex-direction:column;gap:.5pt;min-width:0;flex:1 1 auto}
      .b-lines b{font-size:10pt;font-weight:700}
      .b-phone{font-size:10pt;font-weight:600}
      .b-email{font-size:8pt;color:#62666e}
      .b-lic{font-size:7pt;color:#62666e}
      .b-cobrand{display:flex;align-items:center;gap:7pt;margin-top:8pt;padding-top:7pt;border-top:.75pt solid #e4e5e8}
      .b-partner{font-size:6pt;font-weight:700;letter-spacing:.9pt;text-transform:uppercase;color:#62666e;white-space:nowrap}
      .b-cobrand img{height:14pt;width:auto;display:block}
      .b-nmls{margin-left:auto;text-align:right;font-size:6pt;line-height:1.35;color:#62666e;white-space:nowrap}

      /* Address side */
      .b-mail{flex:1 1 auto;padding:13pt 13pt 45pt;display:flex;flex-direction:column}
      .b-mailtop{display:flex;align-items:flex-start;justify-content:space-between;gap:9pt}
      .b-return{font-size:6.5pt;line-height:1.45;color:#2b2f37}
      .indicia{flex:0 0 auto;border:.75pt solid ${s.ink};padding:4pt 7pt;text-align:center;font-size:5.5pt;
        font-weight:600;line-height:1.5;letter-spacing:.2pt;white-space:nowrap}
      .stampbox{flex:0 0 auto;width:48pt;height:54pt;border:.75pt dashed #9aa0a6;display:flex;flex-direction:column;
        align-items:center;justify-content:center;font-size:5.5pt;font-weight:700;letter-spacing:.6pt;
        line-height:1.7;color:#9aa0a6;text-align:center}
      .b-to{flex:0 0 auto;height:44pt}

      .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:8px 14px;display:flex;
        gap:10px;justify-content:space-between;align-items:center;font-family:Arial,sans-serif;font-size:12px}
      @media print{.__bar{display:none}html,body{background:#fff}}
    </style></head><body>
    <div class="__bar"><span>Page 1 is the front, page 2 the address side. Print or Save as PDF at 100% — no scaling.</span>
      <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e11b22;color:#fff;font-weight:700;font-size:12px;padding:6px 14px">Print / Save as PDF</button></div>
    ${FRONTS[tpl]}
    ${back}
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
  const field =
    "mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400";
  const label = "text-xs font-semibold uppercase tracking-wide text-muted";

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Neighbor postcard</h3>
      <p className="mt-1 text-sm text-muted">
        A print-ready invite for the block — front &amp; back, sized and laid out to mail. Uses your selected
        listing&apos;s photo &amp; details.
      </p>
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
        <label className="block"><span className={label}>Size</span>
          <select value={size} onChange={(e) => setSize(e.target.value as SizeKey)} className={field}>
            {(Object.keys(SIZES) as SizeKey[]).map((k) => (
              <option key={k} value={k}>{SIZES[k].label}</option>
            ))}
          </select>
        </label>
        <label className="block"><span className={label}>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label>
        <label className="block"><span className={label}>Start</span>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={field} /></label>
        <label className="block"><span className={label}>End</span>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={field} /></label>
      </div>

      {/* Editable copy — tweak anything before you print */}
      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-crush-700">Edit the wording</p>
        <div className="mt-3 grid gap-3">
          <label className="block"><span className={label}>Front headline</span>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={field} /></label>
          <label className="block"><span className={label}>Property address</span>
            <input value={addressStr} onChange={(e) => setAddressStr(e.target.value)} placeholder="123 Main St, City, ST" className={field} /></label>
          <label className="block"><span className={label}>Back message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${field} min-h-[70px]`} /></label>
        </div>
        {photos.length > 1 && (
          <div className="mt-3">
            <p className={label}>Choose the photo</p>
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

      {/* Mail panel — needed for anything going through USPS */}
      <div className="mt-4 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-crush-700">Mailing</p>
        <p className="mt-1 text-xs text-muted">
          The address side keeps the recipient block empty for your label printer or mail house, and leaves the
          bottom ⅝&quot; clear for the barcode.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className={label}>Return address</span>
            <textarea value={returnAddr} onChange={(e) => setReturnAddr(e.target.value)} placeholder={"Your Name\nBrokerage\n123 Office St\nCity, ST 90000"} className={`${field} min-h-[76px]`} /></label>
          <div>
            <p className={label}>Postage</p>
            <div className="mt-1 grid gap-2">
              {POSTAGE.map((p) => (
                <button key={p.key} type="button" onClick={() => setPostage(p.key)} className={`${cls} ${postage === p.key ? "border-crush-400 bg-crush-50" : "border-border bg-white hover:bg-surface-2"}`}>
                  <span className="block font-bold text-ink-900">{p.name}</span>
                  <span className="block text-xs text-muted">{p.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {postage === "permit" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>Permit city</span>
              <input value={permitCity} onChange={(e) => setPermitCity(e.target.value)} placeholder="LONG BEACH, CA" className={field} /></label>
            <label className="block"><span className={label}>Permit number</span>
              <input value={permitNo} onChange={(e) => setPermitNo(e.target.value)} placeholder="1234" className={field} /></label>
          </div>
        )}
      </div>

      <button type="button" onClick={generate} className="mt-4 inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600">
        Create postcard (front &amp; back)
      </button>
    </div>
  );
}
