"use client";

import { useState } from "react";
import { site } from "@/lib/site";

type Listing = {
  listing_id: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  purchase_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  photo_url?: string;
  listing_url?: string;
  distance_miles?: number;
};

type ApiResult =
  | {
      ok: true;
      subject: { street?: string; city?: string; state?: string; zip?: string };
      radius_miles: number;
      approximate: boolean;
      listings: Listing[];
    }
  | { ok: false; error: string };

const RADII = [2, 5, 10, 25, 50];

function money(n?: number): string {
  if (!n || n <= 0) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function bathLabel(n?: number): string {
  if (!n) return "";
  // Show 2.5 but drop the .0 on whole numbers.
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function specLine(l: Listing): string {
  const parts: string[] = [];
  if (l.bedrooms) parts.push(`${l.bedrooms} bd`);
  if (l.bathrooms) parts.push(`${bathLabel(l.bathrooms)} ba`);
  if (l.square_footage) parts.push(`${l.square_footage.toLocaleString()} sqft`);
  return parts.join(" · ");
}

/** A group label like "2 bed / 1 bath", or "Other" when beds are unknown. */
function groupKey(l: Listing): string {
  if (!l.bedrooms) return "Other";
  const beds = `${l.bedrooms} bed`;
  return l.bathrooms ? `${beds} / ${bathLabel(l.bathrooms)} bath` : beds;
}

/** Sortable rank for a group label (beds, then baths; "Other" last). */
function groupRank(label: string): number {
  if (label === "Other") return 9_999;
  const beds = Number(label.match(/^(\d+(?:\.\d+)?) bed/)?.[1] ?? 0);
  const baths = Number(label.match(/\/ (\d+(?:\.\d+)?) bath/)?.[1] ?? 0);
  return beds * 100 + baths;
}

/** Group listings by bed/bath, returning sorted [label, listings] pairs. */
function groupListings(listings: Listing[]): [string, Listing[]][] {
  const map = new Map<string, Listing[]>();
  for (const l of listings) {
    const k = groupKey(l);
    (map.get(k) ?? map.set(k, []).get(k)!).push(l);
  }
  return [...map.entries()].sort(
    (a, b) => groupRank(a[0]) - groupRank(b[0]),
  );
}

function buildPrintHtml(
  subjectAddress: string,
  radius: number,
  groups: [string, Listing[]][],
): string {
  const sections = groups
    .map(([label, items]) => {
      const rows = items
        .map((l) => {
          const addr = [l.street_address, l.city].filter(Boolean).join(", ");
          const dist =
            l.distance_miles !== undefined ? `${l.distance_miles} mi` : "";
          return `<tr>
            <td>${addr || "—"}</td>
            <td style="text-align:right">${money(l.purchase_price)}</td>
            <td style="text-align:right">${l.square_footage ? l.square_footage.toLocaleString() : "—"}</td>
            <td>${dist}</td>
          </tr>`;
        })
        .join("");
      return `<h2>${label} <span class="count">(${items.length})</span></h2>
        <table>
          <thead><tr><th>Address</th><th style="text-align:right">Price</th><th style="text-align:right">SqFt</th><th>Distance</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Homes for sale nearby</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:40px}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e62c2c;padding-bottom:12px}
    h1{font-size:24px;margin:0 0 4px}
    .sub{color:#555;font-size:13px;margin:0}
    .brand{text-align:right;font-size:12px;color:#333;line-height:1.5}
    .brand strong{color:#e62c2c;font-size:15px;display:block}
    h2{font-size:14px;margin:22px 0 6px;color:#e62c2c;text-transform:uppercase;letter-spacing:.03em}
    h2 .count{color:#999;font-weight:400}
    table{width:100%;border-collapse:collapse;margin-top:4px}
    th,td{border:1px solid #cfcfcf;padding:8px;text-align:left;font-size:12px}
    th{background:#111;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:11px}
    tr:nth-child(even) td{background:#fafafa}
    .foot{margin-top:20px;font-size:11px;color:#666;text-align:center;border-top:1px solid #eee;padding-top:12px}
    @media print{body{padding:24px}}
  </style></head><body>
    <div class="top">
      <div>
        <h1>Homes for sale nearby</h1>
        <p class="sub">Around ${subjectAddress || "this listing"} · within ~${radius} mi · grouped by beds/baths</p>
      </div>
      <div class="brand"><strong>${site.brand}</strong>In partnership with ${site.company}<br/>${site.phone} · NMLS #${site.companyNmls}</div>
    </div>
    ${sections || `<p>No nearby active listings found.</p>`}
    <p class="foot">Data from MLS/third-party sources and may not reflect the latest status — verify before relying on it. Want the monthly payment on any of these? Ask ${site.company} · ${site.website.replace(/^https?:\/\//, "")}</p>
  </body></html>`;
}

export function NearbyListingsTool() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), radius_miles: radius }),
      });
      const data: ApiResult = await res.json();
      setResult(data);
    } catch {
      setResult({
        ok: false,
        error:
          "Couldn't reach the listing service. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function printSheet() {
    if (!result || !result.ok) return;
    const html = buildPrintHtml(
      [result.subject.street, result.subject.city].filter(Boolean).join(", "),
      result.radius_miles,
      groupListings(result.listings),
    );
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  const groups = result && result.ok ? groupListings(result.listings) : [];

  return (
    <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Listing address — e.g. 123 Main St, Long Beach, CA 90808"
          className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm text-ink-900 outline-none placeholder:text-muted focus:border-crush-400 focus:ring-2 focus:ring-crush-100"
        />
        <div className="flex gap-3">
          <label className="relative">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              aria-label="Search radius"
              className="h-full cursor-pointer appearance-none rounded-full border border-border bg-white px-5 py-3 pr-9 text-sm font-medium text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100"
            >
              {RADII.map((r) => (
                <option key={r} value={r}>
                  {r} mi
                </option>
              ))}
            </select>
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 8l4 4 4-4" />
            </svg>
          </label>
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching…" : "Find homes"}
          </button>
        </div>
      </form>
      <p className="mt-2 text-xs text-muted">
        Include the city for the best results. Pulls active MLS listings within
        your chosen radius and groups them by beds/baths.
      </p>

      {result && !result.ok && (
        <div className="mt-5 rounded-2xl border border-crush-100 bg-crush-50 p-4 text-sm text-crush-700">
          {result.error}
        </div>
      )}

      {result && result.ok && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {result.listings.length} active listing
              {result.listings.length === 1 ? "" : "s"} within ~
              {result.radius_miles} mi of{" "}
              <span className="font-semibold text-ink-800">
                {result.subject.city || "the address"}
              </span>
              {result.approximate && " (ZIP/city estimate — no map pin found)"}
            </p>
            {result.listings.length > 0 && (
              <button
                type="button"
                onClick={printSheet}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-2"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 9V3h8v6M6 15h8v3H6zM4 9h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
                </svg>
                Print sheet
              </button>
            )}
          </div>

          {result.listings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
              No active listings came back for that area. Try a larger radius
              above, or double-check the city and ZIP in the address.
            </div>
          ) : (
            <div className="mt-5 space-y-8">
              {groups.map(([label, items]) => (
                <div key={label}>
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-crush-700">
                      {label}
                    </h4>
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                      {items.length}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((l) => (
                      <div
                        key={l.listing_id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
                      >
                        {l.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.photo_url}
                            alt={l.street_address || "Listing"}
                            className="h-36 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-36 w-full items-center justify-center bg-surface-2 text-3xl">
                            🏠
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-lg font-bold text-ink-900">
                              {money(l.purchase_price)}
                            </p>
                            {l.distance_miles !== undefined && (
                              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-700">
                                {l.distance_miles} mi
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-medium text-ink-800">
                            {l.street_address || "Address unavailable"}
                          </p>
                          {(l.city || l.zip) && (
                            <p className="text-xs text-muted">
                              {[l.city, l.state, l.zip]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          {specLine(l) && (
                            <p className="mt-2 text-xs text-muted">
                              {specLine(l)}
                            </p>
                          )}
                          {l.listing_url && (
                            <a
                              href={l.listing_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-crush-600 hover:text-crush-700"
                            >
                              View listing
                              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M4 10h12M11 5l5 5-5 5" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
