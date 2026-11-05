import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { Webinars } from "@/components/Webinars";
import { Guides } from "@/components/Guides";
import { TrustStrip, TrustStripCompact } from "@/components/TrustStrip";
import { site } from "@/lib/site";
import { loanPrograms } from "@/lib/data";
import { topFaqs } from "@/lib/faqs";
import headshot from "../../public/team/shannon-daniele.jpg";

/**
 * The public front door, built to read like a mortgage company's site rather
 * than a SaaS landing page.
 *
 * WHAT CHANGED AND WHY. The previous version led with webinars and guides,
 * which are lead magnets — things you offer someone who already trusts you.
 * A visitor who has never heard of us arrives asking three questions in this
 * order: who are you, can you actually lend to someone like me, and what will
 * it cost. The page now answers them in that order, and the magnets sit where
 * they earn their keep, after the answer.
 *
 * A NAMED PERSON WITH A FACE, because mortgage is a trust purchase and
 * "Our team of experts" is what a page says when it has nobody to name. The
 * licence numbers under the headshot are doing the same job.
 *
 * NO TESTIMONIALS SECTION. There is one in every competitor's layout and it
 * would be trivial to mock up — which is exactly why it is not here. Real
 * quotes from real clients, or nothing.
 *
 * The AppFrame gate redirects signed-in users to their dashboard, so this is
 * only ever seen logged out.
 */

/** Answering "can you lend to someone like me" with the real programs. */
const FEATURED = ["conventional", "fha", "va"];

const STEPS = [
  { n: "1", title: "Tell us the house", body: "A price, or an address you saw on Zillow at midnight. That's enough to start." },
  { n: "2", title: "See the real number", body: "Principal, interest, taxes, insurance, mortgage insurance, HOA — the whole payment, not the teaser." },
  { n: "3", title: "Find the right program", body: "Conventional, FHA, VA, and the down-payment help most buyers never hear about." },
  { n: "4", title: "Get pre-approved", body: "When you're ready — and not before. Plenty of people stop at step two, and that's fine." },
];


export default function Home() {
  const featured = FEATURED.map((s) => loanPrograms.find((p) => p.slug === s)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <>
      {/* ── Hero: who we are, what we do, a face ─────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 hero-grid opacity-70" aria-hidden />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-crush-500/25 blur-3xl" aria-hidden />

        <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-crush-400">
              Mortgage lending · Long Beach, California
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl">
              Know what the month costs{" "}
              <span className="text-gradient">before you fall in love with a house.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Everybody quotes you a price. Almost nobody shows you the payment — taxes,
              insurance and all. We do that first, for free, whether or not you ever borrow
              a dollar from us.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/calculators"
                className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/25 transition-colors hover:bg-crush-600"
              >
                See my payment
              </Link>
              <Link
                href={site.applyUrl}
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Get pre-approved
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {["Free, no credit check to start", "Conventional · FHA · VA · Jumbo", "Down-payment help included"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-crush-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* A named person, because mortgage is a trust purchase. */}
          <div className="justify-self-center lg:justify-self-end">
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Image
                src={headshot}
                alt={site.loanOfficer}
                className="aspect-square w-full rounded-xl object-cover"
                priority
              />
              <p className="mt-4 text-lg font-bold">{site.loanOfficer}</p>
              <p className="text-sm text-slate-300">{site.title} · {site.company}</p>
              <p className="mt-2 text-xs text-slate-400">
                NMLS #{site.nmls} · Company NMLS #{site.companyNmls}
              </p>
              <a
                href={`tel:${site.phone.replace(/\D/g, "")}`}
                className="mt-4 block rounded-full bg-white/10 py-2.5 text-center text-sm font-semibold hover:bg-white/20"
              >
                {site.phone}
              </a>
            </div>
          </div>
        </Container>

        {/* The realtor door. Unmistakable, and not competing with the hero. */}
        <div className="relative border-t border-white/10">
          <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-4 text-center">
            <span className="text-sm text-slate-400">Are you a realtor?</span>
            <Link
              href="/login"
              className="text-sm font-semibold text-white underline decoration-crush-400 decoration-2 underline-offset-4 hover:text-crush-300"
            >
              Log in here
            </Link>
            <span className="text-sm text-slate-500">
              · or <Link href="/signup" className="underline hover:text-slate-300">request access</Link> to the partner suite
            </span>
          </Container>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Buying a house shouldn&apos;t start with a guess.
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
              <p>
                You find a house you like. The listing says $750,000. Somewhere online a
                calculator says your payment is $4,100 — and it has quietly left out the
                property taxes, the insurance and the mortgage insurance. The real number is
                closer to $5,400, and nobody tells you until you are already attached.
              </p>
              <p>
                Then there is the part nobody mentions at all: that there are programs for
                3% down, for 3.5% down, for nothing down, and assistance money sitting
                unclaimed because the people it was written for never heard of it.
              </p>
              <p className="font-semibold text-ink-900">That&apos;s the gap we exist to close.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            How this actually goes
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-white p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-crush-500 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 text-base font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Loan options: "can you lend to someone like me" ──────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                A loan for your situation
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                Not everybody fits the same box — and most people fit more boxes than they
                think.
              </p>
            </div>
            <Link href="/loan-programs" className="text-sm font-semibold text-crush-600 hover:text-crush-700">
              See all programs →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <div key={p.slug} className="flex flex-col rounded-2xl border border-border bg-white p-6">
                <h3 className="text-xl font-bold text-ink-900">{p.name}</h3>
                <p className="mt-1 text-sm font-medium text-crush-600">{p.tagline}</p>
                <p className="mt-3 text-sm text-muted">
                  <span className="font-semibold text-ink-900">Best for:</span> {p.bestFor}
                </p>
                <div className="mt-4 flex gap-6 border-y border-border py-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Min down</p>
                    <p className="font-bold text-ink-900">{p.minDown}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Min credit</p>
                    <p className="font-bold text-ink-900">{p.minCredit}</p>
                  </div>
                </div>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted">
                  {p.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-400" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/loan-programs#${p.slug}`}
                  className="mt-5 text-sm font-semibold text-crush-600 hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Tools ────────────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Free tools, no email required
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Use them as much as you like. Nobody calls you unless you ask.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/calculators", title: "Payment calculator", body: "The full monthly cost of any price." },
              { href: "/rent-vs-own", title: "Rent vs own", body: "What renting really costs over ten years." },
              { href: "/down-payment-assistance", title: "Down payment help", body: "Programs you may qualify for." },
              { href: "/first-time-buyers", title: "First-time buyers", body: "Start here if this is your first." },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-2xl border border-border bg-white p-5 transition-colors hover:border-crush-300 hover:bg-crush-50"
              >
                <p className="font-bold text-ink-900">{t.title}</p>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Webinars ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Free webinars
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                Thirty minutes, plain English, and a real loan officer answering whatever you
                ask. Replays are here too.
              </p>
            </div>
            <Link href="/webinars" className="text-sm font-semibold text-crush-600 hover:text-crush-700">
              See all webinars →
            </Link>
          </div>
          <div className="mt-8">
            <Webinars limit={2} />
          </div>
        </Container>
      </section>

      {/* ── Guides ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Guides worth reading
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                How a first home becomes an investment, and the numbers behind it.
              </p>
            </div>
            <Link href="/guides-library" className="text-sm font-semibold text-crush-600 hover:text-crush-700">
              See all guides →
            </Link>
          </div>
          <div className="mt-8">
            <Guides limit={3} />
          </div>
        </Container>
      </section>

      {/* ── FAQ: a taste, not the whole page ────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Questions people actually ask
            </h2>
            <Link href="/faq" className="text-sm font-semibold text-crush-600 hover:text-crush-700">
              All questions →
            </Link>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {topFaqs.slice(0, 4).map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-bold text-ink-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted">
            Something not answered here?{" "}
            <Link href="/contact" className="font-semibold text-crush-600 hover:underline">
              Ask us directly
            </Link>{" "}
            — it costs nothing and we answer either way.
          </p>
        </Container>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="pb-20">
        <Container>
          <div className="rounded-3xl bg-ink-900 p-8 text-center text-white sm:p-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Let&apos;s find your number
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Run it yourself in two minutes, or call and we&apos;ll run it with you. Either
              way it&apos;s free, and there is nothing to sign.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/calculators"
                className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white hover:bg-crush-600"
              >
                See my payment
              </Link>
              <a
                href={`tel:${site.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10"
              >
                Call {site.phone}
              </a>
            </div>
            <TrustStripCompact className="mt-8" />
          </div>

          <TrustStrip className="mx-auto mt-8 max-w-3xl text-center" />
        </Container>
      </section>
    </>
  );
}
