"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { recordUse } from "@/lib/rewards";
import { printHtmlDocument } from "@/lib/printDoc";
import { programFlyerHtml } from "@/lib/programFlyerHtml";
import { programArtworkFlyerHtml } from "@/lib/programArtworkHtml";
import { artworkFor } from "@/lib/programArtwork";
import type { ProgramFlyer } from "@/lib/programFlyers";

/**
 * Download buttons for the co-branded program flyers.
 *
 * Client-side for the same reason the condo guide is: co-branding needs the
 * logged-in agent's profile OBJECT, because the headshot and brokerage logo
 * are images and the [TOKEN] substitution in PrintButton can only supply text.
 *
 * Where Crush has a designed flyer for the program, that artwork is used and
 * the agent's details are placed on it. Where it doesn't yet, the generated
 * layout stands in — so a program without artwork still prints something
 * rather than nothing, and adding its file later needs no code change here.
 *
 * Both documents are built in lib/ rather than inline so they can be rendered
 * headless and looked at without a browser click.
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
    const art = artworkFor(program.slug);
    // The print window is about:blank, so a relative /program-flyers/… path
    // resolves to nothing there. The artwork needs an absolute URL.
    printHtmlDocument(
      art
        ? programArtworkFlyerHtml(art, program.name, profile, window.location.origin)
        : programFlyerHtml(program, profile),
    );
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
