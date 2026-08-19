import Link from "next/link";
import { Container } from "@/components/ui";
import { site } from "@/lib/site";

/**
 * Public marketing homepage (logged-out only). The AppFrame gate redirects
 * signed-in users straight to their dashboard, and sends anyone hitting a tool
 * route to /login — so this is the full "front door" of the product.
 */

const FEATURES = [
  {
    eyebrow: "Co-branded flyers",
    title: "Professional listing & financing flyers in seconds",
    body: "Drop in an address and out comes a co-branded flyer with real financing scenarios, a shareable page, and a print-ready PDF with a QR code — your photo and logo already on it.",
    points: ["Auto-filled from your profile", "Estimated monthly payments", "Print or share instantly"],
    emoji: "🎨",
  },
  {
    eyebrow: "Open house tools",
    title: "Everything you need to run a standout open house",
    body: "Branded sign-in sheets, neighbor invites, follow-up templates, and financing one-sheets — a full kit that makes you look organized and buttoned-up.",
    points: ["Sign-in sheets & QR check-in", "Neighbor invitations", "Ready-to-send follow-ups"],
    emoji: "🏡",
  },
  {
    eyebrow: "Buyer & seller guides",
    title: "Client guides that come out branded to you",
    body: "Hand buyers and sellers a polished, co-branded guide that positions you as the expert — no design work, just add your info once.",
    points: ["First-time buyer guide", "Home seller guide", "Saved as a shareable PDF"],
    emoji: "📘",
  },
  {
    eyebrow: "Crush Stars",
    title: "Earn rewards every time you market",
    body: "Every flyer, guide, and tool you use earns Crush Stars ⭐ — climb from Starter to Crush Club, unlock achievements, and see where you rank.",
    points: ["Points for real activity", "Levels & achievement badges", "Agent leaderboard"],
    emoji: "⭐",
  },
];

const STEPS = [
  { n: "1", title: "Create your free account", body: "Sign up in under a minute — no credit card, free for partner agents." },
  { n: "2", title: "Set up your profile once", body: "Add your name, photo, brokerage, and DRE. It's saved and reused everywhere." },
  { n: "3", title: "Generate branded marketing", body: "Flyers, guides, and open-house tools come out co-branded to you, ready to send." },
];

export default function Home() {
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 hero-grid opacity-70" aria-hidden />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-crush-500/25 blur-3xl" aria-hidden />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />

        <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-crush-400">
              {site.brand} · by {site.company}
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your real estate business. <span className="text-gradient">One dashboard.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Market listings. Run buyer numbers. Create content. Prep open houses. Find loan
              programs. Earn rewards — all in one place, co-branded to you. Free for partner agents.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/25 transition-colors hover:bg-crush-600">
                Create Free Agent Account
              </Link>
              <Link href="#features" className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                Explore Realtor Tools
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              No credit card · Free for partner agents · Works on any device
            </p>
          </div>

          {/* App preview mock */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className="h-3 w-3 rounded-full bg-crush-500/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="rounded-xl bg-white p-5 text-ink-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Good morning</p>
                    <p className="text-lg font-bold">Welcome back 👋</p>
                  </div>
                  <span className="rounded-full bg-crush-50 px-3 py-1.5 text-sm font-bold text-crush-600">⭐ 128</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-muted">
                    <span>Pro</span><span>Elite · 250</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full w-[52%] rounded-full bg-crush-500" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[["🎨", "Flyer created", "+5 ⭐"], ["🏡", "Open house kit", "+10 ⭐"], ["📘", "Buyer guide", "+5 ⭐"], ["🧮", "Calculator", "+2 ⭐"]].map(([i, t, s]) => (
                    <div key={t} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                      <span className="text-lg" aria-hidden>{i}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t}</p>
                        <p className="text-xs font-bold text-crush-600">{s}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Trust bar */}
        <div className="relative border-t border-white/10">
          <Container className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
            {[["Free", "for partner agents"], ["1 profile", "reused everywhere"], ["Print & share", "ready in seconds"], ["Any device", "desktop or mobile"]].map(([a, b]) => (
              <div key={a} className="text-center">
                <p className="text-lg font-extrabold text-white">{a}</p>
                <p className="text-sm text-slate-400">{b}</p>
              </div>
            ))}
          </Container>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section id="features" className="scroll-mt-16 py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-crush-600">The suite</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Everything you need to market like a pro
            </h2>
            <p className="mt-4 text-lg text-muted">
              Powerful tools that make you the most valuable agent at every closing table — all
              co-branded to you and {site.company}.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="grid items-center gap-8 lg:grid-cols-2">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <p className="text-sm font-semibold uppercase tracking-wider text-crush-600">{f.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">{f.title}</h3>
                  <p className="mt-4 text-lg text-muted">{f.body}</p>
                  <ul className="mt-6 space-y-2.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-ink-800">
                        <Check /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="grid aspect-[4/3] place-items-center rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2">
                    <span className="text-7xl sm:text-8xl" aria-hidden>{f.emoji}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="bg-surface py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-crush-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Up and running in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-white p-7">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-crush-500 text-lg font-extrabold text-white">{s.n}</span>
                <h3 className="mt-5 text-xl font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/signup" className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600">
              Get started free
            </Link>
          </div>
        </Container>
      </section>

      {/* ───────── Why partner ───────── */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-crush-600">Why agents partner with us</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                A lending partner that makes you look great
              </h2>
              <p className="mt-4 text-lg text-muted">
                When your lender is fast, communicative, and equipped with the right tools, your
                clients notice — and they refer you again and again.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ["On-time closings", "Clear milestones and proactive updates so you never chase a status."],
                  ["Fast pre-approvals", "Same-day pre-approvals that make your buyers' offers stand out."],
                  ["Co-branded marketing", "Compliant flyers and social assets with your name front and center."],
                  ["Always reachable", "A real person who picks up the phone — evenings and weekends included."],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-4">
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-crush-500 text-white"><Check light /></span>
                    <div>
                      <p className="font-semibold text-ink-900">{t}</p>
                      <p className="text-sm text-muted">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-white p-8 shadow-xl shadow-ink-900/5">
              <blockquote className="text-lg font-medium text-ink-900">
                &ldquo;Everything I hand a client looks polished and it&apos;s already branded to me.
                I set it up once and now every flyer and guide takes me a couple of minutes.&rdquo;
              </blockquote>
              <p className="mt-5 text-sm font-semibold text-ink-900">Partner agent</p>
              <p className="text-sm text-muted">Long Beach, CA</p>
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-sm text-muted">Questions right now? Call{" "}
                  <a href={`tel:${site.phone}`} className="font-semibold text-ink-900 hover:text-crush-600">{site.phone}</a>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center sm:px-16">
            <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
            <div className="absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-crush-500/25 blur-3xl" aria-hidden />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Start marketing like the top agent in your market.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Create your free account and generate your first co-branded flyer in minutes.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/25 transition-colors hover:bg-crush-600">
                  Create your free account
                </Link>
                <Link href="/login" className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                  Log in
                </Link>
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
    <svg viewBox="0 0 20 20" className={`mt-0.5 h-4 w-4 shrink-0 ${light ? "text-white" : "text-crush-500"}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10l4 4 8-9" />
    </svg>
  );
}
