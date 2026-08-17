import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search the MLS",
  description:
    "Search active MLS listings right here, powered by the CRMLS IDX — find homes for your buyers without leaving the site.",
};

// Your CRMLS IDX display URL. If CRMLS gives you a personalized framing URL or
// embed snippet, swap it in here.
const CRMLS_IDX_URL = "https://www.crmls.org/servlet/lDisplayListings?LA=EN";

export default function MlsSearchPage() {
  return (
    <>
      <PageHero
        eyebrow="For agents"
        title={
          <>
            Search the <span className="text-gradient">MLS</span>
          </>
        }
        subtitle="Search active listings from CRMLS right here — powered by your MLS IDX. Find homes for your buyers without leaving the site."
      />

      <Container className="py-10">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            If the search doesn&apos;t load below, your MLS may not allow it to
            be embedded — open it in a new tab instead.
          </p>
          <a
            href={CRMLS_IDX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
          >
            Open CRMLS search
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 3h6v6M17 3l-8 8M9 5H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
            </svg>
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <iframe
            title="CRMLS listing search"
            src={CRMLS_IDX_URL}
            className="h-[85vh] min-h-[600px] w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Listing data is provided by CRMLS through your IDX for consumer,
          personal, non-commercial use and may not be used for any purpose other
          than to identify prospective properties. Information is deemed reliable
          but not guaranteed. Equal Housing Opportunity.
        </p>
      </Container>
    </>
  );
}
