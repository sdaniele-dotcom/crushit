/**
 * programFlyers.ts — one shape for every loan program, so a flyer can be built
 * for each of them without a second copy of the content.
 *
 * The programs live in `data.ts` in three different shapes: the seven core
 * programs carry a minimum down and credit score, the ten specialty programs
 * carry a badge instead, and the ten "more programs" are a name and a sentence.
 * A flyer builder that branched on all three would be three builders.
 *
 * NOTHING here invents content. Every field is copied from the program as it
 * is already published on /loan-programs, because a flyer an agent hands to a
 * buyer is the page's claims on paper, and two versions of a loan program's
 * terms is one version too many.
 */

import {
  loanPrograms,
  specialtyPrograms,
  otherPrograms,
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
    kind: "specialty",
  };
}

export const coreFlyers: ProgramFlyer[] = loanPrograms.map(fromCore);
export const specialtyFlyers: ProgramFlyer[] = specialtyPrograms.map(fromSpecialty);

/** Every program that gets a flyer of its own, core first. */
export const allProgramFlyers: ProgramFlyer[] = [...coreFlyers, ...specialtyFlyers];

export function programFlyerBySlug(slug: string): ProgramFlyer | undefined {
  return allProgramFlyers.find((p) => p.slug === slug);
}

/**
 * The remaining programs, as one sheet rather than ten.
 *
 * Each is a name and a single sentence — enough to raise with a buyer, not
 * enough to fill a page. Padding ten one-liners into ten flyers would mean
 * writing nine-tenths of each one, and invented loan terms on a co-branded
 * handout is the worst thing this repo could produce.
 */
export const moreProgramsSheet = {
  slug: "more-programs",
  title: "More ways to get your buyer approved",
  intro:
    "Beyond the headline programs, these are the ones that solve the deal nobody else could place. Ask us about any of them — most take one conversation to know if they fit.",
  items: otherPrograms,
};

/**
 * The standing qualification on every program flyer, matching the footnote on
 * /loan-programs. A flyer quotes terms, so it carries the same caveat the page
 * does — the reader has no page to look back at.
 */
export const PROGRAM_DISCLAIMER =
  "Program details are general guidelines and subject to change, eligibility, and full underwriting approval. "
  + "VA credit minimums vary by lender overlay. Not a commitment to lend.";
