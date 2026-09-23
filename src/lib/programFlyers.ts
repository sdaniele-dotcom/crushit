/**
 * programFlyers.ts — one shape for every loan program, so a flyer can be built
 * for each of them without a second copy of the content.
 *
 * The programs live in `data.ts` in two different shapes: the core programs
 * carry a minimum down and credit score, the specialty programs carry a badge
 * and the printed flyer's extra panels instead. A builder that branched on
 * both would be two builders.
 *
 * NOTHING here invents content. Every field is copied from the program as it
 * is already published on /loan-programs, because a flyer an agent hands to a
 * buyer is the page's claims on paper, and two versions of a loan program's
 * terms is one version too many.
 */

import {
  loanPrograms,
  specialtyPrograms,
  type LoanProgram,
  type SpecialtyProgram,
} from "@/lib/data";

export type ProgramFlyer = {
  slug: string;
  name: string;
  tagline: string;
  /** Who it suits. Absent on a few specialty programs. */
  bestFor: string | null;
  /** Core programs only — specialty programs carry a badge instead. */
  minDown: string | null;
  minCredit: string | null;
  /** Specialty programs only, e.g. "0–10% down · no PMI". */
  badge: string | null;
  highlights: string[];
  /** Core programs only: the caveat that belongs next to the pitch. */
  watchOut: string | null;
  /** The printed flyer's extra panels — see SpecialtyProgram for why optional. */
  perfectForLabel: string | null;
  perfectFor: string[] | null;
  pitch: [string, string] | null;
  whyItWorks: string[] | null;
  kind: "core" | "specialty";
};

/** "Earned Equity Program (EEP)" -> "earned-equity-program-eep". */
export function programSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fromCore(p: LoanProgram): ProgramFlyer {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    bestFor: p.bestFor,
    minDown: p.minDown,
    minCredit: p.minCredit,
    badge: null,
    highlights: p.highlights,
    watchOut: p.watchOut,
    perfectForLabel: null,
    perfectFor: null,
    pitch: null,
    whyItWorks: null,
    kind: "core",
  };
}

function fromSpecialty(p: SpecialtyProgram): ProgramFlyer {
  return {
    slug: programSlug(p.name),
    name: p.name,
    tagline: p.tagline,
    bestFor: p.bestFor,
    minDown: null,
    minCredit: null,
    badge: p.badge,
    highlights: p.highlights,
    watchOut: null,
    perfectForLabel: p.perfectForLabel ?? null,
    perfectFor: p.perfectFor ?? null,
    pitch: p.pitch ?? null,
    whyItWorks: p.whyItWorks ?? null,
    kind: "specialty",
  };
}

export const coreFlyers: ProgramFlyer[] = loanPrograms.map(fromCore);
export const specialtyFlyers: ProgramFlyer[] = specialtyPrograms.map(fromSpecialty);

/**
 * Every program that gets a printed flyer: the exclusive ones, and only those.
 *
 * Conventional, FHA and VA are on every lender's website; a co-branded handout
 * for them says nothing an agent's buyer can't find in ten seconds, and it puts
 * our NMLS behind terms that vary by lender overlay anyway. The specialty
 * programs are the ones worth a page — they are the reason to call us rather
 * than anyone else, and a buyer will not find them by searching.
 */
export const allProgramFlyers: ProgramFlyer[] = specialtyFlyers;

export function programFlyerBySlug(slug: string): ProgramFlyer | undefined {
  return allProgramFlyers.find((p) => p.slug === slug);
}

/**
 * The standing qualification on every program flyer, matching the footnote on
 * /loan-programs. A flyer quotes terms, so it carries the same caveat the page
 * does — the reader has no page to look back at.
 */
export const PROGRAM_DISCLAIMER =
  "Program details are general guidelines and subject to change, eligibility, and full underwriting approval. "
  + "VA credit minimums vary by lender overlay. Not a commitment to lend.";
