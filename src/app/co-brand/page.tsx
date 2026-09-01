import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { PropertyFlyerTool } from "@/components/PropertyFlyerTool";
import { ActiveListingProvider, ListingPicker } from "@/components/ActiveListing";

export const metadata: Metadata = {
  title: "Co-Branded Flyers",
  description:
    "Agents: enter your info and a listing to instantly generate a co-branded property flyer with financing scenarios, powered by Crush Mortgage.",
};

export default function CoBrandPage() {
  return (
    <>
      <PageHero
        eyebrow="For agents"
        title={
          <>
            Co-branded property flyers{" "}
            <span className="text-gradient">in seconds</span>
          </>
        }
        subtitle="Enter your info and a listing — we generate a co-branded flyer with estimated financing scenarios, a shareable page, and a print-ready PDF with a QR code for open houses."
      />

      <Container className="py-14">
        <ActiveListingProvider>
          <ListingPicker />
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-crush-50 text-2xl">🎨</span>
              <div>
                <h3 className="font-bold text-ink-900">Just want a photo flyer (no financing)?</h3>
                <p className="mt-0.5 text-sm text-muted">Design one from our editable template library — Just Listed, Open House, Luxury &amp; more.</p>
              </div>
            </div>
            <Link href="/flyer-studio" className="shrink-0 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2">Flyer template library →</Link>
          </div>
          <PropertyFlyerTool />
        </ActiveListingProvider>
      </Container>
    </>
  );
}
