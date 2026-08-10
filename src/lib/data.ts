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
    watchOut: "Higher credit scores unlock the best rates and lower PMI.",
  },
  {
    name: "FHA",
    slug: "fha",
    tagline: "Lower barrier to entry.",
    bestFor: "Buyers with lower credit or limited down payment.",
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
    bestFor: "Moderate-income buyers in eligible areas.",
    minDown: "0%",
    minCredit: "640",
    highlights: [
      "$0 down payment",
      "Below-market guarantee fees",
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

export type Resource = {
  title: string;
  description: string;
  audience: string;
  items: string[];
};

export const resources: Resource[] = [
  {
    title: "First-Time Buyer Roadmap",
    description:
      "A step-by-step walkthrough from 'thinking about it' to keys in hand.",
    audience: "Share with new buyers",
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
    description: "The 20 terms every buyer asks about, in plain English.",
    audience: "Reduce buyer anxiety",
    items: [
      "APR vs. interest rate",
      "Escrow & impound accounts",
      "PMI / MIP",
      "Points & buydowns",
      "Debt-to-income (DTI) ratio",
    ],
  },
  {
    title: "Closing-Day Prep",
    description: "What to bring and what to expect at the closing table.",
    audience: "Send 3 days before closing",
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
