import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container, PageHero } from "@/components/ui";
import { TrustStrip } from "@/components/TrustStrip";
import { site } from "@/lib/site";
import headshot from "../../../public/team/shannon-daniele.jpg";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to a licensed loan officer about your numbers. Call, text or email — "
    + "free, with no obligation and nothing to sign.",
};

/**
 * A real contact page.
 *
 * It used to be a client component that redirected to /about#contact. A tab in
 * the nav that bounces you to an anchor on another page is the clearest sign
 * that a site is a brochure rather than a business, and "Contact" is the page
 * a nervous first-time buyer looks for before they look at anything else.
 *
 * NO FORM THAT PROMISES WHAT WE CANNOT CHECK. The quickest honest path is a
 * phone number and an email address that reach a person, so those lead. The
 * pre-approval link is for somebody who already knows what they want.
 */
export default function ContactPage() {
  const tel = site.phone.replace(/\D/g, "");

  return (
    <>
      <PageHero
        eyebrow="Talk to a person"
        title={
          <>
            Ask us <span className="text-gradient">anything</span>
          </>
        }
        subtitle="No script, no pressure, and no charge. Most questions take about ten minutes — including the ones people worry are too basic to ask."
      />

      <Container className="py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            <a
              href={`tel:${tel}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 transition-colors hover:border-crush-300 hover:bg-crush-50"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-crush-50 text-2xl" aria-hidden>📞</span>
              <div>
                <p className="font-bold text-ink-900">Call or text</p>
                <p className="text-lg font-semibold text-crush-600">{site.phone}</p>
                <p className="mt-0.5 text-sm text-muted">Fastest way to get an answer.</p>
              </div>
            </a>

            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 transition-colors hover:border-crush-300 hover:bg-crush-50"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-crush-50 text-2xl" aria-hidden>✉️</span>
              <div>
                <p className="font-bold text-ink-900">Email</p>
                <p className="text-lg font-semibold text-crush-600">{site.email}</p>
                <p className="mt-0.5 text-sm text-muted">Good for anything with numbers in it.</p>
              </div>
            </a>

            <a
              href={site.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 transition-colors hover:border-crush-300 hover:bg-crush-50"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-crush-50 text-2xl" aria-hidden>📋</span>
              <div>
                <p className="font-bold text-ink-900">Start a pre-approval</p>
                <p className="text-sm text-muted">
                  For when you already know what you want. Takes about fifteen minutes.
                </p>
              </div>
            </a>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="font-bold text-ink-900">Office</p>
              <p className="mt-1 text-sm text-muted">{site.address}</p>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-border bg-white p-6">
              {/* 640x640 source: keep it square rather than cropping a face into a letterbox. */}
              <Image
                src={headshot}
                alt={site.loanOfficer}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <p className="mt-4 text-lg font-bold text-ink-900">{site.loanOfficer}</p>
              <p className="text-sm text-muted">{site.title} · {site.company}</p>
              <p className="mt-2 text-xs text-muted">
                NMLS #{site.nmls} · Company NMLS #{site.companyNmls}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                You are not going to get a call centre. Ask the thing you think is a
                silly question — it almost certainly isn&apos;t, and it is almost
                certainly the one that matters.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-ink-900 p-6 text-center text-white">
              <p className="text-sm text-slate-300">Rather see the numbers yourself first?</p>
              <Link
                href="/calculators"
                className="mt-3 inline-flex items-center rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600"
              >
                Run a payment
              </Link>
            </div>
          </div>
        </div>

        <TrustStrip className="mx-auto mt-12 max-w-3xl text-center" />
      </Container>
    </>
  );
}
