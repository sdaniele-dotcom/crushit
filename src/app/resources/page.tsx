import type { Metadata } from "next";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { resources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Buyer Resources",
  description:
    "Share-ready guides and checklists — first-time buyer roadmap, document checklist, glossary, and closing-day prep.",
};

const steps = [
  { n: 1, t: "Get pre-approved", d: "Know the real budget before the first showing." },
  { n: 2, t: "Shop with confidence", d: "Tour homes that fit the approved price range." },
  { n: 3, t: "Make a strong offer", d: "A verified pre-approval makes offers stand out." },
  { n: 4, t: "Under contract", d: "Inspection, appraisal, and underwriting begin." },
  { n: 5, t: "Clear to close", d: "Final approval, walkthrough, and signing." },
  { n: 6, t: "Get the keys", d: "Fund, record, and celebrate a new home." },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Buyer resources"
        title={
          <>
            Be the most <span className="text-gradient">helpful</span> agent in
            the room
          </>
        }
        subtitle="Guides and checklists you can hand a client on day one. They reduce anxiety, prevent surprises, and make you look like a pro."
      />

      <Container className="py-14">
        {/* Homebuying journey */}
        <Eyebrow>The homebuying journey</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
          Six steps from pre-approval to keys
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.n} className="relative overflow-hidden">
              <span className="absolute -right-2 -top-3 text-7xl font-black text-surface-2 select-none">
                {s.n}
              </span>
              <div className="relative">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-crush-500 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold text-ink-900">{s.t}</h3>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Resource guides */}
        <div className="mt-16">
          <Eyebrow>Share-ready guides</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Checklists your clients will actually use
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {resources.map((r) => (
              <Card key={r.title} className="card-hover flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-ink-900">{r.title}</h3>
                  <span className="rounded-full bg-crush-50 px-3 py-1 text-xs font-semibold text-crush-700">
                    {r.audience}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{r.description}</p>
                <ul className="mt-4 space-y-2">
                  {r.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2 text-sm text-ink-800"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Want these as branded PDFs?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            We&apos;ll co-brand every guide with your name and photo so your
            clients remember exactly who guided them home.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/co-marketing">See co-marketing tools</Button>
            <Button href="/contact" variant="secondary">
              Request branded guides
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
