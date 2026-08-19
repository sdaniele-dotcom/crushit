import Link from "next/link";
import { Container } from "@/components/ui";
import { site } from "@/lib/site";

/**
 * Public landing page (logged-out only). The AppFrame gate redirects
 * signed-in users straight to their dashboard, and sends anyone hitting a
 * tool route to /login — so this is the single "front door" of the site.
 */
export default function Home() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-ink-900 text-white">
      <div className="absolute inset-0 hero-grid opacity-70" aria-hidden />
      <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-crush-500/25 blur-3xl" aria-hidden />
      <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />

      <Container className="relative py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-crush-400">
            {site.brand} · by {site.company}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Run your real estate <span className="text-gradient">marketing</span>, all in one place.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            Log in to create co-branded flyers, open-house tools, and buyer &amp; seller
            guides. Set up your profile once — every tool fills in your name, photo, and
            logo automatically. Earn Crush Stars ⭐ as you go.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-crush-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/25 transition-colors hover:bg-crush-600"
            >
              Create your free account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
          </div>

          <ul className="mx-auto mt-14 grid max-w-xl gap-4 text-left sm:grid-cols-3">
            {[
              ["🎨", "Co-branded flyers", "Your branding, auto-filled"],
              ["🏡", "Open house tools", "Sign-in sheets & kits"],
              ["⭐", "Crush Stars", "Earn points & unlock levels"],
            ].map(([icon, title, blurb]) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <span className="text-2xl" aria-hidden>{icon}</span>
                <p className="mt-2 font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-sm text-slate-400">{blurb}</p>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-sm text-slate-400">
            Questions? Call{" "}
            <a href={`tel:${site.phone}`} className="font-semibold text-white hover:text-crush-400">
              {site.phone}
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
