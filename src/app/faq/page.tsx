import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { TrustStrip } from "@/components/TrustStrip";
import { faqs, faqTopics } from "@/lib/faqs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mortgage FAQ",
  description:
    "Straight answers on down payments, credit scores, mortgage insurance, "
    + "pre-approval and what a monthly payment actually contains.",
};

export default function FaqPage() {
  const topics = faqTopics();

  return (
    <>
      <PageHero
        eyebrow="Straight answers"
        title={
          <>
            Questions people{" "}
            <span className="text-gradient">actually ask</span>
          </>
        }
        subtitle="Including the ones people apologise for asking. None of them are silly, and the ones that feel silly are usually the ones that matter."
      />

      <Container className="py-14">
        <div className="space-y-12">
          {topics.map((topic) => (
            <section key={topic}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-crush-600">
                {topic}
              </h2>
              <div className="mt-5 space-y-6">
                {faqs
                  .filter((f) => f.topic === topic)
                  .map((f) => (
                    <div key={f.q} className="border-b border-border pb-6 last:border-0">
                      <h3 className="text-lg font-bold text-ink-900">{f.q}</h3>
                      <p className="mt-2 max-w-3xl leading-relaxed text-muted">{f.a}</p>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-ink-900">Still wondering about something?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Ask it directly. It costs nothing, there is nothing to sign, and we answer
            either way.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
            >
              Ask us
            </Link>
            <Link
              href="/webinars"
              className="inline-flex items-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2"
            >
              Come to a webinar
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">
            Answers here are general education, not advice about your situation, and not a
            commitment to lend. Program minimums are set by the agencies and can change.
          </p>
        </div>

        <TrustStrip className="mx-auto mt-10 max-w-3xl text-center" />
      </Container>
    </>
  );
}
