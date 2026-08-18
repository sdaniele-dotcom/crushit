import type { Metadata } from "next";
import { Container, PageHero, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Rent vs. Own",
  description:
    "A side-by-side look at renting versus owning — see how monthly cost, equity, and long-term wealth compare. Full interactive tool coming soon.",
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
        subtitle="See how renting stacks up against owning over time — monthly cost, equity built, tax benefits, and the real cost of waiting."
      />

      <Container className="py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-surface p-10 text-center sm:p-14">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-crush-50 text-4xl">
            ⚖️
          </div>
          <h2 className="mt-6 text-2xl font-bold text-ink-900">
            The full Rent vs. Own tool is coming soon
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            We&apos;re building a detailed, side-by-side breakdown that shows
            your clients exactly how owning compares to renting over 5, 10, and
            30 years — equity, appreciation, tax benefits, and all.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/calculators">Use the payment calculator</Button>
            <Button href="/contact" variant="secondary">
              Talk to Crush Mortgage
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
