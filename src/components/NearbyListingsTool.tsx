"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";

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

const RADII = [1, 5, 10, 25];

function money(n?: number): string {
  return n && n > 0 ? "$" + Math.round(n).toLocaleString("en-US") : "—";
}
function bathLabel(n?: number): string {
  if (!n) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
function specLine(l: Listing): string {
  const parts: string[] = [];
  if (l.bedrooms) parts.push(`${l.bedrooms} bd`);
  if (l.bathrooms) parts.push(`${bathLabel(l.bathrooms)} ba`);
  if (l.square_footage) parts.push(`${l.square_footage.toLocaleString()} sqft`);
  return parts.join(" · ");
}
function groupKey(l: Listing): string {
  if (!l.bedrooms) return "Other";
  const beds = `${l.bedrooms} bed`;
  return l.bathrooms ? `${beds} / ${bathLabel(l.bathrooms)} bath` : beds;
}
function groupRank(label: string): number {
  if (label === "Other") return 9999;
  const beds = Number(label.match(/^(\d+(?:\.\d+)?) bed/)?.[1] ?? 0);
  const baths = Number(label.match(/\/ (\d+(?:\.\d+)?) bath/)?.[1] ?? 0);
  return beds * 100 + baths;
}
function groupListings(listings: Listing[]): [string, Listing[]][] {
  const map = new Map<string, Listing[]>();
  for (const l of listings) {
    const k = groupKey(l);
    (map.get(k) ?? map.set(k, []).get(k)!).push(l);
  }
  return [...map.entries()].sort((a, b) => groupRank(a[0]) - groupRank(b[0]));
}

/** One-page, Crush-branded printout of every home found — a compact table
 *  grouped by beds/baths so many listings fit on a single page. */
function buildPrintHtml(
  subjectAddress: string,
  radius: number,
  total: number,
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
            <td class="r">${money(l.purchase_price)}</td>
            <td class="c">${l.bedrooms ?? ""}</td>
            <td class="c">${bathLabel(l.bathrooms)}</td>
            <td class="r">${l.square_footage ? l.square_footage.toLocaleString() : "—"}</td>
            <td class="c">${dist}</td>
          </tr>`;
        })
        .join("");
      return `<h2>${label} <span class="count">(${items.length})</span></h2>
        <table><thead><tr>
          <th>Address</th><th class="r">Price</th><th class="c">Bd</th>
          <th class="c">Ba</th><th class="r">SqFt</th><th class="c">Dist</th>
        </tr></thead><tbody>${rows}</tbody></table>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Homes for sale nearby</title><style>
    *{box-sizing:border-box}
    body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:36px}
    .top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #e62c2c;padding-bottom:14px}
    h1{font-size:23px;margin:0 0 4px}.sub{color:#555;font-size:13px;margin:0}
    .brand{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
    .brand img{height:50px;width:auto;display:block}
    .brand .contact{color:#333;font-size:12px;line-height:1.5;text-align:right}
    .brand .contact strong{color:#e62c2c;font-size:13px}
    h2{font-size:13px;margin:18px 0 5px;color:#e62c2c;text-transform:uppercase;letter-spacing:.03em}
    h2 .count{color:#999;font-weight:400}
    table{width:100%;border-collapse:collapse;margin-top:2px}
    th,td{border:1px solid #d5d5d5;padding:6px 8px;text-align:left;font-size:12px}
    td.r,th.r{text-align:right}td.c,th.c{text-align:center}
    th{background:#111;color:#fff;font-weight:600;text-transform:uppercase;font-size:10px}
    tr:nth-child(even) td{background:#fafafa}
    .foot{margin-top:18px;font-size:11px;color:#666;text-align:center;border-top:1px solid #eee;padding-top:12px}
    @media print{body{padding:22px}h2{page-break-after:avoid}table{page-break-inside:auto}tr{page-break-inside:avoid}}
  </style></head><body>
  <div class="top">
    <div><h1>Homes for sale nearby</h1>
    <p class="sub">${total} active listing${total === 1 ? "" : "s"} around ${subjectAddress || "this listing"} · within ~${radius} mi · grouped by beds/baths</p></div>
    <div class="brand">
      <img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"/>
      <div class="contact"><strong>${site.phone}</strong><br/>NMLS #${site.companyNmls} · ${site.website.replace(/^https?:\/\//, "")}</div>
    </div>
  </div>
  ${sections || "<p>No nearby active listings found.</p>"}
  <p class="foot">Data from the MLS and may not reflect the latest status — verify before relying on it. Want the monthly payment on any of these for a buyer? Ask ${site.company} · ${site.phone} · ${site.website.replace(/^https?:\/\//, "")}</p>
  </body></html>`;
}

function printWindow(html: string) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    w.print();
  };
  const imgs = Array.from(w.document.images);
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) {
    setTimeout(go, 150);
  } else {
    let left = pending.length;
    const tick = () => {
      left -= 1;
      if (left <= 0) setTimeout(go, 50);
    };
    pending.forEach((img) => {
      img.addEventListener("load", tick);
      img.addEventListener("error", tick);
    });
    setTimeout(go, 2000);
  }
}

export function NearbyListingsTool() {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const ready = location.trim().length >= 3;

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: location.trim(), radius_miles: radius }),
      });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, error: "Couldn't reach the listing service." });
    } finally {
      setLoading(false);
    }
  }

  const groups = result && result.ok ? groupListings(result.listings) : [];
  const hasLive = result?.ok && result.listings.length > 0;

  return (
    <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Listing address or area — e.g. 123 Main St, Long Beach, CA 90804"
          className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm text-ink-900 outline-none placeholder:text-muted focus:border-crush-400 focus:ring-2 focus:ring-crush-100"
        />
        <div className="flex gap-3">
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            aria-label="Search radius"
            className="cursor-pointer rounded-full border border-border bg-white px-4 py-3 text-sm font-medium text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100"
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r} mi
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !ready}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching…" : "Find homes"}
          </button>
        </div>
      </form>

      {/* Live results */}
      {hasLive && result?.ok && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {result.listings.length} active listing
              {result.listings.length === 1 ? "" : "s"} within ~
              {result.radius_miles} mi
              {result.approximate ? " (area estimate)" : ""}
            </p>
            <button
              type="button"
              onClick={() =>
                printWindow(
                  buildPrintHtml(
                    [result.subject.street, result.subject.city]
                      .filter(Boolean)
                      .join(", "),
                    result.radius_miles,
                    result.listings.length,
                    groups,
                  ),
                )
              }
              className="inline-flex items-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 9V3h8v6M6 15h8v3H6zM4 9h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
              </svg>
              Print all on one page
            </button>
          </div>
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
                            {[l.city, l.state, l.zip].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {specLine(l) && (
                          <p className="mt-2 text-xs text-muted">{specLine(l)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty / error state */}
      {result && !hasLive && (
        <p className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
          {result.ok
            ? "No active listings came back for that area. Try a wider radius, or check the address/ZIP."
            : result.error ||
              "The MLS feed isn't returning results yet — make sure the CRMLS RESO credentials are set."}
        </p>
      )}
    </div>
  );
}
