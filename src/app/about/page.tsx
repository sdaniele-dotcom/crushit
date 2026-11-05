import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHero, Card } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { team } from "@/lib/data";
import { site } from "@/lib/site";
import { AgentOnly } from "@/components/auth/Audience";
import { TrustStrip } from "@/components/TrustStrip";

export const metadata: Metadata = {
  title: "About",
  description:
    "The mortgage team behind What's a Payment — who we are, who you'll actually talk to, and how to reach us.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            The people behind{" "}
            <span className="text-gradient">the numbers</span>
          </>
        }
        subtitle={`${site.brand} is the mortgage team at ${site.company} in Long Beach. We show people what a house actually costs each month — before they fall in love with one.`}
      />

      <Container className="py-14">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className="text-lg text-muted">
            Most people meet a lender at the worst possible moment — after they have
            found a house, fallen for it, and need a number by Friday. We would rather
            meet you a long way before that, when the question is still
            &ldquo;what can we actually afford?&rdquo; and the answer can still change
            what you look at.
          </p>
          <p className="mt-4 text-lg text-muted">
            So the calculators are free, the webinars are free, and nobody calls you
            because you used one. When you are ready, there is a licensed loan officer
            here who will run your real numbers and tell you plainly what they mean —
            including when the honest answer is &ldquo;wait six months&rdquo;.
          </p>
          <p className="mt-4 text-lg text-muted">
            {site.company} · Company NMLS #{site.companyNmls} · {site.address}
          </p>
        </div>

        {/* ── Team ─────────────────────────────────────────── */}
        <section id="team" className="scroll-mt-24 pt-16">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Meet the team</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Real people who pick up the phone, explain every step, and tell you the
            inconvenient thing when it is the true one.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {team.map((m) => {
              const phone = m.phone || site.phone;
              const email = m.email || site.email;
              return (
                <Card key={m.name} className="flex flex-col sm:flex-row sm:gap-6">
                  <div className="mb-4 shrink-0 sm:mb-0">
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={m.name}
                        width={112}
                        height={112}
                        className="h-28 w-28 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="grid h-28 w-28 place-items-center rounded-2xl bg-ink-900 text-2xl font-extrabold text-white ring-2 ring-crush-500/40">
                        {initials(m.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-ink-900">{m.name}</h3>
                    <p className="text-crush-600">{m.role}</p>
                    {m.nmls && <p className="mt-0.5 text-sm text-muted">NMLS #{m.nmls}</p>}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`tel:${phone}`} className="font-semibold text-ink-900 hover:text-crush-600">{phone}</a>
                      <a href={`mailto:${email}`} className="font-semibold text-ink-900 hover:text-crush-600">{email}</a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────── */}
        <section id="contact" className="scroll-mt-24 pt-16">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Contact us</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Ask us anything about payments, programs or what you can afford. We get
            back fast — often the same day.
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            {/* Form */}
            <Card className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold text-ink-900">Tell us what you need</h3>
              <p className="mt-2 text-muted">It takes about a minute. No credit pull to get started.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Card>

            {/* Details */}
            <div className="order-1 space-y-6 lg:order-2">
              <Card className="bg-ink-900 text-white">
                <p className="text-sm font-semibold uppercase tracking-wider text-crush-400">Your loan officer</p>
                <h3 className="mt-2 text-2xl font-bold">{site.loanOfficer}</h3>
                <p className="text-slate-400">{site.title} · NMLS #{site.nmls}</p>
                <div className="mt-6 space-y-3 text-sm">
                  <a href={`tel:${site.phone}`} className="flex items-center gap-3 text-slate-200 hover:text-crush-400"><IconPhone /> {site.phone}</a>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-slate-200 hover:text-crush-400"><IconMail /> {site.email}</a>
                  <p className="flex items-center gap-3 text-slate-200"><IconPin /> {site.address}</p>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-ink-900">Prefer to talk now?</h3>
                <p className="mt-2 text-sm text-muted">
                  Call or text {site.loanOfficer} directly. Evenings and weekends are
                  fine — house hunting doesn&apos;t keep business hours.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={site.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">
                    Apply online →
                  </a>
                  <a href={`tel:${site.phone}`} className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface">
                    Call {site.phone}
                  </a>
                </div>
              </Card>

              {/* Agent-only: a buyer has no use for a co-branding kit. */}
              <AgentOnly>
                <Card className="bg-surface">
                  <h3 className="font-bold text-ink-900">For agents</h3>
                  <p className="mt-2 text-sm text-muted">
                    Ready to co-market? Mention you&apos;re an agent in the form and we&apos;ll send
                    over the partnership kit and co-branding agreement.
                  </p>
                </Card>
              </AgentOnly>
            </div>
          </div>
        </section>

        <TrustStrip className="mx-auto mt-14 max-w-3xl text-center" />
      </Container>
    </>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-crush-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-crush-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-crush-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
