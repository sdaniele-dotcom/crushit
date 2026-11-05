import Link from "next/link";
import { Container } from "@/components/ui";
import { Webinars } from "@/components/Webinars";
import { Guides } from "@/components/Guides";
import { site } from "@/lib/site";

/**
 * The public front door — and it is aimed at BUYERS now, not agents.
 *
 * It used to sell the agent suite: "Create Free Agent Account" above the fold,
 * four panels of co-branded marketing features. That is a recruiting page, and
 * a recruiting page generates recruits, not leads. Everything above the fold
 * now answers the question the brand is named after, and the webinars are the
 * reason to leave an email address.
 *
 * REALTORS ARE STILL SERVED, JUST NOT FIRST. They know who they are and they
 * arrive looking for the login, so a single clear "Are you a realtor?" line
 * does more for them than four panels did — and it stops the page talking to
 * two audiences at once, which is how a page ends up converting neither.
 *
 * The AppFrame gate still redirects signed-in users to their dashboard, so
 * this is only ever seen logged out.
 */

const PROMISES = [
  {
    emoji: "🧮",
    title: "The whole payment, not the teaser",
    body: "Principal, interest, taxes, insurance, mortgage insurance, HOA. The number that actually leaves your account each month — before you fall in love with a house.",
  },
  {
    emoji: "💵",
    title: "What you really need down",
    body: "Most people are wrong about this by a lot. There are programs for 5%, 3.5%, and sometimes nothing down. We'll show you which ones you'd qualify for.",
  },
  {
    emoji: "📊",
    title: "Rent vs own, with real numbers",
    body: "Not a slogan. Your rent, a real house price, today's rates — and what each one looks like in five years.",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 hero-grid opacity-70" aria-hidden />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-crush-500/25 blur-3xl" aria-hidden />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />

        <Container className="relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-crush-400">
              Free webinars · straight answers
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              So… <span className="text-gradient">what&apos;s a payment?</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Everybody quotes you a price. Almost nobody tells you what the month actually
              looks like. We do that — in free webinars, with real numbers, and no pressure
              to do anything about it.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/webinars"
                className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/25 transition-colors hover:bg-crush-600"
              >
                See the free webinars
              </Link>
              <Link
                href="/calculators"
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Run my numbers now
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Free · no credit check · nobody calls unless you ask
            </p>
          </div>
        </Container>

        {/*
          THE REALTOR DOOR. Low in the hero and unmistakable, because an agent
          arriving here is looking for a login and nothing else on this page is
          addressed to them.
        */}
        <div className="relative border-t border-white/10">
          <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-5 text-center">
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

      {/* ── Webinars: the reason to leave an email ────────────────────── */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-crush-600">
                Upcoming &amp; on demand
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Free webinars
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                Thirty minutes, plain English, and a real loan officer answering whatever you
                ask. Missed one? The replays are here too.
              </p>
            </div>
            <Link href="/webinars" className="text-sm font-semibold text-crush-600 hover:text-crush-700">
              See all webinars →
            </Link>
          </div>

          <div className="mt-8">
            <Webinars limit={4} />
          </div>
        </Container>
      </section>

      {/* ── Guides: the other reason to leave an email ────────────────── */}
      <section className="bg-surface py-20 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-crush-600">
                Read at your own pace
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Free buyer guides
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                How a first home becomes an investment, what $30,000 can actually do, and the
                numbers behind both.
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

      {/* ── What you'll actually learn ────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <Container>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            What you&apos;ll walk away knowing
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-white p-6">
                <span className="text-2xl" aria-hidden>{p.emoji}</span>
                <h3 className="mt-3 text-lg font-bold text-ink-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Tools ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="rounded-3xl border border-border bg-white p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
              Or skip the talking and get the number
            </h2>
            <p className="mt-3 max-w-2xl text-muted">
              Free, instant, and yours — no email required to use any of these.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { href: "/calculators", title: "Payment calculator", body: "The full monthly cost of any price." },
                { href: "/rent-vs-own", title: "Rent vs own", body: "What renting really costs over ten years." },
                { href: "/down-payment-assistance", title: "Down payment help", body: "Programs you might qualify for." },
              ].map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-crush-300 hover:bg-crush-50"
                >
                  <p className="font-bold text-ink-900">{t.title}</p>
                  <p className="mt-1 text-sm text-muted">{t.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="pb-24">
        <Container>
          <div className="rounded-3xl bg-ink-900 p-8 text-center text-white sm:p-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready when you are
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Come to a webinar, or have a loan officer run your actual numbers. Either way
              it&apos;s free, and there is nothing to sign.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/webinars"
                className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white hover:bg-crush-600"
              >
                Save a seat
              </Link>
              <Link
                href={site.applyUrl}
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10"
              >
                Get pre-approved
              </Link>
            </div>
            {/*
              The licensee, not the brand. This is a mortgage advertisement and
              it has to name the company that holds the licence.
            */}
            <p className="mt-8 text-xs text-slate-500">
              {site.company} · NMLS #{site.companyNmls} · Equal Housing Opportunity. This is not a
              commitment to lend.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
