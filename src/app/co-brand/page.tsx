import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { FlyerRequestForm } from "@/components/FlyerRequestForm";
import { ActiveListingProvider, ListingPicker } from "@/components/ActiveListing";
import { HOURS_LABEL } from "@/lib/businessHours";

export const metadata: Metadata = {
  title: "Request a Mortgage Flyer",
  description:
    "Agents: send us a request and a Crush Mortgage loan officer prices your listing by hand, then sends back a co-branded financing flyer with accurate numbers.",
};

/**
 * Listing flyers — a request, not a generator.
 *
 * This page used to build the financing flyer on the spot. The numbers on it
 * are a quote, and the inputs an agent can reasonably supply (an estimated tax
 * rate, an unknown HOA, no credit profile) are not enough to quote from. The
 * request path is slower by design; the disclaimer says so plainly rather than
 * leaving agents wondering why the instant button went away.
 */
export default function CoBrandPage() {
  return (
    <>
      <PageHero
        eyebrow="For agents"
        title={
          <>
            Send a request to make{" "}
            <span className="text-gradient">mortgage flyers</span>
          </>
        }
        subtitle="Tell us about the listing and a loan officer prices it by hand — then sends you a co-branded flyer with financing scenarios, a shareable page and a print-ready PDF."
      />

      <Container className="py-14">
        {/* The disclaimer, stated once, up top, before the form. */}
        <div className="mb-10 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-bold text-ink-900">
            Why we don&apos;t do this automatically
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            We want to give you the most accurate numbers, and that is exactly why automation is not ideal.
            An honest payment depends on the buyer&apos;s credit and income, the property&apos;s real taxes,
            HOA and insurance, and the rate sheet as it stands today — not on averages and assumptions. A flyer
            that is off by a couple of hundred dollars a month costs you credibility with a buyer.
          </p>
          <p className="mt-3 max-w-3xl text-muted">
            So send us a request and we will reach out to you as soon as possible during business hours,{" "}
            <strong className="text-ink-900">{HOURS_LABEL}</strong>. If your request comes in outside those hours,
            we will be sure to reach out within the business times — usually first thing the next business morning.
          </p>
          <p className="mt-3 text-sm text-muted">
            In a hurry? Call{" "}
            <a href="tel:5623176112" className="font-semibold text-crush-600">(562) 317-6112</a> or email{" "}
            <a href="mailto:team@crushmortgage.com" className="font-semibold text-crush-600">team@crushmortgage.com</a>.
          </p>
        </div>

        <ActiveListingProvider>
          <ListingPicker />
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-crush-50 text-2xl">🎨</span>
              <div>
                <h3 className="font-bold text-ink-900">Just want a photo flyer (no financing)?</h3>
                <p className="mt-0.5 text-sm text-muted">Design one yourself, instantly — Just Listed, Open House, Luxury &amp; more. No pricing involved, so no wait.</p>
              </div>
            </div>
            <Link href="/flyer-studio" className="shrink-0 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2">Flyer template library →</Link>
          </div>
          <FlyerRequestForm />
        </ActiveListingProvider>
      </Container>
    </>
  );
}
