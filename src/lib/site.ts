/**
 * CRUSH IT — Realtors Suite
 * Central configuration.
 *
 * Pre-filled with Crush Mortgage details pulled from crushmortgage.com.
 * ▶ Double-check the values marked `// TODO` and swap in anything more
 *   specific (e.g. your individual MLO NMLS or real social URLs).
 *   Everything on the site reads from this one file.
 */

export const site = {
  brand: "CRUSH IT",
  tagline: "The Realtors Suite by Crush Mortgage",
  shortDescription:
    "A complete toolkit of calculators, loan guides, and co-marketing resources built to help realtors win more clients and close more deals.",

  // ─── Company / loan-officer details ───────────────────────────────
  company: "Crush Mortgage",
  loanOfficer: "Shannon Daniele",
  title: "Loan Officer",
  nmls: "2332050", // Shannon Daniele (individual MLO)
  companyNmls: "169136",
  phone: "(562) 317-6112",
  email: "info@crushmortgage.com",
  website: "https://www.crushmortgage.com",
  // The public home of this site (custom domain). Used for canonical URLs,
  // Open Graph tags, the sitemap, and robots.txt.
  siteUrl: "https://crushingitrealestate.com",
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
  { label: "Loan Programs", href: "/loan-programs" },
  { label: "Tools", href: "/tools" },
  { label: "Resources", href: "/resources" },
  { label: "Co-Marketing", href: "/co-marketing" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];
