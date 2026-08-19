import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the Crush It Realtors Suite and Crush Mortgage — who we are, meet the team, and how to reach us.",
};

const SUBPAGES = [
  {
    href: "/team",
    emoji: "👋",
    title: "Meet the team",
    blurb: "The real people behind Crush Mortgage — who you'll actually talk to.",
  },
  {
    href: "/contact",
    emoji: "✉️",
    title: "Contact us",
    blurb: "Questions, a pre-approval, or want to team up? We usually reply same day.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            Built for realtors, powered by{" "}
            <span className="text-gradient">{site.company}</span>
          </>
        }
        subtitle={`${site.brand} is the Realtors Suite by ${site.company} — one place to run your marketing: co-branded flyers, open house tools, and buyer & seller guides that put your name front and center.`}
      />

      <Container className="py-14">
        <div className="max-w-3xl">
          <p className="text-lg text-muted">
            We&apos;re a mortgage team that believes the best way to help realtors win is to
            make them look great in front of their clients — with fast pre-approvals,
            on-time closings, and marketing that&apos;s ready to go. Set up your profile once
            and every tool fills in your branding automatically, so you spend less time on
            busywork and more time closing deals.
          </p>
          <p className="mt-4 text-lg text-muted">
            {site.company} · Company NMLS #{site.companyNmls} · {site.address}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {SUBPAGES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="card-hover group flex flex-col rounded-2xl border border-border bg-white p-7"
            >
              <span className="text-3xl" aria-hidden>{s.emoji}</span>
              <h2 className="mt-3 text-xl font-bold text-ink-900">{s.title}</h2>
              <p className="mt-2 flex-1 text-muted">{s.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-crush-600">
                {s.title}
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Prefer to talk now? Call{" "}
          <a href={`tel:${site.phone}`} className="font-semibold text-ink-900 hover:text-crush-600">
            {site.phone}
          </a>
          .
        </p>
      </Container>
    </>
  );
}
