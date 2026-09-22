/**
 * programFlyerHtml.ts — the co-branded program flyer as a string.
 *
 * Kept out of the React component on purpose: a printable that can only be
 * produced by clicking a button in a browser can only be checked by clicking
 * a button in a browser. As a pure function it can be rendered headless and
 * measured, which is how the condo guide's page count was pinned down and how
 * this one's is too.
 *
 * Branding hierarchy is lib/printBranding's: the agent is primary at the top,
 * Crush Mortgage is the financing partner at the bottom.
 */

import { realtorBrandHtml, crushFooterHtml, brandingCss, esc } from "@/lib/printBranding";
import { site } from "@/lib/site";
import type { Profile } from "@/lib/profile";
import {
  moreProgramsSheet,
  PROGRAM_DISCLAIMER,
  type ProgramFlyer,
} from "@/lib/programFlyers";

const SHARED_CSS = `
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16181d;
    padding:0.5in 0.5in 0.9in;font-size:10.5pt;line-height:1.5}
  h1{font-family:'Poppins',Arial,sans-serif;font-size:28pt;margin:16px 0 2px;letter-spacing:-.8px}
  .sub{color:#e11b22;font-size:12.5pt;font-weight:600;margin:0 0 2px}
  h2{font-family:'Poppins',Arial,sans-serif;font-size:10pt;text-transform:uppercase;letter-spacing:1.6px;
    color:#62666e;margin:18px 0 7px;page-break-after:avoid}
  .lead{margin:0 0 8px;color:#3c414b}
  .stats{display:flex;gap:10px;margin:14px 0 0}
  .stat{flex:1;border:1px solid #e4e5e8;border-radius:8px;padding:10px 14px;background:#fafafa}
  .stat-v{font-family:'Poppins',Arial,sans-serif;font-size:19pt;font-weight:800;color:#e11b22;line-height:1.1}
  .stat-l{font-size:7.5pt;text-transform:uppercase;letter-spacing:1.2px;color:#62666e;margin-top:3px}
  .badge{display:inline-block;background:#e11b22;color:#fff;font-weight:700;font-size:10pt;
    border-radius:999px;padding:5px 15px;margin-top:12px}
  ul{margin:0;padding-left:0;list-style:none}
  li{margin:7px 0;padding-left:22px;position:relative;page-break-inside:avoid}
  li:before{content:"";position:absolute;left:2px;top:6px;width:10px;height:5px;
    border-left:2.5px solid #e11b22;border-bottom:2.5px solid #e11b22;transform:rotate(-45deg)}
  .watch{margin-top:16px;padding:11px 14px;background:#fef2f2;border-left:3px solid #e11b22;
    border-radius:4px;font-size:10pt}
  .cta{margin-top:18px;padding:13px 16px;border:1px solid #e4e5e8;border-radius:8px;
    background:#fafafa;page-break-inside:avoid}
  .cta-h{font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:11.5pt}
  .cta-b{font-size:9.5pt;color:#3c414b;margin-top:3px}
  .more{display:flex;flex-wrap:wrap;gap:9px;margin-top:4px}
  .mi{width:calc(50% - 5px);border:1px solid #e4e5e8;border-radius:6px;padding:9px 11px;
    page-break-inside:avoid}
  .mi-n{font-weight:700;font-size:10pt}
  .mi-d{font-size:9pt;color:#3c414b;margin-top:2px;line-height:1.45}
  .disc{margin-top:14px;font-size:8pt;color:#62666e;line-height:1.5}
  @media print{body{padding:0.4in 0.45in 0.85in}h2{page-break-after:avoid}}

  /*
    Single-program flyers run larger.
    A program has four to seven highlights, which at the base size leaves a
    third of the page blank under the CTA — a handout that looks like it ran
    out of things to say. The "more programs" sheet carries ten items and is
    already near the bottom, so it keeps the base size; the difference is one
    body class rather than two stylesheets.

    The ceiling is real and close. Rendering all eighteen in headless Chromium
    at Letter size puts the tallest core flyer at 941px against ~950px of
    usable height before the fixed footer. Adding a fifth highlight to a core
    program, or loosening anything below, needs that render repeated — the
    overflow would not be visible from the code, and a flyer that silently
    becomes two pages is one an agent prints and throws away.
  */
  body.p1{font-size:12pt;line-height:1.62}
  .p1 h1{font-size:34pt;margin-top:18px}
  .p1 .sub{font-size:14.5pt}
  .p1 h2{font-size:10.5pt;margin:24px 0 9px}
  .p1 .stat{padding:14px 18px}
  .p1 .stat-v{font-size:25pt}
  .p1 .stat-l{font-size:8pt}
  .p1 li{margin:11px 0;font-size:11.5pt;padding-left:26px}
  .p1 li:before{top:7px;width:12px;height:6px}
  .p1 .watch{margin-top:20px;padding:14px 17px;font-size:11pt}
  .p1 .cta{margin-top:20px;padding:16px 18px}
  .p1 .cta-h{font-size:12.5pt}
  .p1 .cta-b{font-size:10.5pt}
`;

function head(title: string, bodyClass = ""): string {
  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
<style>${brandingCss}${SHARED_CSS}</style></head><body class="${bodyClass}">`;
}

function ctaHtml(): string {
  return `<div class="cta">
    <div class="cta-h">Think this fits your buyer?</div>
    <div class="cta-b">Send them over for a no-pressure conversation and a same-day pre-approval —
      ${esc(site.phone)} · ${esc(site.email)}<br>${esc(site.applyUrl)}</div>
  </div>`;
}

/** One program, one page. */
export function programFlyerHtml(
  program: ProgramFlyer,
  profile: Profile | null | undefined,
): string {
  // Only the stats a program actually has. A core program shows minimum down
  // and credit; a specialty one shows its badge instead. An empty box labelled
  // "Min credit" reads as "no minimum", which is not what a blank means.
  const stats = [
    program.minDown ? (["Min down", program.minDown] as const) : null,
    program.minCredit ? (["Min credit", program.minCredit] as const) : null,
  ].filter(Boolean) as readonly (readonly [string, string])[];

  return `${head(`${program.name} — Crush Mortgage`, "p1")}
  ${realtorBrandHtml(profile)}

  <h1>${esc(program.name)}</h1>
  <p class="sub">${esc(program.tagline)}</p>
  ${program.badge ? `<div class="badge">${esc(program.badge)}</div>` : ""}

  ${stats.length
    ? `<div class="stats">${stats
        .map(([l, v]) => `<div class="stat"><div class="stat-v">${esc(v)}</div><div class="stat-l">${esc(l)}</div></div>`)
        .join("")}</div>`
    : ""}

  ${program.bestFor ? `<h2>Best for</h2><p class="lead">${esc(program.bestFor)}</p>` : ""}

  <h2>What it does</h2>
  <ul>${program.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>

  ${program.watchOut
    ? `<div class="watch"><strong>Watch out:</strong> ${esc(program.watchOut)}</div>`
    : ""}

  ${ctaHtml()}

  <p class="disc">${esc(PROGRAM_DISCLAIMER)}</p>

  ${crushFooterHtml()}
</body></html>`;
}

/** The remaining programs as one sheet — see moreProgramsSheet for why. */
export function moreProgramsFlyerHtml(profile: Profile | null | undefined): string {
  return `${head("More programs — Crush Mortgage")}
  ${realtorBrandHtml(profile)}

  <h1>${esc(moreProgramsSheet.title)}</h1>
  <p class="sub">Programs most lenders don&rsquo;t offer</p>
  <p class="lead" style="margin-top:10px">${esc(moreProgramsSheet.intro)}</p>

  <h2>What we can place</h2>
  <div class="more">${moreProgramsSheet.items
    .map(
      (i) => `<div class="mi"><div class="mi-n">${esc(i.name)}</div><div class="mi-d">${esc(i.description)}</div></div>`,
    )
    .join("")}</div>

  ${ctaHtml()}

  <p class="disc">${esc(PROGRAM_DISCLAIMER)}</p>

  ${crushFooterHtml()}
</body></html>`;
}
