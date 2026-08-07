import Link from "next/link";
import { Button, Container, Eyebrow } from "@/components/ui";
import { suite, stats } from "@/lib/data";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 hero-grid opacity-70" aria-hidden />
        <div
          className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-crush-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden
        />
        <Container className="relative py-20 sm:py-28">
          <Eyebrow>Built for realtors, powered by {site.company}</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Give your clients the{" "}
            <span className="text-gradient">edge</span>. Close deals faster.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            {site.brand} is the complete resource suite for real-estate
            professionals — calculators, loan guides, and co-marketing tools
            that make you the most valuable agent at every closing table.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/calculators" variant="primary">
              Explore the tools
            </Button>
            <Button href="/contact" variant="secondary">
              Partner with us
            </Button>
          </div>

          {/* Stats */}
          <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-extrabold text-white sm:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-slate-400">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ───────── Suite grid ───────── */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>The suite</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Everything you need in one place
            </h2>
            <p className="mt-4 text-lg text-muted">
              Four toolkits designed to help you win listings, guide buyers, and
              keep more of your closings on schedule.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {suite.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="card-hover group flex flex-col rounded-2xl border border-border bg-white p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-crush-50 text-3xl">
                    {f.icon}
                  </span>
                  <h3 className="text-xl font-bold text-ink-900">{f.title}</h3>
                </div>
                <p className="mt-4 text-muted">{f.blurb}</p>
                <ul className="mt-5 space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink-800">
                      <Check /> {p}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-crush-600">
                  Open {f.title}
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── Why partner ───────── */}
      <section className="bg-surface py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Why agents partner with us</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                A lending partner that makes you look great
              </h2>
              <p className="mt-4 text-lg text-muted">
                When your lender is fast, communicative, and equipped with the
                right tools, your clients notice — and they refer you again and
                again.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ["On-time closings", "Clear milestones and proactive updates so you never chase a status."],
                  ["Fast pre-approvals", "Same-day pre-approvals that make your buyers' offers stand out."],
                  ["Co-branded marketing", "Compliant flyers and social assets with your name front and center."],
                  ["Always reachable", "A real person who picks up the phone — evenings and weekends included."],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-4">
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-crush-500 text-white">
                      <Check light />
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{t}</p>
                      <p className="text-sm text-muted">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-white p-8 shadow-xl shadow-ink-900/5">
              <p className="text-sm font-semibold uppercase tracking-wider text-crush-600">
                Fast start
              </p>
              <h3 className="mt-2 text-2xl font-bold text-ink-900">
                Ready to CRUSH IT together?
              </h3>
              <p className="mt-3 text-muted">
                Get set up with co-branded materials and a direct line to your
                loan officer. It takes about 10 minutes.
              </p>
              <div className="mt-6 space-y-3">
                <Button href="/contact" className="w-full">
                  Become a partner agent
                </Button>
                <Button href="/co-marketing" variant="secondary" className="w-full">
                  See co-marketing tools
                </Button>
              </div>
              <p className="mt-6 border-t border-border pt-6 text-sm text-muted">
                Questions right now? Call{" "}
                <a
                  href={`tel:${site.phone}`}
                  className="font-semibold text-ink-900 hover:text-crush-600"
                >
                  {site.phone}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── CTA band ───────── */}
      <section className="py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-14 text-center sm:px-16">
            <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
            <div
              className="absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-crush-500/25 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your clients deserve a smoother path home.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Run the numbers, share a guide, and send a pre-approval — all
                from the same place.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button href="/calculators">Try a calculator</Button>
                <Button href="/loan-programs" variant="secondary">
                  Compare loan programs
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Check({ light = false }: { light?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`mt-0.5 h-4 w-4 shrink-0 ${light ? "text-white" : "text-crush-500"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10l4 4 8-9" />
    </svg>
  );
}

function Arrow() {
  return (
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
  );
}
