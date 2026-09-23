"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { recordUse } from "@/lib/rewards";
import { printHtmlDocument } from "@/lib/printDoc";
import { programFlyerHtml } from "@/lib/programFlyerHtml";
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
