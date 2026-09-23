/**
 * Static content data for the CRUSH IT suite.
 * Editable, plain-English content — safe for non-developers to update.
 */
import type { StaticImageData } from "next/image";
import shannonPhoto from "../../public/team/shannon-daniele.jpg";
import joshPhoto from "../../public/team/josh-amescua.jpg";
import silviaPhoto from "../../public/team/silvia-robles.jpg";
import amrajPhoto from "../../public/team/amraj-kaur.jpg";

export type Feature = {
  title: string;
  href: string;
  blurb: string;
  icon: string; // emoji glyph used in cards
  points: string[];
};

export const suite: Feature[] = [
  {
    title: "Mortgage Calculators",
    href: "/calculators",
    icon: "🧮",
    blurb:
      "Instant monthly payments, affordability, rent-vs-buy, and refinance math you can run right in front of a client.",
    points: [
      "Monthly payment breakdown (P&I, taxes, insurance, PMI)",
      "How much home a buyer can afford",
      "Rent vs. buy comparison",
      "Refinance savings estimator",
    ],
  },
  {
    title: "Loan Program Guides",
    href: "/loan-programs",
    icon: "📋",
    blurb:
      "Plain-English breakdowns of every major loan type so you can match buyers to the right program with confidence.",
    points: [
      "Conventional, FHA, VA, USDA",
      "Jumbo & non-QM / DSCR",
      "Down payment assistance",
      "Quick-compare eligibility",
    ],
  },
  {
    title: "Co-Marketing Toolkit",
    href: "/co-marketing",
    icon: "🤝",
    blurb:
      "Everything you need to partner with Crush Mortgage — co-branded materials, lead tools, and open-house resources.",
    points: [
      "Co-branded flyers & social posts",
      "Buyer pre-approval lead capture",
      "Open house sign-in & follow-up",
      "Joint marketing playbook",
    ],
  },
  {
    title: "Buyer Resources",
    href: "/resources",
    icon: "📚",
    blurb:
      "Share-ready guides and checklists that make you the most helpful agent your clients have ever worked with.",
    points: [
      "First-time buyer roadmap",
      "Document checklist",
      "Mortgage glossary",
      "Closing-day prep",
    ],
  },
];

export type LoanProgram = {
  name: string;
  slug: string;
  tagline: string;
  bestFor: string;
  minDown: string;
  minCredit: string;
  highlights: string[];
  watchOut: string;
};

export const loanPrograms: LoanProgram[] = [
  {
    name: "Conventional",
    slug: "conventional",
    tagline: "The flexible workhorse loan.",
    bestFor: "Buyers with solid credit and steady income.",
    minDown: "3%",
    minCredit: "620",
    highlights: [
      "As little as 3% down for first-time buyers",
      "PMI drops off automatically at 78% LTV",
      "Loan limits up to the conforming cap",
      "Works for primary, second homes & investment",
    ],
    watchOut: "Higher credit scores unlock better rates and lower PMI.",
  },
  {
    name: "FHA",
    slug: "fha",
    tagline: "Lower barrier to entry.",
    bestFor: "Buyers who want an easier path to approval with a low down payment.",
    minDown: "3.5%",
    minCredit: "580",
    highlights: [
      "3.5% down with a 580+ score",
      "More forgiving of past credit bumps",
      "Gift funds allowed for the full down payment",
      "Assumable by a future buyer",
    ],
    watchOut:
      "Mortgage insurance (MIP) usually stays for the life of the loan.",
  },
  {
    name: "VA",
    slug: "va",
    tagline: "Earned benefit for those who served.",
    bestFor: "Eligible veterans, active-duty & qualifying spouses.",
    minDown: "0%",
    minCredit: "580–620*",
    highlights: [
      "$0 down payment",
      "No monthly mortgage insurance",
      "Competitive, often below-market rates",
      "Limited closing costs",
    ],
    watchOut:
      "Requires a Certificate of Eligibility and a VA funding fee (waived for some).",
  },
  {
    name: "USDA",
    slug: "usda",
    tagline: "Zero-down for rural & suburban areas.",
    bestFor: "Buyers in eligible suburban and rural areas.",
    minDown: "0%",
    minCredit: "640",
    highlights: [
      "$0 down payment",
      "Low guarantee fee — often less than PMI",
      "Generous eligible-area maps (many suburbs qualify)",
      "Great for first-time buyers",
    ],
    watchOut: "Property must be in a USDA-eligible area and income limits apply.",
  },
  {
    name: "Jumbo",
    slug: "jumbo",
    tagline: "For homes above conforming limits.",
    bestFor: "Buyers of higher-priced or luxury homes.",
    minDown: "10–20%",
    minCredit: "700+",
    highlights: [
      "Financing above the conforming loan cap",
      "Fixed & adjustable options",
      "Single loan instead of a piggyback",
      "Competitive rates for strong borrowers",
    ],
    watchOut: "Expect stricter reserves, income, and credit requirements.",
  },
  {
    name: "DSCR / Investor",
    slug: "dscr",
    tagline: "Qualify on the property, not your paystub.",
    bestFor: "Real-estate investors growing a portfolio.",
    minDown: "20–25%",
    minCredit: "660+",
    highlights: [
      "Qualifies on rental cash flow, not personal income",
      "No W-2 or tax returns required",
      "Close in an LLC",
      "No limit on number of financed properties",
    ],
    watchOut: "Higher rates and down payment than owner-occupied loans.",
  },
  {
    name: "Bank Statement",
    slug: "bank-statement",
    tagline: "Qualify with deposits, not tax returns.",
    bestFor: "Self-employed buyers, business owners & 1099 earners.",
    minDown: "10%",
    minCredit: "660+",
    highlights: [
      "Qualify on 12–24 months of bank deposits",
      "No tax returns or W-2s required",
      "Built for self-employed & business owners",
      "Primary, second home, or investment",
    ],
    watchOut: "Rates are typically higher than full-doc loans, and a larger down payment may be required.",
  },
];

export type RateRow = {
  program: string;
  term: string;
  rate: string; // note rate
  apr: string; // annual percentage rate
  points?: string;
  featured?: boolean;
};

/**
 * ⚠️ SAMPLE RATES — for layout only. Mortgage rates change daily and are
 * regulated (APR must reflect the same assumptions). Replace every value
 * below with your own current, compliant numbers before promoting the site,
 * and update `ratesAsOf` each time. Keep the assumptions line accurate.
 */
export const ratesAsOf = "August 10, 2026";
export const rateAssumptions =
  "Sample scenario: $400,000 loan amount, 25% down, 740+ FICO, single-family primary residence, 30-day rate lock. Your rate depends on your full application.";

export const rateTable: RateRow[] = [
  { program: "Conventional", term: "30-Year Fixed", rate: "0.000%", apr: "0.000%", points: "0.00", featured: true },
  { program: "Conventional", term: "15-Year Fixed", rate: "0.000%", apr: "0.000%", points: "0.00" },
  { program: "FHA", term: "30-Year Fixed", rate: "0.000%", apr: "0.000%", points: "0.00" },
  { program: "VA", term: "30-Year Fixed", rate: "0.000%", apr: "0.000%", points: "0.00" },
  { program: "Jumbo", term: "30-Year Fixed", rate: "0.000%", apr: "0.000%", points: "0.00" },
  { program: "ARM", term: "7/6 SOFR ARM", rate: "0.000%", apr: "0.000%", points: "0.00" },
];

export type SpecialtyProgram = {
  name: string;
  tagline: string;
  bestFor: string;
  badge: string; // short highlight, e.g. "3.5% down"
  highlights: string[];
  /**
   * The extra panels on the printed flyer. All optional, and deliberately so:
   * the flyer lays out without them, and a program only gets them once someone
   * has written the real thing. Padding them out from the highlights would put
   * invented loan terms under our NMLS.
   */
  /** Who the "PERFECT FOR …" panel names, e.g. "SELF-EMPLOYED BORROWERS WHO:". */
  perfectForLabel?: string;
  /** Bullets under that label. Without these the panel shows `bestFor`. */
  perfectFor?: string[];
  /** The two-line pitch: [black line, red line]. Falls back to the tagline. */
  pitch?: [string, string];
  /** "WHY THIS PROGRAM WORKS" bullets. The panel is omitted without them. */
  whyItWorks?: string[];
};

/**
 * Specialty / niche programs (from the Crush Mortgage program flyers).
 * Marketing highlights — all subject to eligibility and full approval.
 */
export const specialtyPrograms: SpecialtyProgram[] = [
  {
    name: "Doctor Loans",
    tagline: "Medical professionals loan product — up to 100% financing.",
    bestFor:
      "Doctors, dentists, and residents — strong future income, often with student debt.",
    badge: "Up to 100% financing",
    /*
      Specs from the Medical Professionals Loan Product sheet. Two claims that
      used to sit here — student-loan debt treated favorably, and closing up to
      90 days before a new job starts — are NOT on that sheet, so they are not
      here either. Both are ordinary physician-loan features and may well be
      true of this product; they go back in the moment someone confirms them
      against the guidelines, and not before.
    */
    highlights: [
      "Up to 100% financing — no mortgage insurance",
      "Loan amounts from $100K up to $2 million",
      "680 minimum credit score · DTI up to 50%",
      "One unit, owner occupied — purchase and rate/term",
      "No first-time-homebuyer restrictions",
      "Fixed and ARM products available",
    ],
    perfectForLabel: "Eligible medical professionals:",
    perfectFor: [
      "MD, DO, DDS or DMD",
      "Ophthalmologist, psychiatrist or podiatrist (DPM)",
      "Pharmacist (PharmD), veterinarian (DVM or VMD)",
      "CRNA with a DNAP or DNP",
      "Residents, fellows and interns with one of these degrees",
    ],
    pitch: ["Buy a home with up to 100% financing", "No mortgage insurance"],
    whyItWorks: [
      "Up to 100% financing with no mortgage insurance",
      "Loan amounts to $2 million, DTI up to 50%",
      "Residents, fellows and interns are eligible too",
    ],
  },
  {
    name: "Self-Employed FHA Special",
    tagline: "Qualify on your business, not just your taxes.",
    bestFor:
      "Self-employed borrowers who write off too much income to qualify the traditional way.",
    badge: "3.5% down",
    // Taken from the printed Self-Employed FHA Special flyer, which is the
    // authoritative copy for this program. The wording is kept as it reads
    // there rather than paraphrased.
    highlights: [
      "3.5% down payment",
      "640 minimum FICO",
      "NO tax returns required",
      "NO paycheck stubs required",
      "Income qualifies using profit & loss + balance sheet",
      "Borrower-prepared financials accepted",
      "Proof of business ownership / license (2+ full years required)",
      "100% gift funds allowed",
    ],
    perfectForLabel: "Self-employed borrowers who:",
    perfectFor: [
      "Write off too much income",
      "Don't show enough on tax returns",
      "Need flexible qualification options",
    ],
    pitch: ["Qualify based on your business", "Not just your taxes"],
    whyItWorks: [
      "Uses real business income (P&L)",
      "Not limited by tax write-offs",
      "Offers flexible qualification options",
    ],
  },
  {
    name: "FHA-PLUS",
    tagline: "A standard FHA loan with far less income documentation.",
    bestFor:
      "Buyers who want FHA financing with streamlined income verification.",
    badge: "3.5% down",
    highlights: [
      "VOE is all you need for income — no 4506-T",
      "No tax returns · 100% gift funds allowed",
      "FICO scores down to 620",
      "SFR, PUD, condo, and 1–4 units eligible",
    ],
    perfectForLabel: "Borrowers who:",
    perfectFor: [
      "Have no pay stubs, W-2s or tax returns to hand over",
      "Had an FHA loan turned down recently",
      "Work in the service industry",
    ],
    pitch: ["Far less income documentation", "than a standard FHA loan"],
    whyItWorks: [
      "A VOE is all we need for income — no 4506-T",
      "No tax returns · 100% gift funds allowed",
      "FICO down to 620 · SFR, PUD, condo, 1–4 units",
    ],
  },
  {
    name: "Earned Equity Program (EEP)",
    tagline: "A 15-year FHA lease-to-own path when traditional lending can't.",
    bestFor:
      "Buyers who need a bridge to ownership — including ITIN and DACA borrowers.",
    badge: "3.5% down",
    highlights: [
      "15-year lease-to-own: assume the FHA loan later or sell",
      "You earn the equity — part of each payment goes to principal",
      "3.5% down + up to 6% seller concessions",
      "Credit scores down to 580 · 1 day out of BK/FC OK",
      "ITIN, DACA, and U.S. citizens welcome",
    ],
    perfectForLabel: "Buyers who:",
    perfectFor: [
      "Can't qualify for traditional financing yet",
      "Are ITIN, DACA or U.S. citizens",
      "Are one day out of a bankruptcy or foreclosure",
    ],
    pitch: ["3.5% down for ITINs", "is here"],
    whyItWorks: [
      "Part of every lease payment goes to principal",
      "You own the equity you earn, as long as you don't default",
      "Assume the FHA loan when you're ready — or sell",
    ],
  },
  {
    name: "Self-Employed HELOC",
    tagline: "Tap your home's equity without tax returns.",
    bestFor:
      "Self-employed homeowners who want a line of credit against their equity.",
    badge: "Up to 75% equity",
    highlights: [
      "Qualify using your year-end P&L — no tax returns",
      "Access up to 75% of your home's equity",
      "5-year draw period, 30-year total term",
      "Rates tied to prime, margins starting around 2%",
    ],
    perfectForLabel: "Self-employed homeowners who:",
    perfectFor: [
      "Find traditional loan qualification challenging",
      "Would rather not hand over tax returns",
      "Want to leverage their property's value",
    ],
    pitch: ["Finally — a HELOC designed for", "self-employed homeowners"],
    whyItWorks: [
      "Qualifies on your year-end profit & loss statement",
      "Access up to 75% of your home's equity",
      "5-year draw period, 30-year total term",
    ],
  },
  {
    name: "Down Payment Assistance (DPA)",
    tagline: "FHA 100% financing — little to nothing out of pocket.",
    bestFor: "Buyers who need help covering the down payment.",
    badge: "100% financing",
    highlights: [
      "FHA 100% financing (96.5% first + 3.5% second)",
      "600 FICO OK · no first-time-buyer requirement",
      "Up to 2 units · manufactured homes OK",
      "6% seller credits allowed for closing costs",
      "Second is 0% forgivable or amortized over 10 years",
    ],
    perfectForLabel: "Buyers who:",
    perfectFor: [
      "Don't have the down payment saved",
      "Aren't first-time buyers — it isn't required",
      "Have a 600 FICO",
    ],
    pitch: ["Don't let a down payment", "stand in the way of homeownership"],
    whyItWorks: [
      "FHA 100% financing — 96.5% first + 3.5% second",
      "Fast in-house underwriting, FHA guidelines and AUS approval",
      "The second is 0% forgivable or amortized over 10 years",
    ],
  },
  {
    name: "Non-QM for Self-Employed",
    tagline: "Real financing built around your income — not your tax returns.",
    bestFor:
      "Self-employed buyers and investors who need flexible income documentation.",
    badge: "Up to $7M",
    highlights: [
      "Loan amounts up to $7 million",
      "Down payments as low as 10%",
      "Rates competitive with jumbo products",
      "P&L, 1099, or 12–24 month bank statements",
      "Blended and no-doc income options",
      "No prepayment penalties",
    ],
    perfectForLabel: "Self-employed borrowers who:",
    perfectFor: [
      "Are penalised by tax-return-only guidelines",
      "Need a loan amount up to $7 million",
      "Have blended household income",
    ],
    pitch: ["Real financing built around your income", "not your tax returns"],
    whyItWorks: [
      "P&L, 1099s, or 12–24 month bank statements",
      "Blended income — one spouse's deposits, the other's W-2",
      "Rental income qualifies an investment property · no prepayment penalties",
    ],
  },
  {
    name: "Renovation HELOC",
    tagline: "Borrow against your home's after-renovation value.",
    bestFor:
      "Homeowners financing improvements without draining their savings.",
    badge: "Up to 95% CLTV",
    highlights: [
      "Up to 95% LTV/CLTV · 640 minimum FICO",
      "Loan amounts from $50K to $500K",
      "1–2 units, ADUs, PUDs, townhomes, warrantable condos",
      "Customized underwriting · no draw required",
      "No cash-out restrictions or prepayment penalty",
    ],
    perfectForLabel: "Homeowners who:",
    perfectFor: [
      "Want to build an ADU",
      "Have no equity and no cash to build with",
      "Are buying a home and want to add an ADU",
    ],
    pitch: ["Home improvement financing,", "improved"],
    whyItWorks: [
      "Borrows against the after-renovation value, not today's",
      "Owner-occupied, full doc — taxes, W-2s and pay stubs",
      "Funded from a drawing, a contractor's estimate and a cost breakdown",
    ],
  },
  {
    name: "Non-QM HELOC",
    tagline: "A flexible second lien for nearly any borrower.",
    bestFor:
      "Owners and investors who want to tap equity with alternative income docs.",
    badge: "Up to $500K",
    highlights: [
      "WVOE, P&L, bank statement, or DSCR qualifying",
      "No-ratio investment & no-income owner-occupied options",
      "First lien allowed · loan amounts to $500K",
      "1–4 units, PUD, SFR & condo",
      "Primary, second home & investment · foreign nationals OK",
    ],
    perfectForLabel: "Borrowers who:",
    perfectFor: [
      "Can't document income the traditional way",
      "Are foreign nationals",
      "Want a first lien, or a second",
    ],
    pitch: ["You asked,", "we delivered"],
    whyItWorks: [
      "WVOE, P&L, bank statement or DSCR qualifying",
      "No-income owner-occupied and no-ratio investment",
      "Primary, second home and investment",
    ],
  },
  {
    name: "Hope for Homeownership (HOPER)",
    tagline: "Up to a $13,000 grant that never needs to be repaid.",
    bestFor:
      "FHA buyers who want a cash boost — no first-time-buyer requirement.",
    badge: "$13,000 grant",
    highlights: [
      "Up to $13,000 grant — no repayment required",
      "No income restrictions",
      "Same competitive rates as a standard FHA loan",
      "Add solar to your FHA loan at purchase",
      "Complete 6 hours of HOPER homebuyer education to qualify",
    ],
    perfectForLabel: "Buyers who fit:",
    perfectFor: [
      "Primary residence, single-family — no condos",
      "620 minimum credit score",
      "First-time or repeat buyers",
      "CA, AZ, NV, TX, FL, ID, IL & UT",
    ],
    pitch: ["Earn up to $13,000", "No repayment, no income limits"],
    whyItWorks: [
      "Up to $13,000, or 3.5% of the purchase price, paid to you",
      "The same competitive FHA rate — no second loan to carry",
      "Solar rolls into the mortgage with no upfront cost",
    ],
  },
];

export type OtherProgram = { name: string; description: string };

/** Additional programs available — shorter descriptions. */
export const otherPrograms: OtherProgram[] = [
  {
    name: "LLC Loans",
    description:
      "Purchase in the name of your LLC — no longer limited to lending only to individuals.",
  },
  {
    name: "1099-Only Loans",
    description: "Qualify on one or two years of 1099s — no tax returns needed.",
  },
  {
    name: "12-Month Bank Statement (Investor)",
    description:
      "Buy investment property qualifying on the property's rental income alone.",
  },
  {
    name: "Non-Warrantable Condos",
    description:
      "Financing for condos whose HOA isn't eligible for conventional loans.",
  },
  {
    name: "P&L-Only for Self-Employed",
    description:
      "Qualify using borrower-prepared (non-audited) profit & loss statements.",
  },
  {
    name: "True ITIN — 5% Down",
    description:
      "ITIN purchase through Fannie/Freddie with 5% down (valid ID/work authorization required).",
  },
  {
    name: "Long Beach $25K Grant",
    description:
      "A $25,000 first-time homebuyer grant for eligible Long Beach buyers.",
  },
  {
    name: "CalHFA Assistance",
    description:
      "California Housing Finance Agency down payment and closing-cost assistance.",
  },
  {
    name: "70+ DPA Programs",
    description:
      "Access to 70+ additional down payment assistance programs across the state.",
  },
  {
    name: "Family Opportunity Mortgage",
    description:
      "Buy a home for a parent or college-age child at owner-occupied rates with 3–5% down.",
  },
];

export type Resource = {
  title: string;
  description: string;
  audience: string;
  href: string;
  items: string[];
};

export const resources: Resource[] = [
  {
    title: "First-Time Buyer Roadmap",
    description:
      "A step-by-step walkthrough from 'thinking about it' to keys in hand.",
    audience: "Share with new buyers",
    href: "/first-time-buyers",
    items: [
      "Get pre-approved before you shop",
      "Understand your true monthly budget",
      "Make a competitive offer",
      "Inspection, appraisal & underwriting",
      "Clear to close & final walkthrough",
    ],
  },
  {
    title: "Document Checklist",
    description: "Everything a buyer needs to gather for a smooth approval.",
    audience: "Give at first meeting",
    href: "/guides/document-checklist",
    items: [
      "30 days of pay stubs",
      "2 years W-2s / tax returns",
      "2 months bank statements",
      "Photo ID & Social Security number",
      "Proof of any additional income",
    ],
  },
  {
    title: "Homebuying Glossary",
    description: "The terms every buyer asks about, in plain English.",
    audience: "Reduce buyer anxiety",
    href: "/guides/glossary",
    items: [
      "APR vs. interest rate",
      "Escrow & impound accounts",
      "PMI / MIP",
      "Points & buydowns",
      "Debt-to-income (DTI) ratio",
    ],
  },
  {
    title: "The 2026 Condo Rules",
    description: "Limited Review is gone and reserve minimums are rising — what to check before you take a condo listing.",
    audience: "Before you take the listing",
    href: "/guides/condo-rules",
    items: [
      "Limited Review retired Aug 3, 2026",
      "Reserves rise to 15% Jan 4, 2027",
      "What to ask the HOA",
      "Why townhouses are different",
      "SB 326 balcony inspections",
    ],
  },
  {
    title: "Closing-Day Prep",
    description: "What to bring and what to expect at the closing table.",
    audience: "Send 3 days before closing",
    href: "/guides/closing-day",
    items: [
      "Bring a valid photo ID",
      "Wire funds or bring a cashier's check",
      "Review the Closing Disclosure",
      "Confirm the final walkthrough",
      "Set up utilities transfer",
    ],
  },
];

export type TeamMember = {
  name: string;
  role: string;
  nmls?: string; // individual MLO NMLS — leave blank to hide
  phone?: string; // direct line — falls back to the company phone if blank
  email?: string; // direct email — falls back to the company email if blank
  photo?: StaticImageData | ""; // headshot in /public/team; "" shows initials avatar
  bio: string;
};

/**
 * Crush Mortgage team (from crushmortgage.com/our-team).
 * Photos live in /public/team and are imported above so they get the
 * correct base-path-aware URL on export.
 */
export const team: TeamMember[] = [
  {
    name: "Shannon Daniele",
    role: "Loan Officer",
    nmls: "2332050",
    phone: "(562) 256-5779",
    email: "sdaniele@crushmortgage.com",
    photo: shannonPhoto,
    bio: "Founder of Crush Mortgage and a Long Beach mortgage broker who helps buyers and partner agents structure the right loan and get to the closing table with confidence.",
  },
  {
    name: "Josh Amescua",
    role: "Loan Officer",
    nmls: "1202316",
    phone: "(562) 688-3804",
    email: "jamescua@crushmortgage.com",
    photo: joshPhoto,
    bio: "Loan officer partnering with buyers and real-estate agents to make financing simple, fast, and clear from pre-approval through closing.",
  },
  {
    name: "Silvia Robles",
    role: "Loan Officer",
    nmls: "2323986",
    phone: "(562) 912-7769",
    email: "srobles@crushmortgage.com",
    photo: silviaPhoto,
    bio: "Mortgage professional guiding buyers through their loan options with care and clear communication every step of the way.",
  },
  {
    name: "Amraj Kaur",
    role: "Loan Officer",
    nmls: "2787571",
    phone: "(562) 416-5366",
    email: "amraj@crushmortgage.com",
    photo: amrajPhoto,
    bio: "Mortgage professional helping buyers and partner agents move from pre-approval to closing with confidence.",
  },
];

export const stats = [
  { value: "4", label: "Interactive tools" },
  { value: "6", label: "Loan programs explained" },
  { value: "100%", label: "Free for partner agents" },
  { value: "24/7", label: "Access, any device" },
];
