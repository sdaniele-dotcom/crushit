/**
 * CRUSH IT — Agent Suite
 * Central configuration.
 *
 * Pre-filled with Crush Mortgage details pulled from crushmortgage.com.
 * ▶ Double-check the values marked `// TODO` and swap in anything more
 *   specific (e.g. your individual MLO NMLS or real social URLs).
 *   Everything on the site reads from this one file.
 */

export const site = {
  brand: "CRUSH IT",
  tagline: "The Agent Suite by Crush Mortgage",
  // Home-page title used for search results and social cards. Leads with
  // the domain name so the page matches searches for Crush Your Market.
  seoTitle: "Crush Your Market — CRUSH IT Agent Suite by Crush Mortgage",
  shortDescription:
    "Crush Your Market is the CRUSH IT agent suite from Crush Mortgage: mortgage calculators, loan-program matching, open house kits, and co-branded marketing.",

  // ─── Company / loan-officer details ───────────────────────────────
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

  // Where "Book the content room" sends agents. Drop in a real scheduling
  // link (Calendly, Google Calendar appointments, etc.) to book studio time.
  // Defaults to the contact form until a scheduler is set up.
  contentRoomBookingUrl: "/about/#contact" as string,

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
