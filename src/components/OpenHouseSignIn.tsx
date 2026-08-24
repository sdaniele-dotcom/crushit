"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { recordUse } from "@/lib/rewards";
import { realtorBrandHtml, crushFooterHtml, brandingCss, esc } from "@/lib/printBranding";

const COLS = [
  { label: "Name", w: "20%" },
  { label: "Phone", w: "16%" },
  { label: "Email", w: "22%" },
  { label: "Working with<br>an agent?", w: "14%" },
  { label: "Interested in<br>this home?", w: "14%" },
  { label: "Financing<br>help?", w: "14%" },
];
const ROWS = 14;

function sheetHtml(headerBrand: string, address: string, photo: string): string {
  const head = COLS.map((c) => `<th style="width:${c.w}">${c.label}</th>`).join("");
  const rows = Array.from({ length: ROWS })
    .map(
      () =>
        `<tr>${COLS.map((c, i) =>
          i >= 3
            ? `<td class="yn"><span>Y</span><span>N</span></td>`
            : `<td></td>`,
        ).join("")}</tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Open House Sign-In</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap" rel="stylesheet">
  <style>
    @page{size:letter;margin:0.5in 0.5in 0.9in}
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0}
    ${brandingCss}
    .hero{margin:16px 0 6px;text-align:center}
    .hero .kicker{font-family:'Poppins',Arial,sans-serif;font-weight:800;letter-spacing:6px;font-size:26pt;color:#e62c2c;margin:0}
    .hero .addr{font-family:'Poppins',Arial,sans-serif;font-weight:600;font-size:14pt;color:#111;margin:2px 0 0}
    .photo{width:100%;max-height:1.7in;object-fit:cover;border-radius:10px;margin:10px 0}
    .lead{text-align:center;font-size:9.5pt;color:#555;margin:4px 0 10px}
    table{width:100%;border-collapse:collapse;table-layout:fixed}
    th{background:#111;color:#fff;font-size:8.5pt;font-weight:700;padding:8px 6px;text-align:left;line-height:1.15}
    td{border:1px solid #cfcfcf;height:34px;padding:4px 6px}
    td.yn{text-align:center;color:#bbb;font-size:9pt}
    td.yn span{display:inline-block;width:22px;border:1px solid #cfcfcf;border-radius:4px;margin:0 3px;padding:1px 0}
    .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:9px 16px;display:flex;gap:12px;justify-content:space-between;align-items:center;font-family:Arial,sans-serif;font-size:13px}
    @media print{.__bar{display:none}}
  </style></head>
  <body>
    <div class="__bar"><span>Your branded sign-in sheet is ready — print it or save as PDF.</span>
      <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:13px;padding:7px 16px">Print / Save as PDF</button></div>
    <div style="padding:44px 0.5in 0">
      ${headerBrand}
      <div class="hero">
        <p class="kicker">OPEN HOUSE</p>
        ${address ? `<p class="addr">${esc(address)}</p>` : ""}
      </div>
      ${photo ? `<img class="photo" src="${esc(photo)}" alt="">` : ""}
      <p class="lead">Thanks for visiting! Please sign in so we can share details and follow up.</p>
      <table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
    </div>
    ${crushFooterHtml()}
  </body></html>`;
}

export function OpenHouseSignIn() {
  const { profile } = useAuth();
  const { listing } = useActiveListing();

  function print() {
    const address = listing ? [listing.address, listing.city, listing.state].filter(Boolean).join(", ") : "";
    const photo = listing?.photos?.[0] ?? "";
    const html = sheetHtml(realtorBrandHtml(profile), address, photo);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    void recordUse("open_house_kit", { events: ["open_house_piece_created"], silent: true });
  }

  return (
    <button
      type="button"
      onClick={print}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9V3h8v6M6 15h8v3H6zM4 9h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
      </svg>
      Print sign-in sheet
    </button>
  );
}
