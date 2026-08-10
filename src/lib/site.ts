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
  title: "Founder & Mortgage Broker",
  nmls: "2332050", // Shannon Daniele (individual MLO)
  companyNmls: "169136",
  phone: "(562) 317-6112",
  email: "info@crushmortgage.com",
  website: "https://www.crushmortgage.com",
  address: "3750 Schaufele Ave, Suite 270A, Long Beach, CA 90808",

  // Optional: where the contact / pre-approval form should submit.
  // Drop in a Formspree ID, Getform URL, or your own endpoint.
  formEndpoint: "" as string, // e.g. "https://formspree.io/f/xxxxxxx"

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
  { label: "Resources", href: "/resources" },
  { label: "Co-Marketing", href: "/co-marketing" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];
