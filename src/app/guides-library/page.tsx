import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { Guides } from "@/components/Guides";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free buyer guides",
  description:
    "Plain-English guides on what a home actually costs, how a first house becomes an "
    + "investment, and the programs most buyers never hear about.",
};

/**
 * /guides-library rather than /guides, because /resources and /guides already
 * exist and serve the AGENT side — co-branded buyer and seller guides an agent
 * hands to their own client. Reusing either path would have quietly changed
 * what an agent's bookmark opens.
 */
export default function GuidesLibraryPage() {
  return (
    <>
      <PageHero
        eyebrow="Free · no pitch"
        title={
          <>
            Guides worth <span className="text-gradient">actually reading</span>
          </>
        }
        subtitle="The things nobody explains properly: what the month really costs, how a first home turns into an investment, and the programs most buyers never hear about."
      />

      <Container className="py-14">
        <Guides />

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">Want these numbers for your price?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            The guides use examples. The calculators use yours — free, instant, and nobody
            calls unless you ask.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/calculators" className="inline-flex items-center rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600">
              Run a payment
            </Link>
            <Link href="/webinars" className="inline-flex items-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2">
              Come to a webinar
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">
            {site.company} · NMLS #{site.companyNmls} · Equal Housing Opportunity. Guides are
            for education only and are not a commitment to lend, a rate quote or tax advice.
          </p>
        </div>
      </Container>
    </>
  );
}
