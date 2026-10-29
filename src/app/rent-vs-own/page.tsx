import type { Metadata } from "next";
import { Container, PageHero, Button } from "@/components/ui";
import { site } from "@/lib/site";
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

        {/*
          The appreciation assumption is the one a client is most likely to
          push back on, and "homes go up" is a claim worth being able to show
          rather than assert. C.A.R.'s own series covers 56 years including
          2007–2009, which is the part that makes it persuasive rather than
          promotional.
        */}
        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              Where does the appreciation number come from?
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">
              California&apos;s median single-family price went from{" "}
              <strong className="text-ink-900">$23,210 in 1968</strong> to{" "}
              <strong className="text-ink-900">$865,440 in 2024</strong> — an average of{" "}
              <strong className="text-ink-900">7.3% a year</strong> across 56 years, crash
              included. Source: California Association of REALTORS®.
            </p>
          </div>
          <div className="mt-4 shrink-0 sm:mt-0">
            {/*
              A plain anchor, not <Button>. Button sends an internal href
              through next/link, which would try to client-side route to a
              static PDF and 404 inside the app shell. Matches how the guides
              are fetched — root-relative, since the site deploys at the domain
              root.
            */}
            <a
              href="/resources/california-median-price-history.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-2"
            >
              See the 1968–2024 history
            </a>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Ready to turn the numbers into a real plan?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Get your buyer pre-approved so they know their true budget — and stop
            paying someone else&apos;s mortgage.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href={site.applyUrl}>Start a pre-approval</Button>
            <Button href="/calculators" variant="secondary">
              Try the payment calculator
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
