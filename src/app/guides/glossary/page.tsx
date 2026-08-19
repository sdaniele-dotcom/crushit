import type { Metadata } from "next";
import { Container, PageHero, Button, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Homebuying Glossary",
  description:
    "The mortgage and real-estate terms every buyer asks about — explained in plain English.",
};

const sections: { title: string; terms: [string, string][] }[] = [
  {
    title: "Getting approved",
    terms: [
      ["Pre-qualification", "A quick estimate of what you might borrow, based on info you share but not yet verified."],
      ["Pre-approval", "A lender's written commitment based on verified income, assets, and credit — much stronger than a pre-qual when you make an offer."],
      ["Debt-to-income (DTI)", "Your monthly debt payments divided by your gross monthly income. Lenders use it to size your loan."],
      ["Underwriting", "The lender's final review that verifies everything and approves the loan."],
      ["Rate lock", "Locking today's interest rate for a set period so it won't change before you close."],
    ],
  },
  {
    title: "Your loan & rate",
    terms: [
      ["Interest rate", "The cost of borrowing, shown as a yearly percentage of the loan balance."],
      ["APR", "The annual percentage rate — your interest rate plus certain fees, so it's slightly higher and helps compare loans."],
      ["Points (discount points)", "Optional upfront fees you pay to lower your interest rate. One point = 1% of the loan."],
      ["Rate buydown", "Paying to reduce your rate — temporarily (e.g. 2-1 buydown) or permanently."],
      ["Loan-to-value (LTV)", "The loan amount divided by the home's value. Lower LTV (more down) usually means better terms."],
      ["Amortization", "How your loan is paid down over time — early payments are mostly interest, later ones mostly principal."],
      ["Conforming vs. jumbo", "Conforming loans fall under the annual limit; jumbo loans exceed it and have stricter requirements."],
    ],
  },
  {
    title: "Costs & payments",
    terms: [
      ["Principal & interest (P&I)", "The core of your monthly payment — paying down the loan plus the interest."],
      ["PITI", "Principal, Interest, Taxes, and Insurance — the full monthly housing payment."],
      ["PMI / MIP", "Mortgage insurance, usually required with less than 20% down (PMI on conventional, MIP on FHA)."],
      ["Escrow / impound account", "An account your lender uses to collect and pay your property taxes and insurance."],
      ["Earnest money", "A good-faith deposit with your offer that's credited toward your costs at closing."],
      ["Closing costs", "Lender, title, and escrow fees to finalize the loan — typically 2–5% of the price."],
      ["Cash to close", "The total you need at closing: down payment + closing costs − credits and deposits."],
    ],
  },
  {
    title: "The process & paperwork",
    terms: [
      ["Loan Estimate (LE)", "A standardized 3-page form showing your estimated rate, payment, and costs after you apply."],
      ["Closing Disclosure (CD)", "The final version of your loan terms and costs — you get it at least 3 days before closing."],
      ["Appraisal", "An independent estimate of the home's value that the lender requires."],
      ["Contingency", "A condition in your offer (inspection, appraisal, financing) that lets you back out if it isn't met."],
      ["Title insurance", "Protects you and the lender against claims or defects in the home's ownership history."],
      ["HOA", "A homeowners association that maintains shared areas and charges dues — factor it into your budget."],
    ],
  },
];

export default function GlossaryPage() {
  return (
    <>
      <PageHero
        eyebrow="Buyer guide"
        title={
          <>
            The homebuying{" "}
            <span className="text-gradient">glossary</span>
          </>
        }
        subtitle="Every term your buyers ask about, in plain English. Share it to turn confusion into confidence."
      />

      <Container className="py-14">
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <Eyebrow>{s.title}</Eyebrow>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {s.terms.map(([term, def]) => (
                  <div
                    key={term}
                    className="rounded-2xl border border-border bg-white p-6"
                  >
                    <h3 className="font-bold text-crush-600">{term}</h3>
                    <p className="mt-1 text-sm text-muted">{def}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Have a question a definition can&apos;t answer?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            We&apos;ll walk your buyer through their specific situation — no
            jargon, no pressure.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/about/#contact">Ask us anything</Button>
            <Button href="/calculators" variant="secondary">
              Run the numbers
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
