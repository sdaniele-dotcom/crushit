import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { GuideCobrander } from "@/components/GuideCobrander";

export const metadata: Metadata = {
  title: "Co-branded Buyer & Seller Guides",
  description:
    "Instantly co-brand the Crush Mortgage First-Time Homebuyer's Guide and Home Seller's Guide with your name, photo, and contact info — then save as a PDF to share with clients.",
};

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Co-marketing · Client guides"
        title={
          <>
            Your <span className="text-gradient">co-branded</span> buyer &amp;
            seller guides
          </>
        }
        subtitle="Beautiful, ready-to-share guides — automatically co-branded with you and Crush Mortgage. Add your info, save as a PDF, and send it to your clients."
      />

      <Container className="py-14">
        <GuideCobrander />

        <div className="mt-12 rounded-3xl border border-border bg-surface p-6 text-sm text-muted sm:p-8">
          <p className="font-semibold text-ink-800">How it works</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Pick the buyer or seller guide.</li>
            <li>Add your name, photo, and contact info.</li>
            <li>
              Click <strong>Create my co-branded guide</strong> — it opens in a
              new tab with your details on the cover and the agent card.
            </li>
            <li>
              Use <strong>Save as PDF / Print</strong> at the top of that tab
              (or your browser&apos;s Print → Save as PDF) to download it.
            </li>
          </ol>
        </div>
      </Container>
    </>
  );
}
