import type { Metadata } from "next";
import { Container, PageHero, Button } from "@/components/ui";
import { WealthBuilder } from "@/components/WealthBuilder";

export const metadata: Metadata = {
  title: "Wealth Builder",
  description:
    "See how real estate builds wealth — rent vs. own, then buying and holding investment properties, using each one's equity (HELOC) to buy the next, and turning them into rental income. Crush Mortgage's full model.",
};

export default function WealthBuilderPage() {
  return (
    <>
      <PageHero
        eyebrow="Interactive tool"
        title={
          <>
            The <span className="text-gradient">Wealth Builder</span>
          </>
        }
        subtitle="Show your clients the whole picture — why owning beats renting, how holding property turns a small down payment into big equity, and how that equity funds the next home and real rental income."
      />

      <Container className="py-14">
        <WealthBuilder />

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Turn the strategy into a real plan
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Get pre-approved and map out the first purchase — Crush Mortgage will
            help structure the financing so the plan actually works.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Start a pre-approval</Button>
            <Button href="/loan-programs" variant="secondary">
              See loan programs
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted">
          Estimates for educational use only — not a commitment to lend, a rate
          quote, investment advice, or tax advice. Projections assume appreciation,
          rent, and income growth hold steady, which they may not. Consult a tax
          and financial professional. Equal Housing Opportunity.
        </p>
      </Container>
    </>
  );
}
