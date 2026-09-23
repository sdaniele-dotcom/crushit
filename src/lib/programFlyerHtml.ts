/**
 * programFlyerHtml.ts — the co-branded specialty program flyer.
 *
 * Follows the printed Self-Employed FHA Special flyer: a dark hero with the
 * Crush mark on a white angled panel, the program name on a red angled banner,
 * a checklist of features, a dark "perfect for" panel, a two-line pitch, and
 * the contact block bottom-right.
 *
 * ONE thing is deliberately different from that printed sheet. The contact
 * block carries the AGENT, not the loan officer: this is the agent's handout,
 * given to their buyer, and their name and face belong on it. Crush Mortgage
 * stays on it as the lender — logo, company NMLS, and the disclosure line —
 * because a flyer that advertises loan terms has to say who is doing the
 * lending, and that is never the real estate agent.
 *
 * Kept out of the React component on purpose: a printable that can only be
 * produced by clicking a button can only be checked by clicking a button. As a
 * pure function it renders headless and gets measured.
 */

import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { esc } from "@/lib/printBranding";
import { site } from "@/lib/site";
import type { Profile } from "@/lib/profile";
import { fullName } from "@/lib/profile";
import { PROGRAM_DISCLAIMER, type ProgramFlyer } from "@/lib/programFlyers";

const CSS = `
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    color:#16181d;font-size:10.5pt;line-height:1.45;background:#fff}
  .sheet{width:8.5in;min-height:11in;display:flex;flex-direction:column}

  /* ── Hero ─────────────────────────────────────────────────────────────
     No photograph. The printed original uses a stock image we do not hold a
     licence to redistribute, and a co-branded handout is redistribution. The
     brand gradient carries the same weight behind the same angled shapes. */
  .hero{position:relative;height:2.35in;background:
      radial-gradient(120% 140% at 82% 12%, #4a1116 0%, rgba(74,17,22,0) 55%),
      linear-gradient(135deg,#1b1d22 0%,#26292f 48%,#141519 100%);
    overflow:hidden}
  .hero:after{content:"";position:absolute;inset:auto -10% -38% 40%;height:70%;
    background:linear-gradient(120deg,rgba(225,27,34,.22),rgba(225,27,34,0));
    transform:rotate(-8deg)}
  .nmls{position:absolute;top:22px;left:30px;color:#fff;font-weight:800;
    font-size:15pt;letter-spacing:.4px;z-index:3}
  .logoPanel{position:absolute;top:0;right:0;background:#fff;padding:16px 30px 16px 46px;
    clip-path:polygon(9% 0,100% 0,100% 100%,0 100%);z-index:3}
  .logoPanel img{height:52px;display:block;object-fit:contain}
  .titleBar{position:absolute;left:0;bottom:26px;background:#e11b22;
    padding:13px 74px 13px 30px;clip-path:polygon(0 0,100% 0,88% 100%,0 100%);z-index:3;
    box-shadow:0 8px 20px rgba(0,0,0,.28)}
  .titleBar h1{margin:0;color:#fff;font-size:27pt;font-weight:800;line-height:1.05;
    letter-spacing:-.4px;text-transform:uppercase;font-style:italic;max-width:5.1in}

  /* ── Body grid ─────────────────────────────────────────────────────
     The checklist SPREADS to fill its column rather than stacking at the top.
     Programs carry four to eight features, so a fixed line gap leaves either a
     half-empty column or an overflowing one depending on the program; letting
     the list distribute itself means every flyer fills the page the same way.
     This is why the lines are spaced by justify-content and not by margin. */
  .grid{flex:1;display:flex;gap:0;align-items:stretch}
  .left{width:56%;padding:26px 22px 20px 30px;display:flex;flex-direction:column}
  .right{width:44%;display:flex;flex-direction:column}

  ul{margin:0;padding:0;list-style:none}
  .feat{flex:1;display:flex;flex-direction:column;justify-content:space-evenly}
  .feat li{position:relative;padding-left:32px;margin:0;font-size:12.5pt;line-height:1.32}
  .feat li:before{content:"";position:absolute;left:4px;top:4px;width:12px;height:6px;
    border-left:3px solid #2e7d32;border-bottom:3px solid #2e7d32;transform:rotate(-45deg)}
  .feat b{font-weight:800}

  .panel{background:#16181d;color:#fff;padding:22px 22px 24px}
  .panel .kicker{color:#e11b22;font-weight:800;font-size:9.5pt;letter-spacing:1.4px;
    text-transform:uppercase;margin:0 0 4px}
  .panel h2{margin:0 0 12px;font-size:15pt;line-height:1.15;font-weight:800;
    text-transform:uppercase;letter-spacing:-.2px}
  .panel li{position:relative;padding-left:26px;margin:0 0 11px;font-size:11pt;line-height:1.3}
  .panel li:before{content:"";position:absolute;left:3px;top:4px;width:11px;height:5px;
    border-left:2.5px solid #c8a951;border-bottom:2.5px solid #c8a951;transform:rotate(-45deg)}
  .panel .sentence{font-size:11pt;line-height:1.45;color:#e8e9ea;margin:0}
  .panel .sentence.lg{font-size:13pt;line-height:1.38;color:#fff;font-weight:600}

  .pitch{padding:14px 22px 12px;background:#fff}
  .pitch .p1{font-size:13.5pt;font-weight:800;line-height:1.2}
  .pitch .p2{font-size:13.5pt;font-weight:800;line-height:1.2;color:#e11b22;margin-top:2px}

  /* ── Bottom row ──────────────────────────────────────────────────── */
  .bottom{display:flex;align-items:stretch;margin-top:auto}
  .why{width:56%;background:#16181d;color:#fff;padding:18px 22px 18px 30px}
  .why.wide{width:100%}
  .why h3{margin:0 0 11px;font-size:12.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.3px}
  .why h3 span{color:#e11b22}
  .why li{position:relative;padding-left:26px;margin:0 0 9px;font-size:11pt;line-height:1.3}
  .why li:before{content:"";position:absolute;left:3px;top:4px;width:11px;height:5px;
    border-left:2.5px solid #c8a951;border-bottom:2.5px solid #c8a951;transform:rotate(-45deg)}
  /* The pitch, when it has moved down to fill the band — see programFlyerHtml. */
  .why.pitchdown{display:flex;flex-direction:column;justify-content:center}
  .why.pitchdown .p1{font-size:16pt;font-weight:800;line-height:1.2;color:#fff}
  .why.pitchdown .p2{font-size:16pt;font-weight:800;line-height:1.2;color:#ff5a60;margin-top:3px}

  .card{width:44%;background:#fff;padding:16px 22px 14px;display:flex;gap:12px;
    align-items:flex-end;border-top:1px solid #e4e5e8}
  .card.full{width:100%;border-top:0}
  .card-txt{flex:1;min-width:0}
  .card-name{font-size:15pt;font-weight:800;line-height:1.1}
  .card-role{font-size:10pt;color:#3c414b;margin-top:1px}
  .card-phone{display:inline-block;background:#e11b22;color:#fff;font-weight:800;
    font-size:13pt;padding:6px 16px;margin:9px 0 7px;
    clip-path:polygon(0 0,100% 0,96% 100%,0 100%)}
  .card-line{font-size:9.5pt;color:#16181d;margin-top:3px;word-break:break-word}
  .card-head{width:1.18in;height:1.42in;object-fit:cover;object-position:top center;
    border-radius:4px;flex-shrink:0}
  .card-logo{max-width:1.18in;max-height:.6in;object-fit:contain;flex-shrink:0}

  .foot{background:#0f1013;color:#9a9ea6;font-size:6.8pt;line-height:1.4;
    padding:7px 30px 8px;text-align:center}
  .foot b{color:#d7d9dc}

  @page{size:letter;margin:0}
  @media print{.sheet{min-height:0}}
`;

function head(title: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>${CSS}</style></head><body>`;
}

/**
 * The agent's block, bottom right.
 *
 * Falls back to placeholder text rather than collapsing, because an agent who
 * prints this before filling in their profile should see what is missing on
 * the page instead of wondering why the corner is empty.
 */
function agentCardHtml(profile: Profile | null | undefined, full = false): string {
  const name = fullName(profile) || "Your name here";
  const role = profile?.brokerage || "Your brokerage";
  const dre = profile?.dre_license ? ` · DRE #${esc(profile.dre_license)}` : "";
  const phone = profile?.phone || "Add your phone in your profile";
  const email = profile?.email || "";
  const web = profile?.website || "";
  const head = profile?.headshot_url || "";
  const logo = profile?.brokerage_logo_url || profile?.team_logo_url || "";

  return `<div class="card${full ? " full" : ""}">
    <div class="card-txt">
      <div class="card-name">${esc(name)}</div>
      <div class="card-role">${esc(role)}${dre}</div>
      <div class="card-phone">${esc(phone)}</div>
      ${email ? `<div class="card-line">${esc(email)}</div>` : ""}
      ${web ? `<div class="card-line">${esc(web)}</div>` : ""}
    </div>
    ${head
      ? `<img class="card-head" src="${esc(head)}" alt="">`
      : logo
        ? `<img class="card-logo" src="${esc(logo)}" alt="">`
        : ""}
  </div>`;
}

/**
 * The lender disclosure strip.
 *
 * Not optional and not decorative. The sheet advertises rates, down payments
 * and credit minimums, which makes it an advertisement for a mortgage however
 * it is handed over — so it names the lender, the company NMLS and Equal
 * Housing, and says it is not a commitment to lend. The agent's name being the
 * prominent one on the page is exactly why this line has to be here.
 */
function footerHtml(): string {
  return `<div class="foot">
    <b>Financing by ${esc(site.company)}</b> · Company NMLS #${esc(site.companyNmls)} ·
    ${esc(site.phone)} · ${esc(site.website)} · Equal Housing Opportunity.<br>
    ${esc(PROGRAM_DISCLAIMER)} Information deemed reliable but not guaranteed.
  </div>`;
}

/** One specialty program, one page. */
export function programFlyerHtml(
  program: ProgramFlyer,
  profile: Profile | null | undefined,
): string {
  const pitch = program.pitch ?? null;
  const why = program.whyItWorks ?? null;

  // The dark panel always says something: the written bullets when a program
  // has them, otherwise the one-line "best for" carried at heading size. An
  // empty panel, or a filler heading like "THIS PROGRAM:", reads as a design
  // mistake rather than as copy nobody has written yet.
  const perfectBody = program.perfectFor?.length
    ? `${program.perfectForLabel ? `<h2>${esc(program.perfectForLabel)}</h2>` : ""}
       <ul>${program.perfectFor.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
    : program.bestFor
      ? `<p class="sentence lg">${esc(program.bestFor)}</p>`
      : "";

  /*
    Where the pitch line goes.
    With a "why this works" list, the bottom band is that list and the pitch
    sits under the panel as on the printed sheet. Without one, the band would
    be a white half-page with a contact block adrift in it — so the pitch moves
    down to fill it, and the flyer still ends on a dark bar.
  */
  const pitchLine = `<div class="p1">${esc(pitch ? pitch[0] : program.tagline)}</div>
    ${pitch ? `<div class="p2">${esc(pitch[1])}</div>` : ""}`;

  return `${head(`${program.name} — ${site.company}`)}
<div class="sheet">
  <div class="hero">
    <div class="nmls">NMLS# ${esc(site.companyNmls)}</div>
    <div class="logoPanel"><img src="${crushLogoPrimaryDataUri}" alt="${esc(site.company)}"></div>
    <div class="titleBar"><h1>${esc(program.name)}</h1></div>
  </div>

  <div class="grid">
    <div class="left">
      <ul class="feat">${program.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    </div>
    <div class="right">
      <div class="panel">
        <p class="kicker">Perfect for</p>
        ${perfectBody}
      </div>
      ${why?.length ? `<div class="pitch">${pitchLine}</div>` : ""}
    </div>
  </div>

  <div class="bottom">
    ${why?.length
      ? `<div class="why">
          <h3>Why this program <span>works:</span></h3>
          <ul>${why.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        </div>`
      : `<div class="why pitchdown">${pitchLine}</div>`}
    ${agentCardHtml(profile)}
  </div>

  ${footerHtml()}
</div>
</body></html>`;
}
