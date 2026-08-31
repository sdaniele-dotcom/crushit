"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { fullName } from "@/lib/profile";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";
import { esc } from "@/lib/printBranding";

const RED = "#c8102e";
const cb = (label: string) => `<span class="cb"></span>${label}`;
const scale = `<span class="scale">${[1, 2, 3, 4, 5].map((n) => `<span class="cb"></span>${n}`).join("&nbsp;&nbsp;")}</span>`;

function html(agent: { name: string; contact: string; logo: string }, address: string): string {
  const details = ["Location", "Condition", "Layout", "Kitchen", "Bedrooms", "Outdoor space"];
  return `<!doctype html><html><head><meta charset="utf-8"><title>Open House Feedback</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page{size:letter;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;background:#fff}
    .page{width:8.5in;height:11in;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;overflow:hidden}
    .content{flex:1;padding:0.34in 0.5in 0}
    .toprule{height:3px;background:${RED};border-radius:2px}
    .agentlogo{display:block;margin:12px auto 0;max-height:0.52in;max-width:2.4in;width:auto;object-fit:contain}
    h1{font-family:'Poppins',Arial,sans-serif;font-weight:800;letter-spacing:6px;font-size:22pt;color:${RED};text-align:center;margin:12px 0 4px}
    .sub{text-align:center;font-size:9.5pt;color:#555;margin:0}
    .addr{text-align:center;font-size:10pt;font-weight:700;color:#111;margin:2px 0 0}
    .card{border:1px solid #dcdcdc;border-radius:10px;padding:11px 16px;margin-top:11px}
    .q{margin:8px 0}
    .q .lab{font-size:10pt;font-weight:700;color:#111}
    .ln{border-bottom:1px solid #c9c9c9;height:16px;margin-top:4px}
    .opts{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:6px;font-size:9.5pt;color:#222}
    .cb{display:inline-block;width:11px;height:11px;border:1.3px solid #9a9a9a;border-radius:2px;margin-right:6px;vertical-align:-1px}
    .scale{font-size:9.5pt;color:#222;font-weight:700}
    .two{display:flex;gap:20px}.two>div{flex:1}
    .two .col-r{border-left:1px solid #eee;padding-left:16px}
    .needs{font-family:'Poppins',Arial,sans-serif;font-weight:700;font-size:9.5pt;letter-spacing:1px;color:${RED};margin:0 0 5px}
    .drow{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #f0f0f0;font-size:9.5pt}
    .info td{padding:6px 8px 2px 0;font-size:9pt;color:#555}
    .info .ln{margin-top:2px}
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
    <div class="__bar"><span>Your feedback form is ready — print it or save as PDF.</span>
      <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:${RED};color:#fff;font-weight:700;font-size:13px;padding:7px 16px">Print / Save as PDF</button></div>
    <div class="page">
      <div class="content">
        <div class="toprule"></div>
        ${agent.logo ? `<img class="agentlogo" src="${esc(agent.logo)}" alt="">` : ""}
        <h1>OPEN HOUSE FEEDBACK</h1>
        <p class="sub">Your honest feedback helps us serve you better — thank you for visiting!</p>
        ${address ? `<p class="addr">${esc(address)}</p>` : ""}

        <div class="card">
          <div class="q"><span class="lab">Overall, how would you rate this home?</span>&nbsp;&nbsp;${scale}</div>
          <div class="q"><span class="lab">What did you like most?</span><div class="ln"></div></div>
          <div class="q"><span class="lab">What did you like least?</span><div class="ln"></div></div>
          <div class="q"><span class="lab">How do you feel about the asking price?</span>
            <div class="opts">${["Great value", "Priced right", "Slightly high", "Too high", "Not sure"].map(cb).join("")}</div></div>
        </div>

        <div class="card two">
          <div>
            <p class="needs">RATE THE DETAILS</p>
            ${details.map((d) => `<div class="drow"><span>${d}</span>${scale}</div>`).join("")}
          </div>
          <div class="col-r">
            <div class="q"><span class="lab">Would you consider making an offer?</span>
              <div class="opts">${["Yes", "Maybe", "No"].map(cb).join("")}</div></div>
            <div class="q"><span class="lab">If not, what&apos;s holding you back?</span>
              <div class="opts">${["Price", "Condition", "Location", "Layout", "Size", "Financing", "Another home", "Other"].map(cb).join("")}</div></div>
            <div class="q"><span class="lab">Are you working with an agent?</span>
              <div class="opts">${["Yes", "No"].map(cb).join("")}</div></div>
            <div class="q"><span class="lab">Pre-approved for financing?</span>
              <div class="opts">${["Yes", "Not yet — I'd like info"].map(cb).join("")}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="q"><span class="lab">Would you like more info about…</span>
            <div class="opts">${["This property", "Similar properties", "Mortgage / payment options", "None"].map(cb).join("")}</div></div>
          <table class="info" style="width:100%;border-collapse:collapse">
            <tr><td style="width:33%">Name</td><td style="width:33%">Phone</td><td>Email</td></tr>
            <tr><td><div class="ln"></div></td><td><div class="ln"></div></td><td><div class="ln"></div></td></tr>
          </table>
        </div>
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

export function OpenHouseFeedbackPrint({ className = "" }: { className?: string }) {
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
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      html(
        { name: fullName(profile), contact, logo: profile?.brokerage_logo_url || profile?.team_logo_url || "" },
        address,
      ),
    );
    w.document.close();
    w.focus();
  }
  return (
    <button type="button" onClick={print} className={className || "inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"}>
      Print feedback form
    </button>
  );
}
