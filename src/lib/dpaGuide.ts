/**
 * Content for the down payment assistance section (/down-payment-assistance).
 *
 * SOURCING AND WHY IT READS THE WAY IT DOES. The program database belongs to
 * Down Payment Resource, reached through CRMLS and subscribed under Shannon —
 * it covers thousands of programs whose income limits, funding and rules change
 * constantly. So nothing here names a dollar figure, an income cap or a specific
 * program: the tool is the source of truth for all of that, and a page that
 * repeats a number is a page that will be wrong within a quarter and is being
 * read by buyers with our NMLS on it.
 *
 * What IS stated here is structural — the kinds of assistance that exist, the
 * levers eligibility turns on, and what an agent should do about it. That part
 * is durable.
 */

export type Kind = { name: string; body: string };

/** Forms assistance takes. Buyers assume "grant"; most of these aren't. */
export const KINDS: Kind[] = [
  {
    name: "Grants",
    body: "Money toward the down payment or closing costs that is never repaid. The rarest kind, and the first to run out of funding each cycle.",
  },
  {
    name: "Forgivable second loans",
    body: "Recorded as a second lien with no payment, forgiven over a set number of years as long as the buyer keeps living there. Sell or refinance early and some or all of it comes back.",
  },
  {
    name: "Deferred-payment seconds",
    body: "No monthly payment, but the balance is owed when the home is sold, refinanced, or the first mortgage is paid off. It doesn't count against the buyer's monthly budget — it does come out of their proceeds later.",
  },
  {
    name: "Low-interest seconds",
    body: "A small amortizing second with its own payment. Adds to the monthly number, so it has to be in the qualifying math from the start, not discovered in underwriting.",
  },
  {
    name: "Mortgage Credit Certificates (MCC)",
    body: "Not down payment money at all — a federal tax credit on a portion of mortgage interest every year the buyer keeps the loan. Often stackable with other assistance.",
  },
  {
    name: "Closing-cost and rate assistance",
    body: "Help with costs rather than the down payment, sometimes structured as a lender credit or a below-market rate. Useful for the buyer who has the down payment and nothing left over.",
  },
];

export type Lever = { name: string; body: string };

/** What eligibility actually turns on. */
export const LEVERS: Lever[] = [
  {
    name: "Household income",
    body: "Almost always capped, usually against an area median income figure that varies by county and household size. Note household, not borrower: income from people who won't be on the loan can still count.",
  },
  {
    name: "Where the property is",
    body: "Many programs are drawn to a city, a county, or a specific census tract. This is the lever agents underuse — eligibility can attach to the address, which means a listing can qualify no matter who ends up buying it.",
  },
  {
    name: "Purchase price or loan amount",
    body: "A separate ceiling from the income one. A buyer can be well inside the income limit and still be over the price limit.",
  },
  {
    name: "First-time buyer status",
    body: "Commonly defined as no ownership interest in a primary residence for the past three years — so a former owner is often first-time again. Some programs drop the requirement entirely in targeted areas.",
  },
  {
    name: "Occupancy",
    body: "Primary residence, effectively always. Assistance does not go on a rental or a second home.",
  },
  {
    name: "Homebuyer education",
    body: "Frequently required, and it takes real calendar time. Worth starting the course before there's a contract rather than after.",
  },
  {
    name: "Occupation or service",
    body: "Some programs are built for teachers, first responders, healthcare workers, veterans, or the employees of a particular employer. Ask — buyers rarely volunteer it.",
  },
];

export type Play = { title: string; body: string };

/** How an agent uses this rather than just knowing it exists. */
export const PLAYS: Play[] = [
  {
    title: "Run your own listing, not just your buyers",
    body: "Because eligibility is often tied to the address, a listing can sit inside a program boundary regardless of who buys it. Run the address before you go live and you may find you're marketing to a wider pool than the comps suggest.",
  },
  {
    title: "Bring it to the listing appointment",
    body: "A seller choosing between agents is choosing between buyer pools. \"Buyers at your address may qualify for down payment assistance\" is a concrete reason your listing sells to someone the other agent's marketing never reached.",
  },
  {
    title: "Use it on the buyer who says \"not yet\"",
    body: "The most common reason a pre-approved-on-income buyer walks away is the down payment, not the payment. Run the numbers in front of them instead of letting them go quiet for a year.",
  },
  {
    title: "Put it in the open-house conversation",
    body: "Have the tool open on a tablet at the sign-in table. Someone who came to look at the kitchen leaves having found out they can actually buy it.",
  },
  {
    title: "Check it again when something changes",
    body: "Programs open, close, and refill. A buyer who didn't match in the spring may match now, and a program the buyer used last year may be out of money this year.",
  },
];

export type Reality = { title: string; body: string };

/** The parts that go wrong, said plainly. */
export const REALITIES: Reality[] = [
  {
    title: "A match is not an approval",
    body: "The tool shows what a buyer may qualify for based on the sponsors' own published rules. Every program has its own application, its own underwriter, and its own queue — and the buyer still needs a first-mortgage approval underneath it.",
  },
  {
    title: "Funding runs out",
    body: "Most programs are funded in cycles. A program that matched in the morning can be reserved out by the afternoon, which is why assistance belongs in the conversation early rather than as a late save.",
  },
  {
    title: "It has to sit on a first mortgage that allows it",
    body: "Not every loan program accepts every form of assistance, and some assistance requires a specific first mortgage. This is the piece to confirm with us before the offer, not after.",
  },
  {
    title: "Build the extra time into the contract",
    body: "Layering assistance adds steps — a second approval, a required course, sometimes a separate set of documents. Ask what the realistic timeline is before you agree to a close date.",
  },
  {
    title: "Advertise the possibility, never the outcome",
    body: "\"May qualify\" and \"assistance may be available for this address\" are accurate. Telling a buyer they qualify, or naming an amount, before a program has approved them is the one thing to keep out of your marketing.",
  },
];

/** What the tool asks for, so an agent can have it ready. */
export const NEEDED: string[] = [
  "The property address, or at least the city and ZIP the buyer is shopping",
  "Estimated purchase price",
  "Household income — everyone contributing, not only the borrowers",
  "Household size",
  "Whether the buyer has owned a primary residence in the last three years",
  "Military service, and any occupation that might have its own program",
];

export const SOURCE_NOTE =
  "Programs and eligibility rules come from Down Payment Resource, provided through CRMLS. Results are estimates based on the program sponsors' own published criteria and are not a commitment to lend or a determination of eligibility. Crush Mortgage will confirm what a buyer actually qualifies for as part of a full application.";
