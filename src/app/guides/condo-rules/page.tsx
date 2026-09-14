import type { Metadata } from "next";
import { Container, PageHero, Button, Card, Eyebrow } from "@/components/ui";
import { CondoGuideDownload } from "@/components/CondoGuideDownload";
import {
  TIMELINE,
  REVIEW_DOCS,
  RESERVE_MATH,
  DISQUALIFIERS,
  STILL_EASIER,
  CALIFORNIA,
  IF_IT_FAILS,
  CHECKLIST,
  MISREADS,
  SOURCE_NOTE,
  type Section,
} from "@/lib/condoGuide";

export const metadata: Metadata = {
  title: "The 2026 Condo Rules",
  description:
    "Limited Review is gone and reserve minimums are rising. What changed, what a full project review now asks for, what sinks a project, and what to check before you take a condo listing.",
};

function GuideSection({ section }: { section: Section }) {
  return (
    <>
      <div className="mt-12">
        <Eyebrow>{section.heading}</Eyebrow>
      </div>
      {section.intro ? <p className="mt-3 text-ink-800">{section.intro}</p> : null}
      <Card className="mt-5 p-6">
        <ul className="space-y-3">
          {section.items.map((i) => (
            <li key={i} className="flex gap-3 text-sm text-ink-800">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

export default function CondoRulesPage() {
  return (
    <>
      <PageHero
        eyebrow="Agent guide"
        title={
          <>
            The 2026 <span className="text-gradient">condo rules</span>
          </>
        }
        subtitle="Limited Review is gone and reserve minimums are rising. What changed, what a full review now asks for, what actually sinks a project — and what to check before you take the listing."
      />

      <Container className="py-14">
        <div className="rounded-2xl border border-crush-500/40 bg-crush-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-crush-700">
            The short version
          </p>
          <p className="mt-2 text-ink-800">
            Since <strong>August 3, 2026</strong>, most established condo projects need a{" "}
            <strong>full project review</strong> — Limited Review is retired. On{" "}
            <strong>January 4, 2027</strong>, minimum reserves rise from{" "}
            <strong>10% to 15%</strong> of the association&apos;s annual budgeted assessment income.
            HOA questionnaires, budgets and reserve studies are gating documents now, not paperwork.
          </p>
        </div>

        <div className="mt-12">
          <Eyebrow>What changed and when</Eyebrow>
        </div>
        <div className="mt-5 space-y-3">
          {TIMELINE.map((t) => (
            <Card key={t.date} className="flex flex-col gap-2 p-5 sm:flex-row sm:gap-6">
              <div className="sm:w-40 sm:shrink-0">
                <p className="font-bold text-ink-900">{t.date}</p>
                <p
                  className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${
                    t.passed ? "text-crush-600" : "text-muted"
                  }`}
                >
                  {t.passed ? "In effect" : "Upcoming"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-ink-900">{t.title}</p>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <GuideSection section={REVIEW_DOCS} />
        <GuideSection section={RESERVE_MATH} />
        <GuideSection section={DISQUALIFIERS} />
        <GuideSection section={STILL_EASIER} />
        <GuideSection section={CALIFORNIA} />
        <GuideSection section={IF_IT_FAILS} />

        <div className="mt-12">
          <Eyebrow>Ask the HOA before you list</Eyebrow>
        </div>
        <Card className="mt-5 p-6">
          <ul className="space-y-3">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex gap-3 text-sm text-ink-800">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-12">
          <Eyebrow>What people get wrong</Eyebrow>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {MISREADS.map(([q, a]) => (
            <Card key={q} className="p-5">
              <p className="font-semibold text-ink-900">{q}</p>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-ink-900">Take it with you</p>
            <p className="mt-1 text-sm text-muted">
              The whole guide as a PDF — your name, headshot and brokerage logo at the top, the Crush
              team at the bottom. Hand it to a seller or a board.
            </p>
          </div>
          <CondoGuideDownload className="shrink-0" />
        </Card>

        <Card className="mt-6 flex flex-col items-start justify-between gap-4 bg-surface p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-ink-900">Got a condo under contract?</p>
            <p className="mt-1 text-sm text-muted">
              Send us the address and we&apos;ll check the project before you list it — no cost, no
              obligation.
            </p>
          </div>
          <Button href="/contact" className="shrink-0">
            Ask us to check a project
          </Button>
        </Card>

        <p className="mt-10 text-xs leading-relaxed text-muted">{SOURCE_NOTE}</p>
      </Container>
    </>
  );
}
