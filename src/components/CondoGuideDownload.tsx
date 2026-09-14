"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { recordUse } from "@/lib/rewards";
import { realtorBrandHtml, crushFooterHtml, brandingCss, esc } from "@/lib/printBranding";
import { site } from "@/lib/site";
import { team } from "@/lib/data";
import {
  TIMELINE,
  REVIEW_DOCS,
  RESERVE_MATH,
  DISQUALIFIERS,
  STILL_EASIER,
  CALIFORNIA,
  IF_IT_FAILS,
  CHECKLIST,
  MISREADS,
  SOURCE_NOTE,
  type Section,
} from "@/lib/condoGuide";

/**
 * Builds and prints the co-branded condo guide.
 *
 * Client-side because co-branding needs the logged-in agent's actual profile
 * OBJECT (headshot and brokerage logo are images, which the [TOKEN] substitution
 * in PrintButton can't supply) — hence its own print path rather than reusing
 * PrintButton.
 *
 * Branding hierarchy follows lib/printBranding.ts: the agent is primary at the
 * top, the Crush team and the Crush mark sit at the bottom as the financing
 * partner.
 */
export function CondoGuideDownload({ className = "" }: { className?: string }) {
  const { profile } = useAuth();

  function sectionHtml(s: Section): string {
    return `
      <h2>${esc(s.heading)}</h2>
      ${s.intro ? `<p class="lead">${esc(s.intro)}</p>` : ""}
      <ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  }

  /** Crush team block — absolute photo URLs so they resolve in the print window. */
  function crushTeamHtml(): string {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `
      <h2>Your Crush Mortgage team</h2>
      <p class="lead">Send us an address and we'll check the project before you list it — no cost, no obligation.</p>
      <div class="team">
        ${team
          .map((m) => {
            const src = typeof m.photo === "object" && m.photo ? `${origin}${m.photo.src}` : "";
            return `<div class="tm">
              ${src ? `<img class="tm-img" src="${esc(src)}" alt="" onerror="this.style.display='none'">` : ""}
              <div>
                <div class="tm-name">${esc(m.name)}</div>
                <div class="tm-role">${esc(m.role)}${m.nmls ? ` · NMLS #${esc(m.nmls)}` : ""}</div>
                <div class="tm-c">${esc(m.phone || site.phone)}<br>${esc(m.email || site.email)}</div>
              </div>
            </div>`;
          })
          .join("")}
      </div>`;
  }

  function build(): string {
    return `<!doctype html><html><head><meta charset="utf-8"/>
<title>The 2026 Condo Rules</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16181d;
    padding:0.5in 0.5in 0.85in;font-size:10.5pt;line-height:1.5}
  ${brandingCss}
  h1{font-family:'Poppins',Arial,sans-serif;font-size:24pt;margin:14px 0 2px;letter-spacing:-.6px}
  .sub{color:#62666e;font-size:11pt;margin:0 0 4px}
  .tldr{margin:12px 0 0;padding:11px 14px;background:#fef2f2;border-left:3px solid #e11b22;border-radius:4px;font-size:10.5pt}
  h2{font-family:'Poppins',Arial,sans-serif;font-size:10.5pt;text-transform:uppercase;letter-spacing:1.6px;
    color:#62666e;margin:17px 0 6px;page-break-after:avoid}
  .lead{margin:0 0 7px;color:#3c414b;font-size:10pt}
  table{width:100%;border-collapse:collapse}
  td{padding:6px 10px 6px 0;vertical-align:top;border-bottom:1px solid #e4e5e8;font-size:10pt}
  td.d{white-space:nowrap;font-weight:700;width:1.35in}
  td.t{font-weight:700;width:1.9in}
  ul{margin:0;padding-left:17px}
  li{margin:3.5px 0;font-size:10pt}
  .q{font-weight:700;margin:9px 0 1px;font-size:10pt}
  .a{margin:0 0 7px;color:#3c414b;font-size:10pt}
  .team{display:flex;flex-wrap:wrap;gap:10px}
  .tm{display:flex;gap:9px;align-items:center;width:calc(50% - 5px);border:1px solid #e4e5e8;
    border-radius:6px;padding:8px 10px;page-break-inside:avoid}
  .tm-img{width:42px;height:42px;border-radius:6px;object-fit:cover;flex-shrink:0}
  .tm-name{font-weight:700;font-size:10pt}
  .tm-role{font-size:8pt;color:#62666e;margin-top:1px}
  .tm-c{font-size:8.5pt;color:#3c414b;margin-top:3px;line-height:1.4}
  .src{margin-top:11px;font-size:8pt;color:#62666e;line-height:1.5}
  @media print{body{padding:0.4in 0.45in 0.8in}h2{page-break-after:avoid}li{page-break-inside:avoid}}
</style></head><body>
  ${realtorBrandHtml(profile)}

  <h1>The 2026 condo rules</h1>
  <p class="sub">What changed, what a full review now asks for, and what to check before you take the listing.</p>

  <p class="tldr"><strong>Since August 3, 2026</strong>, most established condo projects need a
  <strong>full project review</strong> — Limited Review is retired. On <strong>January 4, 2027</strong>,
  minimum reserves rise from <strong>10% to 15%</strong> of the association's annual budgeted assessment
  income. HOA questionnaires, budgets and reserve studies are gating documents now, not paperwork.</p>

  <h2>What changed and when</h2>
  <table>${TIMELINE.map(
    (t) => `<tr><td class="d">${esc(t.date)}</td><td class="t">${esc(t.title)}</td><td>${esc(t.body)}</td></tr>`,
  ).join("")}</table>

  ${sectionHtml(REVIEW_DOCS)}
  ${sectionHtml(RESERVE_MATH)}
  ${sectionHtml(DISQUALIFIERS)}
  ${sectionHtml(STILL_EASIER)}
  ${sectionHtml(CALIFORNIA)}
  ${sectionHtml(IF_IT_FAILS)}

  <h2>Ask the HOA before you list</h2>
  <ul>${CHECKLIST.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>

  <h2>What people get wrong</h2>
  ${MISREADS.map(([q, a]) => `<p class="q">${esc(q)}</p><p class="a">${esc(a)}</p>`).join("")}

  ${crushTeamHtml()}

  <p class="src">${esc(SOURCE_NOTE)}</p>

  ${crushFooterHtml()}
</body></html>`;
  }

  function download() {
    void recordUse("condo_guide", { events: ["guide_downloaded"] });
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    w.document.write(build());
    w.document.close();
    w.focus();

    // Wait for the headshots/logos before printing, with a safety timeout so it
    // never hangs on an image that won't load.
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      w.print();
    };
    const pending = Array.from(w.document.images).filter((img) => !img.complete);
    if (pending.length === 0) {
      setTimeout(go, 150);
    } else {
      let left = pending.length;
      const tick = () => {
        left -= 1;
        if (left <= 0) setTimeout(go, 60);
      };
      pending.forEach((img) => {
        img.addEventListener("load", tick);
        img.addEventListener("error", tick);
      });
      setTimeout(go, 2500);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={download}
        className="inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
      >
        Download the co-branded guide
      </button>
      {!profile && (
        <p className="mt-2 text-xs text-muted">
          Sign in first and it comes out with your name, headshot and brokerage logo on it.
        </p>
      )}
    </div>
  );
}
