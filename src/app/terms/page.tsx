import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { TERMS, TERMS_VERSION } from "@/lib/terms";

export const metadata: Metadata = {
  title: "Agent Terms of Use",
  description:
    "The terms for using the CRUSH IT Agent Suite — including how Crush Mortgage may use an agent's name, headshot and co-branded marketing materials.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Agreement"
        title={
          <>
            Agent <span className="text-gradient">terms of use</span>
          </>
        }
        subtitle="What you're agreeing to when you use the suite — and, in section 3, exactly what we may do with your name, your photo and the materials you make here."
      />

      <Container className="py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Version {TERMS_VERSION}
        </p>

        <div className="mt-8 max-w-3xl">
          {TERMS.map((s) => (
            <section key={s.heading} className="mt-8 first:mt-0">
              <h2 className="text-lg font-bold text-ink-900">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2.5 text-sm leading-relaxed text-ink-800">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
