/**
 * programArtworkHtml.ts — a designed flyer, co-branded to the agent.
 *
 * The artwork is Crush Mortgage's own print flyer, laid down full-bleed. The
 * only thing this adds is the agent's block, placed in the panel the design
 * already leaves for it (see programArtwork.ts for how those were measured).
 *
 * The page is sized to the ARTWORK's aspect ratio rather than forced to
 * Letter. The sheets are not all 8.5×11 — the self-employed HELOC is 2:3 — and
 * forcing them to a common page either crops a flyer or letterboxes it. Sizing
 * the page to the art means it prints edge to edge, whatever it was designed
 * at.
 *
 * Everything is positioned in percentages, so the same numbers hold at any
 * output resolution and survive the artwork being re-exported larger.
 */

import { esc } from "@/lib/printBranding";
import { site } from "@/lib/site";
import type { Profile } from "@/lib/profile";
import { fullName } from "@/lib/profile";
import type { ProgramArtwork, Rect } from "@/lib/programArtwork";

const pct = (r: Rect) =>
  `left:${r.left}%;top:${r.top}%;width:${r.width}%;height:${r.height}%`;

/**
 * The agent's block.
 *
 * Auto-fits rather than assuming a size: these panels run from 8% to 17% of
 * the page height, and one type scale cannot serve both. The block is laid out
 * with the type sized in `cqh` units — a percentage of the panel's own height
 * — so the same markup fills a tall panel and a short one.
 *
 * Placeholders rather than blanks when the profile is empty. An agent who
 * prints before filling in their profile should see what is missing on the
 * page, not wonder why the corner of the flyer is bare.
 */
function agentBlockHtml(profile: Profile | null | undefined): string {
  const name = fullName(profile) || "Your name here";
  const brokerage = profile?.brokerage || "Your brokerage";
  const dre = profile?.dre_license ? `DRE #${esc(profile.dre_license)}` : "";
  const phone = profile?.phone || "Add your phone";
  const email = profile?.email || "";
  const headshot = profile?.headshot_url || "";
  const logo = profile?.brokerage_logo_url || profile?.team_logo_url || "";
  const sub = [esc(brokerage), dre].filter(Boolean).join(" · ");

  // Content only — the positioned `.agent` wrapper is the query container.
  return `${headshot ? `<img class="a-head" src="${esc(headshot)}" alt="">` : ""}
    <div class="a-txt">
      <div class="a-name">${esc(name)}</div>
      <div class="a-sub">${sub}</div>
      <div class="a-phone">${esc(phone)}</div>
      ${email ? `<div class="a-mail">${esc(email)}</div>` : ""}
    </div>
    ${!headshot && logo ? `<img class="a-logo" src="${esc(logo)}" alt="">` : ""}`;
}

export function programArtworkFlyerHtml(
  art: ProgramArtwork,
  programName: string,
  profile: Profile | null | undefined,
  origin: string,
): string {
  const src = `${origin}${art.src}`;

  const covers = (art.cover ?? [])
    .map((c) => `<div class="cover" style="${pct(c)};background:${c.fill}"></div>`)
    .join("");

  /*
    Deliberately carries NO NMLS number.
    Every one of these sheets already prints the company's NMLS and DRE in its
    own header, and the value in site.ts does not match what the artwork says.
    Printing ours underneath would put two different "Company NMLS" numbers on
    one page, which is worse than printing none — the artwork's own line is the
    one the compliance team signed off on. This strip only replaces the contact
    details that were painted out.
  */
  const strip = art.lenderStrip
    ? `<div class="strip" style="${pct(art.lenderStrip)};background:${art.lenderStrip.fill};color:${art.lenderStrip.color}">
         Financing by <b>${esc(site.company)}</b> · ${esc(site.website)} ·
         Equal Housing Lender. Not a commitment to lend.
       </div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>${esc(programName)} — ${esc(site.company)}</title>
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{margin:0;padding:0;background:#fff}
  /* The page IS the artwork's aspect ratio — see the note at the top. */
  @page{size:${art.w}px ${art.h}px;margin:0}
  .sheet{position:relative;width:${art.w}px;height:${art.h}px;overflow:hidden}
  .art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
  .cover{position:absolute}
  .strip{position:absolute;display:flex;align-items:center;justify-content:center;
    text-align:center;padding:0 3%;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    font-size:1.05vh;line-height:1.35}
  .strip b{color:#fff}

  /* The agent block. Type is sized against the panel's own height (cqh) so one
     layout fills panels from 8% to 17% of the page. */
  .agent{position:absolute;container-type:size;display:flex;align-items:center;
    gap:4%;padding:2.5% 3.5%;
    font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16181d}
  .a-head{height:86cqh;width:auto;aspect-ratio:1/1.12;object-fit:cover;
    object-position:top center;border-radius:6px;flex-shrink:0}
  .a-logo{max-height:60cqh;max-width:30%;object-fit:contain;flex-shrink:0}
  .a-txt{min-width:0;flex:1}
  .a-name{font-size:26cqh;font-weight:800;line-height:1.05;letter-spacing:-.01em}
  .a-sub{font-size:14cqh;color:#3c414b;margin-top:3cqh;line-height:1.2}
  .a-phone{display:inline-block;background:#e11b22;color:#fff;font-weight:800;
    font-size:19cqh;line-height:1;padding:6cqh 10cqh;margin-top:8cqh;
    clip-path:polygon(0 0,100% 0,96% 100%,0 100%)}
  .a-mail{font-size:13.5cqh;color:#16181d;margin-top:6cqh;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

  @media print{html,body{width:${art.w}px;height:${art.h}px}}
</style></head><body>
<div class="sheet">
  <img class="art" src="${esc(src)}" alt="${esc(programName)}">
  ${covers}
  ${strip}
  <div class="agent" style="${pct(art.agent)}">${agentBlockHtml(profile)}</div>
</div>
</body></html>`;
}
