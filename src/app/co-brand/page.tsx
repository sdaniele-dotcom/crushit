import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { PropertyFlyerTool } from "@/components/PropertyFlyerTool";

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
        <PropertyFlyerTool />
      </Container>
    </>
  );
}
