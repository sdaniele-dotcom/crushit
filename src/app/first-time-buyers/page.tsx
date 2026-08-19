import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "First-Time Buyer Guide",
  description:
    "A plain-English, step-by-step guide to buying your first home — budgeting, down payment options, documents, costs, and what to expect from offer to keys.",
};

const steps = [
  {
    t: "Get pre-approved first",
    d: "Before you tour a single home, a pre-approval tells you your real budget and shows sellers you're serious. It's free and usually same-day.",
    link: { href: site.applyUrl, label: "Start a pre-approval" },
  },
  {
    t: "Know your true monthly number",
    d: "Your payment is more than principal and interest — it includes taxes, insurance, and sometimes PMI or HOA dues. Run the numbers so there are no surprises.",
    link: { href: "/calculators", label: "Try the payment calculator" },
  },
  {
    t: "Pick the right loan program",
    d: "Conventional, FHA, VA, USDA — each has different down payment and credit requirements. The right fit can save you thousands.",
    link: { href: "/loan-programs", label: "Compare loan programs" },
  },
  {
    t: "Shop with your agent",
    d: "Tour homes inside your approved range. Your agent negotiates, spots red flags, and keeps the process moving.",
  },
  {
    t: "Make a strong offer",
    d: "A verified pre-approval makes your offer stand out. Your agent helps you decide price, contingencies, and earnest money.",
  },
  {
    t: "Inspection & appraisal",
    d: "An inspection protects you from surprises; the lender's appraisal confirms the home's value. Either can reopen negotiations.",
  },
  {
    t: "Underwriting & final approval",
    d: "The lender verifies everything one last time. Avoid big purchases or new credit during this window — it can affect your approval.",
  },
  {
    t: "Clear to close & get the keys",
    d: "Do a final walkthrough, review your Closing Disclosure, bring your funds and ID, sign — and you're a homeowner.",
  },
];

const costs = [
  {
    title: "Down payment",
    range: "0% – 20%",
    desc: "Less than you think — many programs start at 3% or even $0 down for eligible buyers.",
  },
  {
    title: "Closing costs",
    range: "2% – 5%",
    desc: "Lender, title, and escrow fees. Sometimes the seller can help cover these.",
  },
  {
    title: "Earnest money",
    range: "1% – 3%",
    desc: "A good-faith deposit with your offer that's credited back at closing.",
  },
  {
    title: "Inspection & appraisal",
    range: "$700 – $1,200",
    desc: "Paid during escrow to verify the home's condition and value.",
  },
  {
    title: "Cash reserves",
    range: "0 – 2 months",
    desc: "Some loans want to see a cushion of savings after closing.",
  },
  {
    title: "Moving & setup",
    range: "Varies",
    desc: "Movers, utilities, and those first furniture purchases — budget a little extra.",
  },
];

const documents = [
  "Last 30 days of pay stubs",
  "Two years of W-2s (and tax returns if self-employed)",
  "Two months of bank statements",
  "Government-issued photo ID",
  "Social Security number",
  "Proof of any additional income (bonus, commission, etc.)",
  "Gift letter, if using gift funds for the down payment",
];

const mistakes = [
  "Shopping before you're pre-approved — you may fall for a home outside your budget.",
  "Making a big purchase (car, furniture on credit) during underwriting.",
  "Changing jobs or opening new credit lines mid-process.",
  "Skipping the home inspection to make an offer more competitive.",
  "Forgetting to budget for closing costs and moving expenses.",
  "Emptying your savings — lenders like to see reserves left over.",
];

const glossary = [
  ["Pre-approval", "A lender's written estimate of how much you can borrow, based on verified income and credit."],
  ["APR vs. rate", "The interest rate is the cost of borrowing; APR bundles in certain fees, so it's slightly higher."],
  ["PMI", "Private mortgage insurance — usually required with less than 20% down on a conventional loan, and it can drop off later."],
  ["Escrow", "A neutral account that holds funds (and later your taxes/insurance) during and after the transaction."],
  ["DTI", "Debt-to-income ratio — your monthly debts divided by gross income; lenders use it to size your loan."],
  ["Contingency", "A condition in your offer (inspection, appraisal, financing) that lets you back out if it isn't met."],
];

const faqs = [
  ["How much do I really need for a down payment?", "Often far less than 20%. Conventional loans can start at 3% down, FHA at 3.5%, and VA/USDA at 0% for those who qualify. We'll help you find the lowest-cost path for your situation."],
  ["Does getting pre-approved hurt my credit?", "A pre-approval involves a credit check, which may cause a small, temporary dip. Multiple mortgage inquiries in a short window are typically counted as one, so it's safe to shop."],
  ["What credit score do I need?", "It varies by program — some start around 580, others prefer 620+. A higher score usually means a better rate, but there are options across the spectrum."],
  ["How long does buying a home take?", "From pre-approval to keys is commonly 30–45 days once you're under contract, though it depends on the home, your loan, and the market."],
  ["What if I've had credit bumps in the past?", "You still have options. FHA loans, in particular, are more forgiving of past issues. Let's talk through your specific situation."],
];

export default function FirstTimeBuyersPage() {
  return (
    <>
      <PageHero
        eyebrow="First-time buyer guide"
        title={
          <>
            Your first home,{" "}
            <span className="text-gradient">step by step</span>
          </>
        }
        subtitle="Buying your first home shouldn't feel overwhelming. Here's exactly how it works — from your first question to the day you get the keys."
      />

      <Container className="py-14">
        {/* Intro + quick actions */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="sm:col-span-2">
            <h2 className="text-xl font-bold text-ink-900">
              You&apos;re closer than you think
            </h2>
            <p className="mt-3 text-muted">
              Most first-time buyers overestimate what they need and
              underestimate what they qualify for. This guide walks you through
              every step in plain English so you can move forward with
              confidence. When you&apos;re ready, {site.loanOfficer} and the{" "}
              {site.company} team are here to help.
            </p>
          </Card>
          <Card className="bg-ink-900 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-crush-400">
              Fastest first step
            </p>
            <p className="mt-2 text-slate-300">
              Get pre-approved to unlock your real budget — free and no
              obligation.
            </p>
            <div className="mt-4">
              <Button href={site.applyUrl}>Get pre-approved</Button>
            </div>
          </Card>
        </div>

        {/* Journey */}
        <section className="mt-16">
          <Eyebrow>The journey</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            8 steps from &ldquo;maybe&rdquo; to move-in
          </h2>
          <ol className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <li
                key={s.t}
                className="flex gap-5 rounded-2xl border border-border bg-white p-6"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crush-500 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink-900">{s.t}</h3>
                  <p className="mt-1 text-muted">{s.d}</p>
                  {s.link && (
                    <a
                      href={s.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-crush-600 hover:text-crush-700"
                    >
                      {s.link.label} →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Costs */}
        <section className="mt-16">
          <Eyebrow>What to budget for</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            The real cost of buying
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Beyond the down payment, here&apos;s what to plan for. Not every line
            applies to every buyer — we&apos;ll give you exact numbers up front.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {costs.map((c) => (
              <Card key={c.title}>
                <p className="text-2xl font-extrabold text-crush-600">
                  {c.range}
                </p>
                <h3 className="mt-1 font-bold text-ink-900">{c.title}</h3>
                <p className="mt-1 text-sm text-muted">{c.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Down payment myth */}
        <section className="mt-16">
          <div className="grid items-center gap-8 rounded-3xl bg-surface p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <Eyebrow>Myth vs. reality</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
                You probably don&apos;t need 20% down
              </h2>
              <p className="mt-3 text-muted">
                It&apos;s the most common myth in homebuying. Plenty of programs
                let first-time buyers in with far less — and some with nothing
                down at all. The right program depends on your goals, credit, and
                location.
              </p>
              <div className="mt-6">
                <Button href="/loan-programs" variant="secondary">
                  Explore loan programs
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["3%", "Conventional (first-time)"],
                ["3.5%", "FHA"],
                ["0%", "VA (eligible)"],
                ["0%", "USDA (eligible areas)"],
              ].map(([pct, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-white p-5 text-center"
                >
                  <p className="text-3xl font-extrabold text-crush-600">{pct}</p>
                  <p className="mt-1 text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents + mistakes */}
        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <Card>
            <Eyebrow>Get ready</Eyebrow>
            <h2 className="mt-4 text-2xl font-bold text-ink-900">
              Documents to gather
            </h2>
            <ul className="mt-5 space-y-2.5">
              {documents.map((d) => (
                <li key={d} className="flex items-start gap-2 text-ink-800">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-1 h-4 w-4 shrink-0 text-crush-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M4 10l4 4 8-9" />
                  </svg>
                  <span className="text-sm">{d}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <Eyebrow>Steer clear</Eyebrow>
            <h2 className="mt-4 text-2xl font-bold text-ink-900">
              Common first-timer mistakes
            </h2>
            <ul className="mt-5 space-y-2.5">
              {mistakes.map((m) => (
                <li key={m} className="flex items-start gap-2 text-ink-800">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-crush-50 text-xs font-bold text-crush-600">
                    !
                  </span>
                  <span className="text-sm">{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Glossary */}
        <section className="mt-16">
          <Eyebrow>Plain English</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Terms you&apos;ll hear
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {glossary.map(([term, def]) => (
              <div key={term} className="rounded-2xl border border-border bg-white p-6">
                <h3 className="font-bold text-crush-600">{term}</h3>
                <p className="mt-1 text-sm text-muted">{def}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Frequently asked
          </h2>
          <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {faqs.map(([q, a]) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-ink-900 hover:bg-surface">
                  {q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-crush-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-14 text-center sm:px-16">
            <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
            <div
              className="absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-crush-500/25 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to take the first step?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Get a free, no-obligation pre-approval and find out exactly what
                you can afford.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button href={site.applyUrl}>Get pre-approved</Button>
                <Button href="/calculators" variant="secondary">
                  Estimate my payment
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                Questions? Call {site.loanOfficer} at{" "}
                <a
                  href={`tel:${site.phone}`}
                  className="font-semibold text-white hover:text-crush-400"
                >
                  {site.phone}
                </a>
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted">
          This guide is for educational purposes only and is not financial or
          lending advice. Program availability, costs, and timelines vary by
          borrower and are subject to full application and approval. Equal
          Housing Opportunity.
        </p>
      </Container>
    </>
  );
}
