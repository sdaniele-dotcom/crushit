import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Co-Marketing Toolkit",
  description:
    "Co-branded flyers, social posts, open-house resources, and lead tools to grow your business together with Crush Mortgage.",
};

const assets = [
  {
    icon: "📘",
    title: "Co-branded buyer & seller guides",
    desc: "Beautiful First-Time Homebuyer's and Home Seller's guides — auto co-branded with your name, photo, and contact info. Add your details and save as a PDF to share.",
    tags: ["Buyer guide", "Seller guide", "Save as PDF"],
    href: "/co-marketing/guides",
    cta: "Co-brand a guide",
  },
  {
    icon: "📄",
    title: "Co-branded flyers",
    desc: "Property flyers, financing highlight sheets, and 'just listed' one-pagers with your name and photo alongside ours.",
    tags: ["Print-ready PDF", "Editable"],
    href: "/co-brand",
    cta: "Make a flyer",
  },
  {
    icon: "📱",
    title: "Social media kit",
    desc: "Ready-to-post graphics and captions for new listings, rate updates, and buyer tips — all compliant and on-brand.",
    tags: ["Instagram", "Facebook", "Stories"],
    href: "/co-marketing/social-kit",
    cta: "Get the captions",
  },
  {
    icon: "🏡",
    title: "Open house kit",
    desc: "A printable sign-in sheet, a before/during/after checklist, and follow-up templates that turn open-house traffic into buyers.",
    tags: ["Sign-in sheet", "Checklist", "Follow-ups"],
    href: "/co-marketing/open-house-kit",
    cta: "Open the kit",
  },
  {
    icon: "✉️",
    title: "Email templates",
    desc: "Nurture sequences for new leads, past clients, and 'thinking about selling' homeowners — co-branded and ready to send.",
    tags: ["Drip campaigns"],
    href: "/co-marketing/email-templates",
    cta: "Get the templates",
  },
  {
    icon: "🎥",
    title: "Video scripts",
    desc: "Short-form scripts for market updates and buyer tips you can film in minutes to stay top-of-mind.",
    tags: ["Reels", "Shorts"],
    href: "/co-marketing/video-scripts",
    cta: "Get the scripts",
  },
  {
    icon: "📊",
    title: "Buyer guides & checklists",
    desc: "Client-ready guides — first-time buyer steps, document checklists, and closing timelines you can share or hand out.",
    tags: ["Client-ready", "Printable"],
    href: "/resources",
    cta: "Browse guides",
  },
];

const playbook = [
  ["Pick your assets", "Choose the co-branded materials that fit your next listing or campaign."],
  ["We co-brand them", "Your name, photo, and contact info added alongside your loan officer — compliant and fast."],
  ["Launch together", "Post, print, or email. We amplify from our channels too."],
  ["Capture & follow up", "Leads route to both of us so no opportunity slips through."],
];

export default function CoMarketingPage() {
  return (
    <>
      <PageHero
        eyebrow="Co-marketing toolkit"
        title={
          <>
            Grow your business{" "}
            <span className="text-gradient">together</span> with us
          </>
        }
        subtitle="Compliant, co-branded marketing that puts your name front and center. We handle the design and the mortgage expertise — you get the credit."
      />

      <Container className="py-14">
        {/* Asset grid */}
        <Eyebrow>What&apos;s included</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
          A full marketing department, on the house
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="card-hover group flex flex-col rounded-2xl border border-border bg-white p-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-crush-50 text-2xl">
                {a.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{a.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {a.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-crush-600">
                {a.cta}
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* Playbook */}
        <div className="mt-16 grid items-center gap-12 rounded-3xl bg-ink-900 p-8 text-white sm:p-12 lg:grid-cols-2">
          <div>
            <Eyebrow>The partnership playbook</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
              Four steps to co-marketing that works
            </h2>
            <p className="mt-4 text-slate-300">
              A simple, repeatable system that keeps both of our names in front
              of buyers and sellers all year long.
            </p>
            <div className="mt-6">
              <Button href="/contact">Start co-marketing</Button>
            </div>
          </div>
          <ol className="space-y-5">
            {playbook.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crush-500 font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{t}</p>
                  <p className="text-sm text-slate-400">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Instant co-branded flyer */}
        <Link
          href="/co-brand"
          className="card-hover group mt-14 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-white p-8 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-crush-50 text-3xl">
              🪄
            </span>
            <div>
              <span className="inline-flex items-center rounded-full bg-crush-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crush-700">
                Instant &amp; free
              </span>
              <h3 className="mt-2 text-xl font-bold text-ink-900">
                Generate a co-branded property flyer
              </h3>
              <p className="mt-1 max-w-xl text-muted">
                Enter your info and a listing to instantly create a co-branded
                flyer with financing scenarios and a print-ready PDF — no design
                work, no waiting.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-crush-600">
            Make my flyer →
          </span>
        </Link>

        {/* Compliance note */}
        <Card className="mt-8 bg-surface">
          <h3 className="text-lg font-bold text-ink-900">
            Compliant by design
          </h3>
          <p className="mt-2 text-sm text-muted">
            All co-marketing follows RESPA guidelines — costs for shared
            marketing are split based on fair-market value and the pro-rata
            share of each party&apos;s promotion. We keep the paperwork clean so
            you can focus on selling. Ask {site.loanOfficer} for the co-marketing
            agreement to get started.
          </p>
        </Card>
      </Container>
    </>
  );
}
