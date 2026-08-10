import type { Metadata } from "next";
import { Container, PageHero, Button, Eyebrow } from "@/components/ui";
import {
  loanPrograms,
  rateTable,
  ratesAsOf,
  rateAssumptions,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Loan Programs",
  description:
    "Plain-English guides to Conventional, FHA, VA, USDA, Jumbo, and DSCR loans so you can match every buyer to the right program.",
};

export default function LoanProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Loan program guides"
        title={
          <>
            Match every buyer to the{" "}
            <span className="text-gradient">right loan</span>
          </>
        }
        subtitle="Six programs, explained in plain English. Use these to answer buyer questions with confidence — no jargon, no guesswork."
      />

      <Container className="py-14">
        {/* Quick-compare table */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ink-900 text-white">
              <tr>
                <th className="px-5 py-3 font-semibold">Program</th>
                <th className="px-5 py-3 font-semibold">Min. down</th>
                <th className="px-5 py-3 font-semibold">Min. credit</th>
                <th className="px-5 py-3 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {loanPrograms.map((p) => (
                <tr key={p.slug} className="hover:bg-surface">
                  <td className="px-5 py-3 font-semibold text-ink-900">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-crush-600 font-semibold">
                    {p.minDown}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{p.minCredit}</td>
                  <td className="px-5 py-3 text-muted">{p.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rate table */}
        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>Today&apos;s rates</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
                Sample rate snapshot
              </h2>
            </div>
            <p className="text-sm text-muted">
              Rates as of{" "}
              <span className="font-semibold text-ink-900">{ratesAsOf}</span>
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ink-900 text-white">
                <tr>
                  <th className="px-5 py-3 font-semibold">Program</th>
                  <th className="px-5 py-3 font-semibold">Term</th>
                  <th className="px-5 py-3 font-semibold">Rate</th>
                  <th className="px-5 py-3 font-semibold">APR</th>
                  <th className="px-5 py-3 font-semibold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {rateTable.map((r) => (
                  <tr
                    key={`${r.program}-${r.term}`}
                    className={r.featured ? "bg-crush-50/60" : "hover:bg-surface"}
                  >
                    <td className="px-5 py-3 font-semibold text-ink-900">
                      {r.program}
                    </td>
                    <td className="px-5 py-3 text-muted">{r.term}</td>
                    <td className="px-5 py-3 text-lg font-bold tabular-nums text-crush-600">
                      {r.rate}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-ink-800">
                      {r.apr}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-muted">
                      {r.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            {rateAssumptions} Rates, APRs, and points are estimates for
            illustration only, are not a commitment to lend, and change daily.
            Contact us for a rate specific to your scenario. Equal Housing
            Opportunity.
          </p>

          <div className="mt-6">
            <Button href="/contact">Get your custom rate quote</Button>
          </div>
        </div>

        {/* Detail cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {loanPrograms.map((p) => (
            <div
              key={p.slug}
              id={p.slug}
              className="flex flex-col rounded-2xl border border-border bg-white p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink-900">{p.name}</h2>
                  <p className="mt-1 text-crush-600">{p.tagline}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-crush-50 px-4 py-2 text-center">
                  <p className="text-lg font-extrabold text-crush-600">
                    {p.minDown}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-crush-700">
                    Min down
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted">
                <span className="font-semibold text-ink-800">Best for:</span>{" "}
                {p.bestFor}
              </p>

              <ul className="mt-4 space-y-2">
                {p.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-sm text-ink-800"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-4 w-4 shrink-0 text-crush-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M4 10l4 4 8-9" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>

              <p className="mt-5 rounded-lg bg-surface px-4 py-3 text-xs text-muted">
                <span className="font-semibold text-ink-800">Watch out:</span>{" "}
                {p.watchOut}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <Eyebrow>Not sure which fits?</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            We&apos;ll help your buyer find the perfect program
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Send them our way for a quick, no-pressure conversation and a
            same-day pre-approval.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Get your buyer pre-approved</Button>
            <Button href="/calculators" variant="secondary">
              Estimate a payment
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          *VA credit minimums vary by lender overlay. Program details are
          general guidelines and subject to change, eligibility, and full
          underwriting approval.
        </p>
      </Container>
    </>
  );
}
