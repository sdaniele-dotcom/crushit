/**
 * What's a Payment
 * Central configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * TWO NAMES, AND THEY ARE NOT INTERCHANGEABLE.
 *
 *   `brand`    What's a Payment — the marketing name. Headlines, nav, SEO,
 *              webinars, anything selling the thing.
 *   `company`  Crush Mortgage — the LICENSED ENTITY, NMLS #169136.
 *
 * A mortgage advertisement has to identify the licensee. Every disclosure
 * line, flyer footer, PDF and "a loan officer will call you" sentence names
 * `company` for that reason, not out of habit — swapping those to the brand
 * would advertise credit under a name that is not registered with NMLS or the
 * CA DFPI. If "What's a Payment" is ever filed as a DBA, change `company`
 * here and it propagates; until then the split is deliberate.
 *
 * So: reach for `site.brand` when naming the product, `site.company` when
 * saying who is lending.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const site = {
  brand: "What's a Payment",
  tagline: "Know your number before you fall in love with a house",
  seoTitle: "What's a Payment — see the real monthly cost of any home",
  shortDescription:
    "Free webinars, honest numbers, and the real monthly payment on any home — "
    + "taxes, insurance and all. From the mortgage team at Crush Mortgage.",

  // ─── Company / loan-officer details ───────────────────────────────
  /** THE LICENSED ENTITY. Required on every mortgage advertisement. */
  company: "Crush Mortgage",
  loanOfficer: "Shannon Daniele",
  title: "Loan Officer",
  nmls: "2332050", // Shannon Daniele (individual MLO)
  companyNmls: "169136",
  phone: "(562) 317-6112",
  email: "info@crushmortgage.com",
  website: "https://www.crushmortgage.com",
  // Online mortgage application / pre-approval portal (Floify). Every
  // "apply / get pre-approved" button links here.
  applyUrl: "https://crushmortgage.floify.com/",
  // The public home of this site (custom domain). Used for canonical URLs,
  // Open Graph tags, the sitemap, and robots.txt.
  siteUrl: "https://crushyourmarket.com",
  address: "3750 Schaufele Ave, Suite 270A, Long Beach, CA 90808",

  // Where the contact / pre-approval form submits. Uses FormSubmit
  // (no account needed) to deliver leads straight to this inbox.
  // ▶ To change the destination, edit the email below. To hide the
  //   address, activate the form once and swap in the FormSubmit alias
  //   hash: https://formsubmit.co/ajax/<your-hash>
  formEndpoint: "https://formsubmit.co/ajax/sdaniele@crushmortgage.com" as string,

  // Backend that generates co-branded property flyers (the crushmortgage
  // Vercel app's public API). Agents' info + a listing are POSTed here.
  flyerApiBase: "https://crushmortgage.vercel.app" as string,

  // Down Payment Connect — the CRMLS-provided Down Payment Resource tool,
  // subscribed under Shannon and branded "provided by Shannon Daniele" on the
  // page itself. A buyer answers a few questions about the property, the
  // household and their income, and it returns the assistance programs they
  // may qualify for.
  //
  // Embedded rather than linked (see DownPaymentTool). Set to "" to take the
  // section down everywhere at once — the pages that use it check for that.
  downPaymentToolUrl:
    "https://www.workforce-resource.com/dpr/pmt/CRMLS/SHANNON_DANIELE" as string,

  // Dedicated "Book the content room" form endpoint. Uses FormSubmit so every
  // booking emails the address below — SEPARATE from the pre-approval lead form.
  // ▶ IMPORTANT: the first time a booking is submitted, FormSubmit sends a
  //   one-time activation email to this address — click the link in it once to
  //   turn on notifications. Change the email to reroute booking alerts.
  contentRoomFormEndpoint: "https://formsubmit.co/ajax/amraj@crushmortgage.com" as string,

  // Social links — set real URLs to make them appear in the footer.
  // Any value left as a "[...]" placeholder is hidden automatically.
  social: {
    facebook: "[https://facebook.com/...]",
    instagram: "[https://instagram.com/...]",
    linkedin: "[https://linkedin.com/in/...]",
  },
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Calculators", href: "/calculators" },
  { label: "Rent vs Own", href: "/rent-vs-own" },
  { label: "Loan Programs", href: "/loan-programs" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Leaderboard", href: "/leaderboard" },
];
