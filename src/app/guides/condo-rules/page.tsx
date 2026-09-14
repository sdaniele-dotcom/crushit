import type { Metadata } from "next";
import { Container, PageHero, Button, Card, Eyebrow } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";
import { site } from "@/lib/site";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";

export const metadata: Metadata = {
  title: "The 2026 Condo Rules",
  description:
    "Limited Review is gone and reserve minimums are rising. What changed, when it takes effect, and what to check before you take a condo listing.",
};

/**
 * Source: Fannie Mae Lender Letter LL-2026-03 (issued 2026-03-18) and Freddie
 * Mac's parallel update. Dates and figures are stated plainly here rather than
 * summarised loosely — if a guideline moves, edit this page, the printable
 * version below, and the `condo_note` email template together.
 */
const TIMELINE: { date: string; passed: boolean; title: string; body: string }[] = [
  {
    date: "July 1, 2026",
    passed: true,
    title: "Insurance items tightened",
    body: "Master policy deductible limits and HO-6 walls-in coverage requirements took effect.",
  },
  {
    date: "August 3, 2026",
    passed: true,
    title: "Limited Review retired",
    body: "Applications dated on or after this day can no longer use the Limited Review process. Most established condo projects now require a full project review, unless the loan qualifies for a waiver or is exempt.",
  },
  {
    date: "January 1, 2027",
    passed: false,
    title: "Annual insurance reminders",
    body: "Servicers begin sending associations annual reminders about insurance requirements.",
  },
  {
    date: "January 4, 2027",
    passed: false,
    title: "Reserves rise to 15%",
    body: "The minimum reserve contribution goes from 10% to 15% of the association's annual budgeted assessment income. Projects below that will rely on a current reserve study to stay eligible.",
  },
];

const CHECKLIST = [
  "How much does the association budget for reserves, as a percentage of annual assessment income? Under 15% is the number to watch.",
  "Is there a reserve study, and how old is it? A study completed in the last 36 months is what carries weight.",
  "Any special assessments — current, pending, or discussed at the last few board meetings?",
  "Any deferred maintenance or critical repairs noted in the minutes, an engineer's report, or a city inspection?",
  "What share of units are owner-occupied, and is any single entity holding a large block of them?",
  "Is the HOA in litigation, and if so, over what?",
  "For California buildings: has the SB 326 balcony and elevated-element inspection been done, and what did it find?",
];

const MISREADS = [
  [
    "“It's a townhouse, so the same rules apply.”",
    "Usually not. A townhouse is often fee-simple with an HOA and gets no project review at all. Check how the unit is actually held before assuming either way.",
  ],
  [
    "“The building was fine last year, so it's fine now.”",
    "Project eligibility is re-checked per loan. A project that sailed through in 2025 can fail today on reserves or an open repair item.",
  ],
  [
    "“We'll sort the HOA paperwork during escrow.”",
    "Full review means questionnaires, budgets, and reserve studies are now gating documents, not paperwork. Finding a problem in week three costs the deal.",
  ],
];

/** Print/Save-as-PDF version — self-contained, co-branded, one page. */
const printableHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<title>The 2026 Condo Rules</title>
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16181d;margin:0;padding:38px 44px;font-size:11pt;line-height:1.45}
  .top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #e11b22;padding-bottom:13px}
  h1{font-size:23pt;margin:0 0 3px;letter-spacing:-.5px}
  .sub{color:#62666e;font-size:10pt;margin:0}
  .logo{height:46px;width:auto;display:block}
  h2{font-size:11pt;text-transform:uppercase;letter-spacing:1.6px;color:#62666e;margin:22px 0 8px}
  table{width:100%;border-collapse:collapse;margin-top:4px}
  td{padding:8px 10px 8px 0;vertical-align:top;border-bottom:1px solid #e4e5e8;font-size:10pt}
  td.d{white-space:nowrap;font-weight:700;width:1.5in}
  td.t{font-weight:700;width:2in}
  ul{margin:4px 0 0;padding-left:18px}
  li{margin:5px 0;font-size:10pt}
  .q{font-weight:700;margin:10px 0 2px;font-size:10pt}
  .a{margin:0;color:#3c414b;font-size:10pt}
  .foot{margin-top:22px;border-top:1px solid #e4e5e8;padding-top:11px;font-size:8.5pt;color:#62666e;line-height:1.5}
  @media print{body{padding:26px 30px}}
</style></head><body>
  <div class="top">
    <div>
      <h1>The 2026 condo rules</h1>
      <p class="sub">What changed, when — and what to check before you take the listing.</p>
    </div>
    <img class="logo" src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"/>
  </div>

  <h2>What changed and when</h2>
  <table>
    ${TIMELINE.map(
      (t) =>
        `<tr><td class="d">${t.date}</td><td class="t">${t.title}</td><td>${t.body}</td></tr>`,
    ).join("")}
  </table>

  <h2>Ask the HOA before you list</h2>
  <ul>${CHECKLIST.map((c) => `<li>${c}</li>`).join("")}</ul>

  <h2>Three things people get wrong</h2>
  ${MISREADS.map(([q, a]) => `<p class="q">${q}</p><p class="a">${a}</p>`).join("")}

  <p class="foot">
    Source: Fannie Mae Lender Letter LL-2026-03 (issued March 18, 2026) and Freddie Mac's parallel update.
    Guidelines change and individual lenders may overlay stricter requirements — confirm before relying on this.
    General information for real estate professionals; not legal advice, a commitment to lend, or an offer of credit.<br/>
    ${site.company} · ${site.phone} · NMLS #${site.companyNmls} · Equal Housing Opportunity
  </p>
</body></html>`;

export default function CondoRulesPage() {
  return (
    <>
      <PageHero
        eyebrow="Agent guide"
        title={
          <>
            The 2026 <span className="text-gradient">condo rules</span>
          </>
        }
        subtitle="Limited Review is gone and reserve minimums are rising. Here's what changed, when each piece takes effect, and what to ask the HOA before you take a condo listing."
      />

      <Container className="py-14">
        <div className="rounded-2xl border border-crush-500/40 bg-crush-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-crush-700">
            The short version
          </p>
          <p className="mt-2 text-ink-800">
            Since <strong>August 3, 2026</strong>, most established condo projects need a{" "}
            <strong>full project review</strong> — Limited Review is retired. On{" "}
            <strong>January 4, 2027</strong>, minimum reserves rise from{" "}
            <strong>10% to 15%</strong> of the association&apos;s annual budgeted assessment income.
            HOA questionnaires, budgets and reserve studies are now gating documents, not paperwork.
          </p>
        </div>

        <div className="mt-12">
          <Eyebrow>What changed and when</Eyebrow>
        </div>
        <div className="mt-5 space-y-3">
          {TIMELINE.map((t) => (
            <Card key={t.date} className="flex flex-col gap-2 p-5 sm:flex-row sm:gap-6">
              <div className="sm:w-40 sm:shrink-0">
                <p className="font-bold text-ink-900">{t.date}</p>
                <p
                  className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${
                    t.passed ? "text-crush-600" : "text-muted"
                  }`}
                >
                  {t.passed ? "In effect" : "Upcoming"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-ink-900">{t.title}</p>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Eyebrow>Ask the HOA before you list</Eyebrow>
        </div>
        <Card className="mt-5 p-6">
          <ul className="space-y-3">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex gap-3 text-sm text-ink-800">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-12">
          <Eyebrow>Three things people get wrong</Eyebrow>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {MISREADS.map(([q, a]) => (
            <Card key={q} className="p-5">
              <p className="font-semibold text-ink-900">{q}</p>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-ink-900">Take it with you</p>
            <p className="mt-1 text-sm text-muted">
              A one-page, co-branded version to save as a PDF or hand to a seller.
            </p>
          </div>
          <PrintButton
            html={printableHtml}
            label="Download the guide"
            className="shrink-0 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
            rewardAction="condo_guide"
            rewardEvents={["guide_downloaded"]}
          />
        </Card>

        <Card className="mt-6 flex flex-col items-start justify-between gap-4 bg-surface p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-ink-900">Got a condo under contract?</p>
            <p className="mt-1 text-sm text-muted">
              Send us the HOA contact and we&apos;ll run the project review up front — before
              you&apos;re deep in escrow.
            </p>
          </div>
          <Button href="/contact" className="shrink-0">
            Ask us to check a project
          </Button>
        </Card>

        <p className="mt-10 text-xs leading-relaxed text-muted">
          Source: Fannie Mae Lender Letter LL-2026-03 (issued March 18, 2026) and Freddie Mac&apos;s
          parallel update. Guidelines change and individual lenders may apply stricter overlays —
          confirm current requirements before relying on this. General information for real estate
          professionals; not legal advice, a commitment to lend, or an offer of credit.
        </p>
      </Container>
    </>
  );
}
