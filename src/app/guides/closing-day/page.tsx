import type { Metadata } from "next";
import { Container, PageHero, Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Closing-Day Prep",
  description:
    "What to bring, what to expect, and how to avoid last-minute surprises at the closing table.",
};

const before = [
  "Review your Closing Disclosure — it arrives at least 3 days before closing. Compare it to your Loan Estimate.",
  "Confirm the final walkthrough with your agent (usually 24 hours before).",
  "Arrange your funds: wire transfer or cashier's check for the exact cash-to-close amount.",
  "Do NOT make big purchases, open new credit, or change jobs — it can derail final approval.",
  "Confirm the time, location, and who needs to attend.",
];

const bring = [
  "A valid, unexpired government photo ID (all borrowers)",
  "Wire confirmation or a cashier's check for cash to close",
  "Any documents your loan officer still needs",
  "Your checkbook, just in case of small last-minute adjustments",
];

const expect = [
  ["Sign your loan documents", "You'll review and sign the note, deed of trust, and disclosures."],
  ["Review the Closing Disclosure", "Confirm your rate, payment, and cash to close match what you expected."],
  ["Funding & recording", "The lender funds the loan and the sale is recorded with the county."],
  ["Get your keys", "Once it's recorded, the home is yours. Congratulations!"],
];

const after = [
  "Transfer or set up utilities in your name",
  "Change the locks and garage codes",
  "Store your closing documents somewhere safe (you'll need them at tax time)",
  "Set up automatic mortgage payments",
];

export default function ClosingDayPage() {
  return (
    <>
      <PageHero
        eyebrow="Buyer guide"
        title={
          <>
            Closing-day <span className="text-gradient">prep</span>
          </>
        }
        subtitle="The last step is the easiest to fumble. Send this to buyers a few days before closing so the big day goes off without a hitch."
      />

      <Container className="py-14">
        {/* Wire-fraud warning */}
        <div className="rounded-2xl border border-crush-500/40 bg-crush-50 p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crush-500 text-xl text-white">
              !
            </span>
            <div>
              <h2 className="text-lg font-bold text-crush-700">
                Protect yourself from wire fraud
              </h2>
              <p className="mt-1 text-sm text-ink-800">
                Before wiring any funds, call the escrow or title company using a
                phone number you already know — never a number or instructions
                from an email. Scammers send fake wiring instructions right
                before closing. When in doubt, call us or your agent first.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <Eyebrow>A few days before</Eyebrow>
            <ul className="mt-5 space-y-3">
              {before.map((it) => (
                <li key={it} className="flex items-start gap-3 text-sm text-ink-800">
                  <Check /> {it}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <Eyebrow>What to bring</Eyebrow>
            <ul className="mt-5 space-y-3">
              {bring.map((it) => (
                <li key={it} className="flex items-start gap-3 text-sm text-ink-800">
                  <Check /> {it}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Eyebrow>After you close</Eyebrow>
              <ul className="mt-5 space-y-3">
                {after.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-sm text-ink-800">
                    <Check /> {it}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* What to expect timeline */}
        <div className="mt-12">
          <Eyebrow>At the closing table</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            What actually happens
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {expect.map(([t, d], i) => (
              <Card key={t} className="relative overflow-hidden">
                <span className="absolute -right-2 -top-3 text-7xl font-black text-surface-2 select-none">
                  {i + 1}
                </span>
                <div className="relative">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-crush-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-bold text-ink-900">{t}</h3>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Questions before the big day?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            We&apos;re reachable evenings and weekends — because closings
            don&apos;t always happen 9 to 5.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/about/#contact">Get in touch</Button>
            <Button href="/guides/document-checklist" variant="secondary">
              See the document checklist
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

function Check() {
  return (
    <span
      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-crush-500 text-crush-500"
      aria-hidden
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10l4 4 8-9" />
      </svg>
    </span>
  );
}
