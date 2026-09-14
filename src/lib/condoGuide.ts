/**
 * Content for the 2026 condo-rules agent guide.
 *
 * ONE source for both the web page (/guides/condo-rules) and the co-branded
 * printable — edit here and both move together.
 *
 * SOURCING. The 2026 dates and percentages come from Fannie Mae Lender Letter
 * LL-2026-03 (issued 2026-03-18) and Freddie Mac's parallel update. The
 * longer-standing project-review mechanics are described as what a review
 * looks at rather than as exact thresholds, because thresholds drift and
 * individual lenders overlay their own. Keep it that way: this is a document
 * that leaves the building with the company's NMLS on it.
 */

export type TimelineItem = { date: string; passed: boolean; title: string; body: string };

export const TIMELINE: TimelineItem[] = [
  {
    date: "July 1, 2026",
    passed: true,
    title: "Insurance items tightened",
    body: "Master policy deductible limits and HO-6 walls-in coverage requirements took effect. A project can be fine on reserves and still fail here.",
  },
  {
    date: "August 3, 2026",
    passed: true,
    title: "Limited Review retired",
    body: "Applications dated on or after this day can no longer use Limited Review. Most established condo projects now need a full project review unless the loan qualifies for a waiver or the unit type is exempt.",
  },
  {
    date: "January 1, 2027",
    passed: false,
    title: "Annual insurance reminders",
    body: "Servicers begin sending associations annual reminders about insurance requirements — expect boards to start hearing about this directly.",
  },
  {
    date: "January 4, 2027",
    passed: false,
    title: "Reserves rise to 15%",
    body: "The minimum reserve contribution goes from 10% to 15% of the association's annual budgeted assessment income. Projects below that will rely on a current reserve study to stay eligible.",
  },
];

export type Section = { heading: string; intro?: string; items: string[] };

export const REVIEW_DOCS: Section = {
  heading: "What a full review actually asks for",
  intro:
    "Limited Review let a lot of this go unexamined. Now it is the file. Every one of these can stall a closing if the HOA or its management company is slow.",
  items: [
    "A completed HOA questionnaire — the association or its management company fills it out, and management companies routinely charge a fee and take one to three weeks.",
    "The current operating budget, showing the reserve line as a percentage of assessment income.",
    "The reserve study, if there is one, plus its date.",
    "The master insurance certificate, showing coverage, the deductible, and whether it meets the 2026 limits.",
    "Proof of HO-6 walls-in coverage on the unit itself, where the master policy doesn't cover it.",
    "CC&Rs, bylaws, and recent board meeting minutes.",
    "Litigation disclosure — what it is about matters more than whether it exists.",
  ],
};

export const RESERVE_MATH: Section = {
  heading: "What 15% actually means",
  intro:
    "The threshold is a share of the association's annual budgeted assessment income, not a dollar figure, so it scales with the building. Two ways a project clears it:",
  items: [
    "Budget at or above the line. On a $400,000 annual assessment budget, 10% is $40,000 a year to reserves; 15% is $60,000. That is a real increase a board has to vote through, usually as a dues increase.",
    "Or lean on a reserve study. A study completed within the last 36 months, funded at its highest recommended contribution level, is the alternative path for a project budgeting below the threshold.",
    "Ask which one the association is relying on. A board that has not discussed this yet is a board that may be heading for a dues increase or a special assessment — and that is worth knowing before you set a list price.",
  ],
};

export const DISQUALIFIERS: Section = {
  heading: "What actually sinks a project",
  intro:
    "Reserves get the headlines, but these are the findings that most often make a project ineligible:",
  items: [
    "Critical repairs or unsafe conditions — structural, electrical, plumbing, elevator, or anything a local authority has cited.",
    "Significant deferred maintenance, especially where the minutes show it has been deferred more than once.",
    "A special assessment tied to safety or a major repair, whether it is levied, pending, or still being argued about.",
    "An evacuation order or any finding that part of the building is not safe to occupy.",
    "Litigation involving the structure, safety, or a construction defect. A slip-and-fall claim covered by insurance is a different conversation.",
    "One entity owning a large block of the units, or a high share of owners delinquent on dues.",
    "Too much of the building's square footage in commercial use.",
  ],
};

export const STILL_EASIER: Section = {
  heading: "Not every condo needs the full treatment",
  intro: "Before you assume the worst on a listing, check whether it is one of these:",
  items: [
    "Detached condo units are generally exempt from project review — the unit is a standalone house that happens to be held as a condo.",
    "Two-to-four unit projects are treated differently from a high-rise.",
    "Some loans qualify for a waiver of project review depending on occupancy and structure. Worth asking about rather than assuming.",
    "New and newly converted projects can go through a project eligibility review with the agency directly, which is a different track from an established project.",
    "FHA and VA run their own approved-condo lists, separate from Fannie and Freddie. A project can be ineligible on one and fine on another — including FHA's single-unit approval path.",
  ],
};

export const CALIFORNIA: Section = {
  heading: "California: SB 326",
  intro:
    "Separate from agency guidelines, and it feeds straight into them. SB 326 requires HOAs in buildings with three or more multifamily units to have exterior elevated elements — balconies, decks, stairs, walkways — inspected by a licensed professional, then re-inspected every nine years.",
  items: [
    "Ask whether the inspection has been done and what it found.",
    "A finding of required repair becomes deferred maintenance in the eyes of a project review, and often a special assessment on the reserve line.",
    "This is one of the most common ways a Long Beach or LA building that looks fine on paper turns out not to be.",
  ],
};

export const IF_IT_FAILS: Section = {
  heading: "If a project doesn't qualify",
  intro:
    "An ineligible project is not automatically a dead listing — it changes who the buyer is and how they finance it.",
  items: [
    "Portfolio and non-QM lenders review condo projects on their own criteria and will finance buildings the agencies will not. The rate is higher; the deal closes.",
    "A larger down payment changes some review outcomes. Worth pricing before you assume cash-only.",
    "Cash buyers and investors become the realistic pool, which affects your list price and days on market — better to know that in week one than week five.",
    "Sometimes the fix is small: a missing questionnaire, a stale reserve study, an insurance certificate that needs reissuing. Those are days, not months.",
  ],
};

export const CHECKLIST: string[] = [
  "What percentage of the annual budget goes to reserves? Under 15% is the number to watch.",
  "Is there a reserve study, and how old is it? Within 36 months is what carries weight.",
  "Any special assessments — levied, pending, or discussed at recent board meetings?",
  "Any deferred maintenance or critical repairs in the minutes, an engineer's report, or a city notice?",
  "What is the master policy deductible, and has the association reviewed it since July 2026?",
  "What share of units are owner-occupied, and does any single entity own a block of them?",
  "What share of owners are behind on dues?",
  "Is the HOA in litigation, and is it about the building?",
  "Who completes the HOA questionnaire, how long do they take, and what do they charge?",
  "California: has the SB 326 balcony inspection been done, and what did it find?",
];

export const MISREADS: [string, string][] = [
  [
    "“It's a townhouse, so the same rules apply.”",
    "Usually not. A townhouse is often fee-simple with an HOA and gets no project review at all. How the unit is legally held is what matters, not what it looks like from the street — check the deed before you assume either way.",
  ],
  [
    "“The building was fine last year, so it's fine now.”",
    "Project eligibility is assessed per loan, against current guidelines. A building that sailed through in 2025 can fail today on reserves, an open repair item, or an insurance deductible nobody has looked at.",
  ],
  [
    "“We'll sort the HOA paperwork during escrow.”",
    "Under full review those documents are the file, not paperwork. Management companies take one to three weeks to return a questionnaire. Finding the problem in week three costs the deal.",
  ],
  [
    "“The buyer is putting 25% down, so the project doesn't matter.”",
    "Down payment does not exempt a project from review. A large down payment can change some outcomes, but an ineligible project is ineligible regardless of how strong the borrower is.",
  ],
];

export const SOURCE_NOTE =
  "Source: Fannie Mae Lender Letter LL-2026-03 (issued March 18, 2026) and Freddie Mac's parallel update. Guidelines change and individual lenders may apply stricter overlays — confirm current requirements before relying on this. General information for real estate professionals; not legal advice, a commitment to lend, or an offer of credit.";
