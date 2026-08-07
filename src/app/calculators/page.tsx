import type { Metadata } from "next";
import { CalculatorTabs } from "@/components/calculators/CalculatorTabs";
import { Container, PageHero, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mortgage Calculators",
  description:
    "Run monthly payment, affordability, rent-vs-buy, and refinance numbers instantly — perfect for real-time client conversations.",
};

export default function CalculatorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Interactive tools"
        title={
          <>
            Run the numbers <span className="text-gradient">live</span> with your
            clients
          </>
        }
        subtitle="Four calculators that turn 'I'm not sure I can afford it' into a confident next step. Adjust any input and watch the results update instantly."
      />

      <Container className="py-14">
        <CalculatorTabs />

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Ready to turn an estimate into a real pre-approval?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Send your buyer to a fast, no-obligation pre-approval and give their
            offer real strength.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Start a pre-approval</Button>
            <Button href="/loan-programs" variant="secondary">
              Compare loan programs
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          All calculators provide estimates for educational use only and are not
          a commitment to lend. Actual terms depend on a full application and
          credit approval.
        </p>
      </Container>
    </>
  );
}
