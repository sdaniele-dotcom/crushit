import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { GuideLibrary } from "@/components/GuideLibrary";
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
        {/* Co-branded client guides */}
        <div id="guides" className="mb-14 scroll-mt-24">
          <Eyebrow>Co-branded client guides</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Buyer &amp; seller guides — co-branded with you
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Beautiful, ready-to-share guides. Click download, add your name and
            contact info, and we&apos;ll instantly co-brand it with you and Crush
            Mortgage — no property details needed. Save it as a PDF and send it
            to your clients.
          </p>
          <div className="mt-8">
            <GuideLibrary />
          </div>
        </div>

        {/* Featured: full first-time buyer guide */}
        <Link
          href="/first-time-buyers"
          className="card-hover group mb-14 flex flex-col items-start justify-between gap-4 rounded-3xl bg-ink-900 p-8 text-white sm:flex-row sm:items-center"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-crush-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crush-400">
              Featured guide
            </span>
            <h2 className="mt-3 text-2xl font-bold">
              The complete First-Time Buyer Guide
            </h2>
            <p className="mt-1 max-w-xl text-slate-300">
              A full walkthrough — budgeting, down payment options, documents,
              costs, and FAQs. The perfect thing to share with a new buyer.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-crush-600">
            Read the guide →
          </span>
        </Link>

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
              <Link
                key={r.title}
                href={r.href}
                className="card-hover group flex flex-col rounded-2xl border border-border bg-white p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-ink-900">{r.title}</h3>
                  <span className="shrink-0 rounded-full bg-crush-50 px-3 py-1 text-xs font-semibold text-crush-700">
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
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-crush-600">
                  View the guide
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M4 10h12M11 5l5 5-5 5" />
                  </svg>
                </span>
              </Link>
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
