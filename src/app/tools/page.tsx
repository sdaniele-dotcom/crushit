import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { NearbyListingsTool } from "@/components/NearbyListingsTool";

export const metadata: Metadata = {
  title: "Agent Tools",
  description:
    "Realtor tools from CRUSH IT — find active homes for sale near any listing within a 1, 5, 10, or 25-mile radius (grouped by beds & baths), plus the full CRMLS MLS search.",
};

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="For agents"
        title={
          <>
            Realtor <span className="text-gradient">Tools</span>
          </>
        }
        subtitle="Quick tools to help you serve buyers and win listings — find homes near a property, or search the full MLS."
      />

      <Container className="py-12">
        {/* ── Homes near a listing ─────────────────────────────── */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-ink-900">
            Homes for sale near a listing
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Enter your listing&apos;s address (or an area), choose a radius —{" "}
            <strong>1, 5, 10, or 25 miles</strong> — and we&apos;ll pull the
            active homes for sale nearby, grouped by number of beds and baths.
            Great for pricing, buyer tours, and open-house prep. Print a clean,
            Crush-branded sheet in one click.
          </p>
        </div>
        <NearbyListingsTool />

        {/* ── Full MLS search ──────────────────────────────────── */}
        <div className="mt-14 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-ink-900">
            Search the full MLS
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Browse and search every active CRMLS listing through your MLS IDX —
            filters, map, photos, and full detail.
          </p>
          <Link
            href="/mls-search"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
          >
            Open MLS search
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </Link>
        </div>
      </Container>
    </>
  );
}
