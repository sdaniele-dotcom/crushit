import type { Metadata } from "next";
import { Container, PageHero, Button } from "@/components/ui";
import { RentVsOwnCalculator } from "@/components/RentVsOwnCalculator";

export const metadata: Metadata = {
  title: "Rent vs. Own",
  description:
    "See exactly how renting compares to owning over time — monthly cost after tax savings, equity built, and how much wealth you'd give up by renting. Crush Mortgage's full rent-vs-own model.",
};

export default function RentVsOwnPage() {
  return (
    <>
      <PageHero
        eyebrow="Interactive tool"
        title={
          <>
            Rent vs. <span className="text-gradient">Own</span>
          </>
        }
        subtitle="The real cost of renting isn't just the rent — it's the equity you never build. Plug in a home and today's rent to see how far ahead owning puts your client over time."
      />

      <Container className="py-14">
        <RentVsOwnCalculator />

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Ready to turn the numbers into a real plan?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Get your buyer pre-approved so they know their true budget — and stop
            paying someone else&apos;s mortgage.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/about/#contact">Start a pre-approval</Button>
            <Button href="/calculators" variant="secondary">
              Try the payment calculator
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
