import type { Metadata } from "next";
import { Container, PageHero, Card } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get Pre-Approved",
  description:
    "Start a fast, no-obligation pre-approval or partner with Crush Mortgage. Reach your loan officer directly.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Let's connect"
        title={
          <>
            Start a pre-approval or{" "}
            <span className="text-gradient">partner</span> with us
          </>
        }
        subtitle="Whether you're an agent looking to team up or a buyer ready to move, we'll get back to you fast — often the same day."
      />

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Form */}
          <Card className="order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-ink-900">
              Tell us what you need
            </h2>
            <p className="mt-2 text-muted">
              It takes about a minute. No credit pull to get started.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>

          {/* Contact details */}
          <div className="order-1 space-y-6 lg:order-2">
            <Card className="bg-ink-900 text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-crush-400">
                Your loan officer
              </p>
              <h3 className="mt-2 text-2xl font-bold">{site.loanOfficer}</h3>
              <p className="text-slate-400">
                {site.title} · NMLS #{site.nmls}
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <a
                  href={`tel:${site.phone}`}
                  className="flex items-center gap-3 text-slate-200 hover:text-crush-400"
                >
                  <IconPhone /> {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 text-slate-200 hover:text-crush-400"
                >
                  <IconMail /> {site.email}
                </a>
                <p className="flex items-center gap-3 text-slate-200">
                  <IconPin /> {site.address}
                </p>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-ink-900">Prefer to talk now?</h3>
              <p className="mt-2 text-sm text-muted">
                Call or text {site.loanOfficer} directly. Evenings and weekends
                welcome — we know deals don&apos;t wait for business hours.
              </p>
              <a
                href={`tel:${site.phone}`}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface"
              >
                Call {site.phone}
              </a>
            </Card>

            <Card className="bg-surface">
              <h3 className="font-bold text-ink-900">For agents</h3>
              <p className="mt-2 text-sm text-muted">
                Ready to co-market? Mention you&apos;re an agent in the form and
                we&apos;ll send over the partnership kit and co-branding
                agreement.
              </p>
            </Card>
          </div>
        </div>
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
