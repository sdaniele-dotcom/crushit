import type { Metadata } from "next";
import { Container, PageHero, Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Document Checklist",
  description:
    "Everything a homebuyer needs to gather for a smooth mortgage approval — income, assets, identity, and property documents in plain English.",
};

const groups = [
  {
    title: "Income",
    note: "Shows you can afford the payment.",
    items: [
      "Most recent 30 days of pay stubs",
      "W-2s for the last 2 years",
      "Federal tax returns for the last 2 years",
      "Self-employed: business returns, a year-to-date P&L, and 1099s",
      "Proof of other income (bonus, commission, Social Security, pension, child support)",
    ],
  },
  {
    title: "Assets",
    note: "Shows you have the funds to close.",
    items: [
      "2 months of bank statements — all pages, even blank ones",
      "Retirement and investment account statements",
      "Gift funds: a signed gift letter + the donor's bank statement",
      "Proof of your earnest money deposit",
    ],
  },
  {
    title: "Identity",
    note: "Verifies who you are.",
    items: [
      "Government-issued photo ID (driver's license or passport)",
      "Social Security number (or ITIN, if applicable)",
      "Permanent residents / visa holders: green card, work visa, or EAD",
    ],
  },
  {
    title: "Property (once you're under contract)",
    note: "Finalizes the loan on your home.",
    items: [
      "Fully executed purchase contract",
      "Homeowners insurance quote or policy",
      "HOA contact and dues info, if the home has an HOA",
    ],
  },
  {
    title: "Situational",
    note: "Only if these apply to you.",
    items: [
      "Letter of explanation for any recent credit inquiries or large deposits",
      "Bankruptcy discharge papers",
      "Complete divorce decree / child-support order",
      "Landlord contact for rental history (first-time buyers)",
    ],
  },
];

export default function DocumentChecklistPage() {
  return (
    <>
      <PageHero
        eyebrow="Buyer guide"
        title={
          <>
            The document{" "}
            <span className="text-gradient">checklist</span>
          </>
        }
        subtitle="Gather these up front and your approval moves fast. Share this list with buyers at the very first meeting so nothing stalls the loan later."
      />

      <Container className="py-14">
        <div className="mb-10 overflow-hidden rounded-3xl border border-crush-200 bg-crush-50">
          <div className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-4xl shadow-sm">
              ⚡
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">
                Good news: with today&apos;s technology, you may only need to fill
                out a loan application
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-ink-700 sm:text-base">
                In many cases you won&apos;t have to dig up a single document up
                front. Once you complete a quick application,{" "}
                <strong>income, assets, and employment can be verified
                electronically</strong> — securely and directly from the source.
                The checklist below is simply a backup for anything that
                can&apos;t be pulled automatically.
              </p>
            </div>
            <div className="shrink-0">
              <Button href="/contact">Start your application</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.title}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-bold text-ink-900">{g.title}</h2>
              </div>
              <p className="mt-1 text-sm text-crush-600">{g.note}</p>
              <ul className="mt-4 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-sm text-ink-800">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-crush-500 text-crush-500"
                      aria-hidden
                    >
                      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 10l4 4 8-9" />
                      </svg>
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-surface">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink-800">Pro tip:</span> Snap
            clear photos or scan everything into one folder. Every page matters —
            underwriters need all pages of statements, even the blank last page.
          </p>
        </Card>

        <div className="mt-14 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <Eyebrow>Ready to start?</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Get your buyer pre-approved
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            With these documents in hand, a full pre-approval is usually
            same-day.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Start a pre-approval</Button>
            <Button href="/first-time-buyers" variant="secondary">
              See the full buyer guide
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
