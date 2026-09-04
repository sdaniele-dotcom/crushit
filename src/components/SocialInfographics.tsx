"use client";

/**
 * SocialInfographics — a gallery of ready-made, square (1:1) educational
 * infographics agents can download and post. Each one is co-branded: the
 * agent's name/contact at the bottom, Crush Mortgage as the financing partner.
 * "Download / Print" opens a square print window (Save as PDF, or screenshot
 * for a 1080×1080 social image). No design skills required, nothing to edit.
 */

import { useAuth } from "@/components/auth/AuthProvider";
import { recordUse } from "@/lib/rewards";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";
import { fullName, type Profile } from "@/lib/profile";
import { esc } from "@/lib/printBranding";

type Point = { big: string; small: string };
type Info = {
  key: string;
  action: string; // reward action key
  kicker: string;
  title: string;
  accent: string;
  intro?: string;
  points: Point[];
  footnote: string;
};

const INFOGRAPHICS: Info[] = [
  {
    key: "down-payment-myth",
    action: "social_content",
    kicker: "Homebuyer myth",
    title: "You don't need 20% down",
    accent: "#e62c2c",
    intro: "The #1 myth that keeps renters renting:",
    points: [
      { big: "3%", small: "down on many conventional loans" },
      { big: "3.5%", small: "down with an FHA loan" },
      { big: "$0", small: "down for VA & USDA buyers who qualify" },
    ],
    footnote: "Ask me what you'd actually need to get into a home this year.",
  },
  {
    key: "steps-to-buy",
    action: "social_content",
    kicker: "First-time buyer",
    title: "5 steps to buy your first home",
    accent: "#0ea5e9",
    points: [
      { big: "1", small: "Get pre-approved — know your real budget" },
      { big: "2", small: "Tour homes in your price range" },
      { big: "3", small: "Make an offer with your agent" },
      { big: "4", small: "Inspection, appraisal & final loan approval" },
      { big: "5", small: "Sign, fund & get your keys 🔑" },
    ],
    footnote: "Thinking about step 1? Let's talk — pre-approval is free.",
  },
  {
    key: "get-preapproved",
    action: "social_content",
    kicker: "Before you shop",
    title: "Why get pre-approved first",
    accent: "#7c3aed",
    intro: "A pre-approval isn't paperwork — it's your edge.",
    points: [
      { big: "✓", small: "Know exactly what you can afford" },
      { big: "✓", small: "Sellers take your offer seriously" },
      { big: "✓", small: "Close faster with fewer surprises" },
    ],
    footnote: "Same-day pre-approvals available. DM me to start.",
  },
  {
    key: "cost-of-waiting",
    action: "social_content",
    kicker: "Market truth",
    title: "The cost of waiting to buy",
    accent: "#f59e0b",
    intro: "Waiting for the \"perfect time\" has a price tag:",
    points: [
      { big: "📈", small: "Home prices historically rise over time" },
      { big: "🏠", small: "Every month renting builds zero equity" },
      { big: "💵", small: "You can refinance a rate — you can't rebuy a price" },
    ],
    footnote: "Let's run your numbers so you can decide with facts, not fear.",
  },
  {
    key: "rent-vs-own",
    action: "social_content",
    kicker: "Rent vs. own",
    title: "Where does your rent go?",
    accent: "#10b981",
    intro: "Same monthly check — very different outcome.",
    points: [
      { big: "Rent", small: "100% goes to your landlord's equity" },
      { big: "Own", small: "A chunk of every payment becomes YOUR equity" },
      { big: "Plus", small: "Potential tax benefits & a fixed payment" },
    ],
    footnote: "Curious what owning would cost vs. your rent? Ask me.",
  },
  {
    key: "self-employed",
    action: "social_content",
    kicker: "Business owners",
    title: "Self-employed? You can still qualify",
    accent: "#111827",
    intro: "Told you \"don't qualify\"? Not so fast.",
    points: [
      { big: "🏦", small: "Bank-statement loans — no tax returns needed" },
      { big: "📊", small: "P&L programs built for business owners" },
      { big: "💼", small: "1099 & asset-based options too" },
    ],
    footnote: "Let's find the program built for how you actually earn.",
  },
];

/** Bottom co-branding strip used on every infographic (print + preview share the data). */
function agentLine(profile: Profile | null | undefined): { name: string; contact: string } {
  const name = fullName(profile) || "Your Name";
  const contact = [profile?.phone, profile?.brokerage]
    .map((s) => (s ? String(s) : ""))
    .filter(Boolean)
    .join("  ·  ");
  return { name, contact };
}

function buildDoc(info: Info, profile: Profile | null | undefined): string {
  const { name, contact } = agentLine(profile);
  const headshot = profile?.headshot_url || "";
  const pointsHtml = info.points
    .map(
      (p) => `<div class="pt">
        <div class="pt-big">${esc(p.big)}</div>
        <div class="pt-small">${esc(p.small)}</div>
      </div>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(info.title)} — Social graphic</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page{size:8in 8in;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;font-family:'Inter',Arial,sans-serif}
    .ig{width:8in;height:8in;position:relative;overflow:hidden;background:#fff;display:flex;flex-direction:column}
    .head{background:${info.accent};color:#fff;padding:0.5in 0.55in 0.42in}
    .kick{font-family:'Poppins',sans-serif;font-weight:700;font-size:13pt;letter-spacing:2px;text-transform:uppercase;opacity:.9;margin:0}
    .title{font-family:'Poppins',sans-serif;font-weight:800;font-size:30pt;line-height:1.08;margin:8pt 0 0}
    .body{flex:1;padding:0.4in 0.55in 0.2in;display:flex;flex-direction:column;justify-content:center}
    .intro{font-size:14pt;font-weight:600;color:#374151;margin:0 0 14pt}
    .pt{display:flex;align-items:center;gap:16pt;padding:10pt 0;border-bottom:1px solid #eef0f2}
    .pt:last-child{border-bottom:0}
    .pt-big{min-width:64pt;text-align:center;font-family:'Poppins',sans-serif;font-weight:800;font-size:26pt;color:${info.accent};line-height:1}
    .pt-small{font-size:14pt;font-weight:600;color:#1f2937}
    .foot-note{padding:0 0.55in;font-size:12.5pt;font-weight:700;color:${info.accent};text-align:center}
    .brand{margin-top:0.28in;padding:0.28in 0.55in;border-top:2px solid #f1f2f4;display:flex;align-items:center;gap:14pt}
    .brand img.head-img{width:52pt;height:52pt;border-radius:10pt;object-fit:cover}
    .brand .who{flex:1}
    .brand .a-name{font-family:'Poppins',sans-serif;font-weight:800;font-size:14pt;color:#111}
    .brand .a-contact{font-size:10pt;color:#555;margin-top:2pt}
    .brand .partner{text-align:right}
    .brand .partner small{display:block;font-size:7.5pt;letter-spacing:1px;text-transform:uppercase;color:#9aa0a6;margin-bottom:3pt}
    .brand .partner img{height:24pt;object-fit:contain}
    .disc{padding:0 0.55in 0.3in;font-size:7pt;color:#9aa0a6;line-height:1.35;text-align:center}
    .__bar{position:fixed;top:0;left:0;right:0;z-index:99;background:#111;color:#fff;padding:8px 14px;display:flex;gap:10px;justify-content:space-between;align-items:center;font-family:Arial;font-size:12px}
    @media print{.__bar{display:none}}
  </style></head><body>
  <div class="__bar"><span>Square social graphic — print or Save as PDF, or screenshot for a 1:1 post.</span>
    <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:12px;padding:6px 14px">Download / Print</button></div>

  <div class="ig">
    <div class="head">
      <p class="kick">${esc(info.kicker)}</p>
      <h1 class="title">${esc(info.title)}</h1>
    </div>
    <div class="body">
      ${info.intro ? `<p class="intro">${esc(info.intro)}</p>` : ""}
      ${pointsHtml}
    </div>
    <p class="foot-note">${esc(info.footnote)}</p>
    <div class="brand">
      ${headshot ? `<img class="head-img" src="${esc(headshot)}" alt="">` : ""}
      <div class="who">
        <div class="a-name">${esc(name)}</div>
        <div class="a-contact">${esc(contact)}</div>
      </div>
      <div class="partner">
        <small>Financing partner</small>
        <img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage">
      </div>
    </div>
    <div class="disc">Company NMLS #${site.companyNmls} · Equal Housing Opportunity · Not a commitment to lend. Information deemed reliable but not guaranteed. Educational use only.</div>
  </div>
  </body></html>`;
}

function InfographicPreview({ info, profile }: { info: Info; profile: Profile | null | undefined }) {
  const { name, contact } = agentLine(profile);
  return (
    <div className="flex aspect-square flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="px-5 pb-4 pt-5 text-white" style={{ background: info.accent }}>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">{info.kicker}</p>
        <h3 className="mt-1.5 font-display text-lg font-extrabold leading-tight">{info.title}</h3>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-3">
        {info.intro && <p className="mb-1 text-xs font-semibold text-ink-700">{info.intro}</p>}
        {info.points.map((p, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-surface-2 py-1 last:border-b-0">
            <span className="min-w-[2.2rem] text-center font-display text-lg font-extrabold leading-none" style={{ color: info.accent }}>
              {p.big}
            </span>
            <span className="text-xs font-semibold text-ink-800">{p.small}</span>
          </div>
        ))}
      </div>
      <p className="px-5 text-center text-[11px] font-bold" style={{ color: info.accent }}>
        {info.footnote}
      </p>
      <div className="mt-2 flex items-center gap-2 border-t border-surface-2 px-5 py-3">
        <div className="flex-1 truncate">
          <div className="truncate font-display text-xs font-extrabold text-ink-900">{name}</div>
          {contact && <div className="truncate text-[10px] text-muted">{contact}</div>}
        </div>
        <div className="text-right">
          <div className="text-[7px] uppercase tracking-wider text-muted">Financing partner</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={crushLogoPrimaryDataUri} alt="Crush Mortgage" className="ml-auto mt-0.5 h-4 object-contain" />
        </div>
      </div>
    </div>
  );
}

export function SocialInfographics() {
  const { profile } = useAuth();

  function download(info: Info) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildDoc(info, profile));
    w.document.close();
    w.focus();
    void recordUse(info.action, { events: ["content_piece_created"], silent: true });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {INFOGRAPHICS.map((info) => (
        <div key={info.key} className="flex flex-col">
          <InfographicPreview info={info} profile={profile} />
          <button
            type="button"
            onClick={() => download(info)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crush-600"
          >
            Download / Print
          </button>
        </div>
      ))}
    </div>
  );
}
