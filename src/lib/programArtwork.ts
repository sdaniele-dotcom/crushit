/**
 * programArtwork.ts — the designed flyer for a program, and where the agent goes on it.
 *
 * These are Crush Mortgage's own print flyers. The suite does not redraw them;
 * it lays the artwork down full-bleed and places the agent's details into the
 * space the design leaves for them. One file therefore serves every agent —
 * nobody re-exports a flyer per person.
 *
 * Every measurement is a PERCENTAGE of the page, never pixels, so the same
 * config holds whether the sheet is rendered to screen or to paper and
 * whatever resolution the artwork is replaced with later.
 *
 * The boxes were measured off the artwork rather than eyeballed: a largest-
 * empty-rectangle scan over each image found the blank panel the designer left
 * for co-branding. Four of the five have one. The fifth (Self-Employed FHA)
 * ships with the loan officer's card already on it, so that region is painted
 * over before the agent's block is drawn — see `cover`.
 */

export type Rect = {
  /** All four are percentages of page width/height. */
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ProgramArtwork = {
  /** Published path, served from /public. */
  src: string;
  /** Natural pixel size — the page is sized to this aspect so nothing crops. */
  w: number;
  h: number;
  /** Where the agent's block is drawn. */
  agent: Rect;
  /** Regions painted over before anything is drawn (the LO's own details). */
  cover?: (Rect & { fill: string })[];
  /**
   * A lender strip redrawn at the foot of the page. Used where covering the
   * officer's contact details would otherwise remove the only statement of who
   * is doing the lending — which an advertisement quoting loan terms must keep.
   */
  lenderStrip?: Rect & { fill: string; color: string };
};

export const PROGRAM_ARTWORK: Record<string, ProgramArtwork> = {
  "self-employed-fha-special": {
    src: "/program-flyers/self-employed-fha-special.webp",
    w: 1545,
    h: 1999,
    // No blank panel on this one: the loan officer's card is printed bottom
    // right, on a near-white panel. Painted out in the panel's own colour so
    // the agent's block reads as part of the design rather than a patch.
    cover: [{ left: 52.4, top: 82.6, width: 47.6, height: 17.4, fill: "#f3eced" }],
    agent: { left: 53.5, top: 83.5, width: 45.5, height: 15.5 },
  },

  "hope-for-homeownership-hoper": {
    src: "/program-flyers/hope-for-homeownership-hoper.webp",
    w: 1102,
    h: 1427,
    agent: { left: 65.9, top: 1.1, width: 33.2, height: 7.7 },
    // The footer carries the officer's email and direct line. Painted out and
    // replaced with the lender strip below, so the sheet still says who lends.
    cover: [{ left: 0, top: 93.4, width: 100, height: 6.6, fill: "#171415" }],
    lenderStrip: {
      left: 0, top: 93.4, width: 100, height: 6.6,
      fill: "#171415", color: "#c9ccd1",
    },
  },

  "earned-equity-program-eep": {
    src: "/program-flyers/earned-equity-program-eep.webp",
    w: 1102,
    h: 1427,
    agent: { left: 51.8, top: 80.7, width: 44.5, height: 12.3 },
  },

  "self-employed-heloc": {
    src: "/program-flyers/self-employed-heloc.webp",
    w: 1024,
    h: 1536,
    agent: { left: 47.7, top: 88.8, width: 48.6, height: 8.8 },
  },

  "fha-plus": {
    src: "/program-flyers/fha-plus.webp",
    w: 1103,
    h: 1426,
    agent: { left: 52.7, top: 84.2, width: 43.6, height: 12.7 },
  },
};

export function artworkFor(slug: string): ProgramArtwork | undefined {
  return PROGRAM_ARTWORK[slug];
}
