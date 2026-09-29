import type { Metadata } from "next";
import { Container, PageHero, Button, Card, Eyebrow } from "@/components/ui";
import { DownPaymentTool } from "@/components/DownPaymentTool";
import { site } from "@/lib/site";
import {
  KINDS,
  LEVERS,
  PLAYS,
  REALITIES,
  NEEDED,
  SOURCE_NOTE,
} from "@/lib/dpaGuide";

export const metadata: Metadata = {
  title: "Down Payment Assistance",
  description:
    "Check a California address against thousands of down payment assistance programs — grants, forgivable seconds, deferred loans and MCCs from cities, counties, the state and employers. Plus how agents actually use it on listings and buyers.",
};

export default function DownPaymentAssistancePage() {
  return (
    <>
      <PageHero
        eyebrow="Buyer tools"
        title={
          <>
            Down payment <span className="text-gradient">assistance</span>
          </>
        }
        subtitle="Thousands of California programs, and most buyers have never heard of one of them. Run an address and a household income and see what matches — then use it on your listings, not just your buyers."
      />

      <Container className="py-14">
        {/*
          The tool goes first. Everything below it is context for the answer,
          and an agent who came here from an email already knows why they came.
        */}
        <DownPaymentTool title="Check an address for assistance programs" />

        <Card className="mt-6 bg-crush-50">
          <p className="text-sm font-bold text-ink-900">
            Have these ready before you start
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {NEEDED.map((n) => (
              <li key={n} className="flex gap-2.5 text-sm text-ink-800">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* ── The agent angle, before the buyer education ───────────────── */}
        <div className="mt-14">
          <Eyebrow>How agents use this</Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-ink-800">
          Most agents treat assistance as something you check once a buyer is
          stuck. The bigger use is the listing side — because eligibility is
          frequently tied to the address rather than the person.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {PLAYS.map((p) => (
            <Card key={p.title}>
              <p className="text-sm font-bold text-ink-900">{p.title}</p>
              <p className="mt-1.5 text-sm text-muted">{p.body}</p>
            </Card>
          ))}
        </div>

        {/* ── What the money actually is ────────────────────────────────── */}
        <div className="mt-14">
          <Eyebrow>What assistance actually looks like</Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-ink-800">
          Buyers hear &ldquo;assistance&rdquo; and picture free money. Some of it
          is. Most of it is a second lien with terms worth understanding before
          anyone writes an offer.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {KINDS.map((k) => (
            <Card key={k.name}>
              <p className="text-sm font-bold text-ink-900">{k.name}</p>
              <p className="mt-1.5 text-sm text-muted">{k.body}</p>
            </Card>
          ))}
        </div>

        {/* ── Eligibility levers ───────────────────────────────────────── */}
        <div className="mt-14">
          <Eyebrow>What eligibility turns on</Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-ink-800">
          Every program sets its own rules, but they pull on the same handful of
          levers. Knowing which ones are in play tells you what to ask.
        </p>
        <Card className="mt-5 p-6">
          <ul className="space-y-4">
            {LEVERS.map((l) => (
              <li key={l.name} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                <span className="text-sm text-ink-800">
                  <span className="font-bold text-ink-900">{l.name}.</span>{" "}
                  {l.body}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* ── The parts that go wrong ──────────────────────────────────── */}
        <div className="mt-14">
          <Eyebrow>Before you write the offer</Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-ink-800">
          Assistance is worth chasing and it is not free of friction. These are
          the five things that turn a match into a problem.
        </p>
        <div className="mt-5 space-y-4">
          {REALITIES.map((r) => (
            <Card key={r.title}>
              <p className="text-sm font-bold text-ink-900">{r.title}</p>
              <p className="mt-1.5 text-sm text-muted">{r.body}</p>
            </Card>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Found a program? Let&apos;s confirm it.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Send your buyer through a pre-approval and we&apos;ll check the
            assistance against a real first mortgage — what it can be layered
            with, what it adds to the timeline, and what the monthly number
            actually becomes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href={site.applyUrl}>Start a pre-approval</Button>
            <Button href="/calculators" variant="secondary">
              Run the payment first
            </Button>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">{SOURCE_NOTE}</p>
      </Container>
    </>
  );
}
