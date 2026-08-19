import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, PageHero, Button, Card } from "@/components/ui";
import { team } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the Crush Mortgage team — the people behind the CRUSH IT Realtors Suite who help buyers and partner agents close with confidence.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Our team"
        title={
          <>
            The people behind{" "}
            <span className="text-gradient">Crush Mortgage</span>
          </>
        }
        subtitle="Real people who pick up the phone, communicate every step, and treat your clients like their own. Reach out any time."
      />

      <Container className="py-14">
        <Link href="/about" className="text-sm font-semibold text-crush-600">← About</Link>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {team.map((m) => {
            const phone = m.phone || site.phone;
            const email = m.email || site.email;
            return (
              <Card key={m.name} className="flex flex-col sm:flex-row sm:gap-6">
                {/* Avatar */}
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

                {/* Details */}
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-ink-900">{m.name}</h2>
                  <p className="text-crush-600">{m.role}</p>
                  {m.nmls && (
                    <p className="mt-0.5 text-sm text-muted">NMLS #{m.nmls}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a
                      href={`tel:${phone}`}
                      className="font-semibold text-ink-900 hover:text-crush-600"
                    >
                      {phone}
                    </a>
                    <a
                      href={`mailto:${email}`}
                      className="font-semibold text-ink-900 hover:text-crush-600"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Company card */}
        <Card className="mt-10 bg-surface text-center">
          <h3 className="text-lg font-bold text-ink-900">{site.company}</h3>
          <p className="mt-1 text-sm text-muted">
            {site.address} · NMLS #{site.companyNmls}
          </p>
          <p className="mt-1 text-sm text-muted">
            <a href={`tel:${site.phone}`} className="hover:text-crush-600">
              {site.phone}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${site.email}`} className="hover:text-crush-600">
              {site.email}
            </a>
          </p>
        </Card>

        <div className="mt-14 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Let&apos;s work together
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Whether you&apos;re an agent ready to co-market or a buyer ready to
            get pre-approved, the team is here to help.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Get in touch</Button>
            <Button href="/resources" variant="secondary">
              Partner with us
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
