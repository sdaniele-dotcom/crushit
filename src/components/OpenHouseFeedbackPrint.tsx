"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { realtorBrandHtml, crushFooterHtml, brandingCss, esc } from "@/lib/printBranding";

const box = (label: string) => `<span class="ck">◻</span>${label}`;
const stars = `<span class="stars">1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;5</span>`;

function html(header: string, address: string): string {
  const cats = ["Location", "Condition", "Layout", "Kitchen", "Bedrooms", "Outdoor space"];
  return `<!doctype html><html><head><meta charset="utf-8"><title>Open House Feedback</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap" rel="stylesheet">
  <style>
    @page{size:letter;margin:0.5in 0.5in 0.9in}*{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;font-size:10pt}
    ${brandingCss}
    .hero{margin:14px 0 8px}
    .hero .k{font-family:'Poppins',Arial,sans-serif;font-weight:800;letter-spacing:3px;font-size:19pt;color:#e62c2c;margin:0}
    .hero .a{font-weight:600;font-size:11pt;margin:2px 0 0;color:#111}
    .q{margin:9px 0}
    .q .lab{font-weight:700;font-size:10pt}
    .stars{font-weight:700;letter-spacing:2px;color:#111}
    .line{border-bottom:1px solid #bbb;height:20px;margin-top:3px}
    .opts{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:4px}
    .ck{color:#888;margin-right:4px}
    .rowtbl{width:100%;border-collapse:collapse;margin-top:4px}
    .rowtbl td{padding:4px 6px;border-bottom:1px solid #eee;font-size:9.5pt}
    .rowtbl td.r{text-align:right;color:#111;font-weight:700;white-space:nowrap}
    .two{display:flex;gap:20px}.two>div{flex:1}
    .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:9px 16px;display:flex;justify-content:space-between;align-items:center;font-family:Arial;font-size:13px}
    @media print{.__bar{display:none}}
  </style></head><body>
    <div class="__bar"><span>Feedback form ready — print or save as PDF.</span><button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:13px;padding:7px 16px">Print / Save as PDF</button></div>
    <div style="padding:44px 0.5in 0">
      ${header}
      <div class="hero"><p class="k">OPEN HOUSE FEEDBACK</p>${address ? `<p class="a">${esc(address)}</p>` : ""}</div>

      <div class="q"><span class="lab">Overall, how would you rate this home?</span> &nbsp; ${stars}</div>
      <div class="q"><span class="lab">What did you like most?</span><div class="line"></div><div class="line"></div></div>
      <div class="q"><span class="lab">What did you like least?</span><div class="line"></div><div class="line"></div></div>

      <div class="q"><span class="lab">How do you feel about the asking price?</span>
        <div class="opts">${["Great value", "Priced appropriately", "Slightly high", "Too high", "Not sure"].map(box).join("")}</div></div>

      <div class="two">
        <div class="q"><span class="lab">Rate the details</span>
          <table class="rowtbl">${cats.map((c) => `<tr><td>${c}</td><td class="r">${stars}</td></tr>`).join("")}</table>
        </div>
        <div>
          <div class="q"><span class="lab">Would you consider making an offer?</span>
            <div class="opts">${["Yes", "Maybe", "No"].map(box).join("")}</div></div>
          <div class="q"><span class="lab">If not, what's stopping you?</span>
            <div class="opts">${["Price", "Condition", "Location", "Layout", "Size", "Financing", "Another property", "Other"].map(box).join("")}</div></div>
          <div class="q"><span class="lab">What price should this home sell for?</span><div class="line"></div></div>
        </div>
      </div>

      <div class="q"><span class="lab">Would you like more info about…</span>
        <div class="opts">${["This property", "Similar properties", "Mortgage / payment options", "None"].map(box).join("")}</div></div>

      <div class="q"><span class="lab">Your info (optional):</span>
        <table class="rowtbl"><tr><td style="width:33%">Name</td><td style="width:33%">Phone</td><td>Email</td></tr>
        <tr><td class="line"></td><td class="line"></td><td class="line"></td></tr></table></div>
    </div>
    ${crushFooterHtml()}
  </body></html>`;
}

export function OpenHouseFeedbackPrint({ className = "" }: { className?: string }) {
  const { profile } = useAuth();
  const { listing } = useActiveListing();
  function print() {
    const address = listing ? [listing.address, listing.city, listing.state].filter(Boolean).join(", ") : "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html(realtorBrandHtml(profile), address));
    w.document.close();
    w.focus();
  }
  return (
    <button type="button" onClick={print} className={className || "inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"}>
      Print feedback form
    </button>
  );
}
