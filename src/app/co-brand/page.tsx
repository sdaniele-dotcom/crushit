import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { CoBrandTool } from "@/components/CoBrandTool";

export const metadata: Metadata = {
  title: "Co-Brand the Guide",
  description:
    "Agents: add your name, photo, and contact info to the Crush Mortgage First-Time Homebuyer Guide and download a co-branded flyer to share.",
};

const pdfHref = `${process.env.BASE_PATH || ""}/crush-mortgage-first-time-homebuyer-guide.pdf`;

export default function CoBrandPage() {
  return (
    <>
      <PageHero
        eyebrow="For agents"
        title={
          <>
            Co-brand the guide{" "}
            <span className="text-gradient">in seconds</span>
          </>
        }
        subtitle="Add your name, photo, and contact info, then download a co-branded flyer to share with your buyers — pairing your brand with Crush Mortgage."
      />

      <Container className="py-14">
        <CoBrandTool pdfHref={pdfHref} />
      </Container>
    </>
  );
}
