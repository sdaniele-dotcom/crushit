"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { recordUse } from "@/lib/rewards";
import { printHtmlDocument } from "@/lib/printDoc";
import { programFlyerHtml, moreProgramsFlyerHtml } from "@/lib/programFlyerHtml";
import type { ProgramFlyer } from "@/lib/programFlyers";

/**
 * Download buttons for the co-branded program flyers.
 *
 * Client-side for the same reason the condo guide is: co-branding needs the
 * logged-in agent's profile OBJECT, because the headshot and brokerage logo
 * are images and the [TOKEN] substitution in PrintButton can only supply text.
 *
 * The document itself is built in lib/programFlyerHtml so it can be rendered
 * headless and measured without a browser click.
 */
export function ProgramFlyerDownload({
  program,
  className = "",
  label = "Download co-branded flyer",
}: {
  program: ProgramFlyer;
  className?: string;
  label?: string;
}) {
  const { profile } = useAuth();

  function download() {
    void recordUse("program_flyer", { events: ["marketing_piece_created"] });
    printHtmlDocument(programFlyerHtml(program, profile));
  }

  return (
    <button
      type="button"
      onClick={download}
      className={
        className ||
        "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2"
      }
    >
      {label}
    </button>
  );
}

/** The remaining programs as one sheet — see moreProgramsSheet for why. */
export function MoreProgramsFlyerDownload({ className = "" }: { className?: string }) {
  const { profile } = useAuth();

  function download() {
    void recordUse("program_flyer", { events: ["marketing_piece_created"] });
    printHtmlDocument(moreProgramsFlyerHtml(profile));
  }

  return (
    <button
      type="button"
      onClick={download}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600"
      }
    >
      Download the co-branded sheet
    </button>
  );
}
