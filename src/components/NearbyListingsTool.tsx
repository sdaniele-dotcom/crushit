"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/** Best-effort parse of "Long Beach, CA 90804" (or a full street address). */
function parseLocation(raw: string): {
  city?: string;
  state?: string;
  zip?: string;
} {
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const tail = parts[parts.length - 1] ?? "";
  const state = tail.match(/\b([A-Za-z]{2})\b/)?.[1]?.toUpperCase();
  const zip = raw.match(/\b(\d{5})\b/)?.[1];
  let city: string | undefined;
  if (parts.length >= 2) {
    // If the last part is just "ST ZIP", the city is the part before it.
    city = /\d{5}|^[A-Za-z]{2}$/.test(tail)
      ? parts[parts.length - 2]
      : parts[parts.length - 1];
  } else if (parts.length === 1 && !state && !zip) {
    city = parts[0];
  }
  return { city, state, zip };
}

function slug(s: string): string {
  return s
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function zillowUrl(loc: string): string {
  return `https://www.zillow.com/homes/for_sale/${encodeURIComponent(slug(loc))}_rb/`;
}

function realtorUrl(loc: string): string {
  const { city, state, zip } = parseLocation(loc);
  if (city && state) {
    return `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(`${slug(city)}_${state}`)}`;
  }
  if (zip) return `https://www.realtor.com/realestateandhomes-search/${zip}`;
  return `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(slug(loc))}`;
}

function homesUrl(loc: string): string {
  const { city, state, zip } = parseLocation(loc);
  if (city && state) {
    return `https://www.homes.com/${slug(city).toLowerCase()}-${state.toLowerCase()}/`;
  }
  if (zip) return `https://www.homes.com/homes-for-sale/${zip}/`;
  return `https://www.homes.com/homes-for-sale/${encodeURIComponent(slug(loc))}/`;
}

const portals: {
  key: string;
  label: string;
  emoji: string;
  build: (loc: string) => string;
}[] = [
  { key: "zillow", label: "Zillow", emoji: "🏠", build: zillowUrl },
  { key: "realtor", label: "Realtor.com", emoji: "🔑", build: realtorUrl },
  { key: "homes", label: "Homes.com", emoji: "🏡", build: homesUrl },
];

function worksheetHtml(area: string): string {
  const rows = Array.from({ length: 12 })
    .map(
      () =>
        `<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Homes for sale nearby — worksheet</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:40px}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e62c2c;padding-bottom:12px}
    h1{font-size:23px;margin:0 0 4px}
    .sub{color:#555;font-size:13px;margin:0}
    .brand{text-align:right;font-size:12px;color:#333;line-height:1.5}
    .brand strong{color:#e62c2c;font-size:15px;display:block}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #cfcfcf;padding:11px 8px;text-align:left;font-size:12px}
    th{background:#111;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:11px}
    td{height:30px}
    tr:nth-child(even) td{background:#fafafa}
    .foot{margin-top:20px;font-size:11px;color:#666;text-align:center;border-top:1px solid #eee;padding-top:12px}
    @media print{body{padding:24px}}
  </style></head><body>
    <div class="top">
      <div>
        <h1>Homes for sale nearby</h1>
        <p class="sub">Area: ${area || "____________________"}  ·  Date: ____________  ·  Fill in from your MLS</p>
      </div>
      <div class="brand"><strong>${site.brand}</strong>In partnership with ${site.company}<br/>${site.phone} · NMLS #${site.companyNmls}</div>
    </div>
    <table>
      <thead><tr>
        <th style="width:26%">Address</th><th>Price</th><th>Bd</th><th>Ba</th>
        <th>SqFt</th><th>Days on mkt</th><th style="width:20%">Notes</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="foot">Want the monthly payment on any of these for a buyer? Ask ${site.company} · ${site.phone} · ${site.website.replace(/^https?:\/\//, "")}</p>
  </body></html>`;
}

export function NearbyListingsTool() {
  const [location, setLocation] = useState("");
  const ready = location.trim().length >= 3;

  function printWorksheet() {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    w.document.write(worksheetHtml(location.trim()));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  return (
    <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      <label className="block text-sm font-semibold text-ink-900">
        Area to search
      </label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="City, ST ZIP — e.g. Long Beach, CA 90804"
        className="mt-2 w-full rounded-full border border-border bg-white px-5 py-3 text-sm text-ink-900 outline-none placeholder:text-muted focus:border-crush-400 focus:ring-2 focus:ring-crush-100"
      />

      <p className="mt-4 text-sm font-semibold text-ink-800">
        See every active listing nearby
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        {portals.map((p) =>
          ready ? (
            <a
              key={p.key}
              href={p.build(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
            >
              <span>{p.emoji}</span>
              Search {p.label}
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </a>
          ) : (
            <span
              key={p.key}
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold text-muted"
            >
              <span>{p.emoji}</span>
              Search {p.label}
            </span>
          ),
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        Opens a live, up-to-the-minute search for that area in a new tab. Great
        for pulling comps fast — or handing a buyer the current inventory.
      </p>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-ink-900">
            Printable comparison worksheet
          </p>
          <p className="mt-1 text-sm text-muted">
            A co-branded sheet for the sign-in table — jot the nearby homes from
            your MLS and hand buyers a clean side-by-side.
          </p>
        </div>
        <button
          type="button"
          onClick={printWorksheet}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-2"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 9V3h8v6M6 15h8v3H6zM4 9h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
          </svg>
          Print worksheet
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-crush-100 bg-crush-50 p-4 text-sm text-crush-800">
        <span className="font-semibold">Coming soon:</span> live listings
        embedded right here, grouped by beds/baths — as soon as the MLS
        (CRMLS) data feed is connected.
      </div>
    </div>
  );
}
