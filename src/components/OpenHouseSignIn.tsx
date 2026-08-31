"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { fullName } from "@/lib/profile";
import { recordUse } from "@/lib/rewards";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";
import { esc } from "@/lib/printBranding";

const RED = "#c8102e";
const BLOCKS = 6;

const cb = (label: string) => `<span class="cb"></span>${label}`;

/** One guest sign-in block — left: contact + status, right: current needs. */
function block(): string {
  return `<div class="blk">
    <div class="col-l">
      <div class="fld"><span class="lab">Name:</span><span class="ln"></span></div>
      <div class="fld"><span class="lab">Phone:</span><span class="ln"></span></div>
      <div class="fld"><span class="lab">Email:</span><span class="ln"></span></div>
      <div class="fld"><span class="lab">Working with an agent?</span><span class="yn">${cb("Yes")}&nbsp;&nbsp;&nbsp;${cb("No")}</span></div>
      <div class="fld"><span class="lab">Looking for:</span><span class="ln"></span></div>
    </div>
    <div class="col-r">
      <p class="needs">CURRENT NEEDS</p>
      <div class="opt">${cb("Looking to buy now")}</div>
      <div class="opt">${cb("Plan to buy within a year")}</div>
      <div class="opt">${cb("Just browsing")}</div>
      <div class="opt">${cb("Interested in selling")}</div>
    </div>
  </div>`;
}

function sheetHtml(agent: {
  name: string;
  contact: string;
  logo: string;
}, address: string): string {
  const blocks = Array.from({ length: BLOCKS }).map(block).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Open House Sign-In</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page{size:letter;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;background:#fff}
    .page{width:8.5in;height:11in;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;overflow:hidden}
    .content{flex:1;padding:0.34in 0.5in 0}
    .toprule{height:3px;background:${RED};border-radius:2px}
    .agentlogo{display:block;margin:12px auto 0;max-height:0.52in;max-width:2.4in;width:auto;object-fit:contain}
    h1{font-family:'Poppins',Arial,sans-serif;font-weight:800;letter-spacing:8px;font-size:24pt;color:${RED};text-align:center;margin:12px 0 4px}
    .sub{text-align:center;font-size:9.5pt;color:#555;margin:0 0 4px}
    .addr{text-align:center;font-size:10pt;font-weight:700;color:#111;margin:2px 0 0}
    .blk{display:flex;gap:20px;border:1px solid #dcdcdc;border-radius:10px;padding:11px 16px;margin-top:11px}
    .col-l{flex:1.55}
    .col-r{flex:1;border-left:1px solid #eee;padding-left:16px}
    .fld{display:flex;align-items:flex-end;gap:8px;margin:3px 0}
    .fld .lab{font-size:9.5pt;color:#222;white-space:nowrap}
    .fld .ln{flex:1;border-bottom:1px solid #c9c9c9;height:15px}
    .fld .yn{font-size:9.5pt;color:#222}
    .needs{font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:9.5pt;letter-spacing:1px;color:${RED};margin:0 0 5px}
    .opt{font-size:9.5pt;color:#222;margin:5px 0}
    .cb{display:inline-block;width:11px;height:11px;border:1.3px solid #9a9a9a;border-radius:2px;margin-right:6px;vertical-align:-1px}
    .foot{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 0.5in;border-top:1px solid #e6e6e6}
    .foot .a-name{font-weight:800;font-size:11pt;color:#111}
    .foot .a-contact{font-size:8.5pt;color:#555;margin-top:2px}
    .foot .right{display:flex;flex-direction:column;align-items:flex-end;gap:5px;text-align:right}
    .foot .clogo{height:26px;object-fit:contain}
    .foot .cinfo{font-size:8pt;color:#555}
    .disc{display:flex;justify-content:space-between;gap:16px;background:#151515;color:#fff;padding:7px 0.5in;font-size:7pt}
    .disc span:last-child{color:#c9c9c9;text-align:right}
    .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:9px 16px;display:flex;gap:12px;justify-content:space-between;align-items:center;font-family:Arial,sans-serif;font-size:13px}
    @media print{.__bar{display:none}}
  </style></head>
  <body>
    <div class="__bar"><span>Your branded sign-in sheet is ready — print it or save as PDF.</span>
      <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:${RED};color:#fff;font-weight:700;font-size:13px;padding:7px 16px">Print / Save as PDF</button></div>
    <div class="page">
      <div class="content">
        <div class="toprule"></div>
        ${agent.logo ? `<img class="agentlogo" src="${esc(agent.logo)}" alt="">` : ""}
        <h1>PLEASE SIGN IN</h1>
        <p class="sub">Thanks for visiting! Please tell me a little about what you're looking for.</p>
        ${address ? `<p class="addr">${esc(address)}</p>` : ""}
        ${blocks}
      </div>
      <div class="foot">
        <div>
          <div class="a-name">${esc(agent.name || "Your Name")}</div>
          ${agent.contact ? `<div class="a-contact">${agent.contact}</div>` : ""}
        </div>
        <div class="right">
          <img class="clogo" src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage">
          <div class="cinfo">Company NMLS #${site.companyNmls}&nbsp;&nbsp;|&nbsp;&nbsp;${esc(site.phone)}&nbsp;&nbsp;|&nbsp;&nbsp;Equal Housing Opportunity</div>
        </div>
      </div>
      <div class="disc"><span>Crush Mortgage · Equal Housing Opportunity</span><span>This is not a commitment to lend. Information deemed reliable but not guaranteed.</span></div>
    </div>
  </body></html>`;
}

export function OpenHouseSignIn() {
  const { profile } = useAuth();
  const { listing } = useActiveListing();

  function print() {
    const address = listing ? [listing.address, listing.city, listing.state].filter(Boolean).join(", ") : "";
    const contact = [
      profile?.phone && esc(profile.phone),
      profile?.email && esc(profile.email),
      profile?.dre_license && `DRE #${esc(profile.dre_license)}`,
    ]
      .filter(Boolean)
      .join("&nbsp;&nbsp;|&nbsp;&nbsp;");
    const html = sheetHtml(
      {
        name: fullName(profile),
        contact,
        logo: profile?.brokerage_logo_url || profile?.team_logo_url || "",
      },
      address,
    );
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
