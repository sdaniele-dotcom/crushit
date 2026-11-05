import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { Webinars } from "@/components/Webinars";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free home-buying webinars",
  description:
    "Free live webinars and replays on what a house actually costs each month — "
    + "down payments, rates, taxes, insurance and the programs most buyers never hear about.",
};

export default function WebinarsPage() {
  return (
    <>
      <PageHero
        eyebrow="Free · no pitch"
        title={
          <>
            Learn what it <span className="text-gradient">actually costs</span>
          </>
        }
        subtitle="Short, honest sessions on the part nobody explains: the real monthly payment, what you need down, and the programs most buyers never hear about. Ask anything — that's the point."
      />

      <Container className="py-14">
        <Webinars />

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">Would rather just see your own numbers?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            The calculators are free and nobody calls you unless you ask. Start with a payment
            breakdown or compare renting against owning.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/calculators"
              className="inline-flex items-center rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
            >
              Run a payment
            </Link>
            <Link
              href="/rent-vs-own"
              className="inline-flex items-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2"
            >
              Rent vs own
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">
            {site.company} · NMLS #{site.companyNmls} · Equal Housing Opportunity. This is not a
            commitment to lend.
          </p>
        </div>
      </Container>
    </>
  );
}
